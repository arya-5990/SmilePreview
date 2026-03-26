// ─── AI Services ──────────────────────────────────────────────────────────────
// Vision Analysis  → Groq  (Llama 4 Scout Vision)      — Free
// Image Editing    → Gemini (gemini-3-pro-image-preview)      — Google AI credits
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
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
        ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent"
        : `${window.location.origin}/gemini/v1beta/models/gemini-3-pro-image-preview:generateContent`;

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
                                text: `You are an expert dental cosmetic image editor. Your task is to apply these treatments: ${treatmentList}, to the teeth in this photo.

STRICT PHOTOREALISM RULES:
1. PRESERVE ORIGINALITY: Keep the person's face, skin texture, pores, blemishes, lighting, gender, age, eyes, hair, nose, and lips EXACTLY the same.
2. NO AI SMOOTHING: Absolutely NO airbrushing, plastic-looking skin, or "CGI" aesthetic. Maintain the raw, original photographic quality (like a mobile phone camera). 
3. NATURAL TEETH: Make the teeth look naturally white, healthy, and straight, but avoid "glowing" unrealistic over-whitening. The lighting on the teeth must match the rest of the face.
4. Output the full edited portrait image. Be invisible; the edit must look 100% real.`,
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
