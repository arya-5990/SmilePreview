# Smile Preview ✦

> Smile Preview is a premium AI-powered clinical assessment tool that maps facial geometry and visualizes personalized dental outcomes. Features a frictionless image upload, automated structural analysis, and instant high-fidelity smile simulations formatted within a beautifully crafted, elegant UI.

![Preview Cover](./public/hero-cover.jpg) <!-- Update with actual preview image path later -->

## 🌟 Features

- **Pristine, Human-designed UI:** A stunning light-themed, high-contrast user interface that focuses on a premium editorial aesthetic. Handcrafted variables, clean animations, and sophisticated SVG icons replace generic mockups and emojis.
- **Intelligent Facial Mapping:** Secure, drag-and-drop file upload to instantly capture portraits and map baseline structural aspects in mere seconds.
- **Custom Dental Layouts & Insights:** Auto-generates a detailed dental assessment, summarizing visual focal points and recommended treatment blueprints dynamically pulled via OpenAI's GPT models.
- **AI-Driven High-Fidelity Rendering:** Utilizes advanced AI image generation (OpenAI DALL-E) to produce robust, conceptual post-treatment visual outcomes tailored to selected focal points.
- **Exportable PDF Plans:** Seamlessly format and download customized clinical reports directly to PDF for offline reference. 
- **Highly Secure and Fast Storage:** Client profiles and images are safely encrypted and hosted through Google Firebase Firestore and Cloud Storage.

## 🔐 Google OAuth Verification Compliance
This project is fully structured to meet the strict requirements for **Google Cloud Trust & Safety OAuth Consent Verification**. 
- The App Name strictly matches **SmilePreview** across the homepage title and global interfaces.
- Separate, functional `privacy.html` and `terms.html` legal documents are hosted on the public root.
- A global footer is implemented to make these links visible from any site entry point.

## 🛠️ Technology Stack
- **Framework:** React.js / Vite 
- **Routing:** React Router DOM
- **Cloud Database / Storage:** Firebase (Firestore, Storage) 
- **AI Integrations:** OpenAI API
- **Styling:** Vanilla CSS3 (Custom Variables / Component-scoped CSS)
- **Deployment:** Vercel (recommended)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
Make sure you have Node.js installed, along with either npm, pnpm, or yarn.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/smile-preview.git
cd smile-preview
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up Environment Variables
Create a \`.env\` (or \`.env.local\`) file in the root directory. You will need your Firebase configuration and an OpenAI API key.

\`\`\`env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# OpenAI integration
VITE_OPENAI_API_KEY=your_openai_api_key
\`\`\`

*Note: Ensure your `src/firebase.js` and `src/openai.js` files map appropriately to these variables.*

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Navigate to `http://localhost:5173` in your browser.

---

## 🎨 Design Philosophy
The recent pivot in design focuses on removing generic AI-styled templates in favor of a **hand-crafted, editorial, and clinical aesthetic**.
* **Soft Light Theme:** `var(--bg-primary)` emphasizes clinical clarity.
* **Refined Typography:** Headers rely on `Playfair Display` or rich variants to drive aspirational narratives, whilst body text leverages sharp, functional `Inter`.
* **Subtle Micro-interactions:** Buttons glow on hover, image skeletons simulate processing natively, and smooth `fadeInUp` transitions give life to the assessment flow.

## 📄 License
MIT License. See `LICENSE` for more information.
