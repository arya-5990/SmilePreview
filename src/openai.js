// ─── AI Services ──────────────────────────────────────────────────────────────
// Vision Analysis  → Groq  (Llama 4 Scout Vision)      — Free
// Image Editing    → Gemini (gemini-2.0-flash-exp)      — Google AI credits
// ──────────────────────────────────────────────────────────────────────────────
import OpenAI from "openai";

const groq = new OpenAI({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseURL: import.meta.env.PROD ? "https://api.groq.com/openai/v1" : `${window.location.origin}/groq/openai/v1`,
    dangerouslyAllowBrowser: true,
});

/**
 * Analyzes a smile image using Groq's Llama 4 Scout Vision model (free tier).
 * @param {string} base64Image - Base64-encoded image string (without data URI prefix)
 * @param {string} mimeType - MIME type of the image (e.g., "image/jpeg")
 * @returns {Promise<{ summary: string, treatments: string[] }>}
 */
export async function analyzeSmile(base64Image, mimeType = "image/jpeg") {
    const response = await groq.chat.completions.create({
        model: "llama-3.2-90b-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `You are a professional dental consultant AI. Analyze this smile photo and recommend the most appropriate cosmetic/orthodontic treatments.
Always respond with ONLY valid JSON in this exact format:
{
  "summary": "A 2-3 sentence kind, professional assessment of the smile.",
  "treatments": ["Treatment 1", "Treatment 2", "Treatment 3"]
}
Choose 2-4 treatments from this list only:
- Professional Teeth Whitening
- Dental Braces (Traditional)
- Clear Aligners (Invisalign)
- Dental Veneers
- Composite Bonding
- Gum Contouring
- Dental Crowns
- Teeth Cleaning & Polishing
- Smile Makeover Consultation
- Tooth Gap Closure

Be encouraging and professional. Respond with ONLY the JSON object, no markdown.`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`,
                        },
                    },
                ],
            },
        ],
        max_tokens: 500,
        temperature: 0.4,
    });

    const content = response.choices[0].message.content.trim();
    const jsonStr = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(jsonStr);
}

/**
 * Generates an "after treatment" smile image using Google Gemini image editing.
 * Transforms the SAME person's teeth while keeping their face identical.
 * Uses gemini-2.0-flash-exp with image-to-image editing via Vite proxy (CORS safe).
 * @param {File} imageFile - The original uploaded smile image file
 * @param {string[]} treatments - Array of recommended treatment names
 * @returns {Promise<Blob>} - PNG image blob (caller uploads to Firebase Storage)
 */
export async function generateAfterSmile(imageFile, treatments) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const treatmentList = treatments.join(", ");

    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);

    const geminiUrl = import.meta.env.PROD
        ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        : `${window.location.origin}/gemini/v1beta/models/gemini-2.0-flash-exp:generateContent`;

    const response = await fetch(
        geminiUrl,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `You are a dental image editor. Transform ONLY the teeth in this photo to show the result after receiving these treatments: ${treatmentList}.

STRICT RULES:
- Keep the person's face, skin tone, gender, age, eyes, hair, nose, lips EXACTLY the same
- Only change the teeth: make them perfectly white, straight, well-aligned, and healthy-looking
- Do NOT change anything else in the image
- Output the full edited portrait image`,
                            },
                            {
                                inlineData: {
                                    mimeType: imageFile.type || "image/jpeg",
                                    data: base64Image,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    responseModalities: ["IMAGE", "TEXT"],
                },
            }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini image edit failed (${response.status}): ${errText}`);
    }

    const json = await response.json();

    // Extract the image part from Gemini's response
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart) {
        throw new Error("Gemini did not return an image. Try a different photo.");
    }

    const b64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const byteChars = atob(b64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteArr[i] = byteChars.charCodeAt(i);
    }
    return new Blob([byteArr], { type: mimeType });
}

// ── Helper ──────────────────────────────────────────────────────────────────
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
