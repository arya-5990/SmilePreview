import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { analyzeSmile, generateAfterSmile } from "../openai";
import "./AnalyzePage.css";

const STEPS = ["Photo", "Review", "Details", "Processing"];

export default function AnalyzePage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0); 
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analysis, setAnalysis] = useState(null); 
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [form, setForm] = useState({ name: "", number: "", email: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("");
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
        onDropRejected: () => setError("Please upload a valid image (JPG, PNG, WEBP — Max 10MB)."),
    });

    async function handleAnalyze() {
        if (!imageFile) return;
        setIsLoading(true);
        setLoadingMsg("Mapping facial geometry and structural baselines...");
        setError(null);
        try {
            const base64 = await fileToBase64(imageFile);
            const result = await analyzeSmile(base64, imageFile.type);
            setAnalysis(result);
            setSelectedTreatments(result.treatments);
            setCurrentStep(1);
        } catch (err) {
            console.error(err);
            setError("Assessment failed. Please provide a clearer, evenly lit image.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleProceedToForm() {
        setCurrentStep(2);
    }

    function toggleTreatment(t) {
        setSelectedTreatments((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
        );
    }

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!form.number.trim()) errs.number = "Phone number is required";
        else if (!/^\+?[\d\s\-]{7,15}$/.test(form.number.trim())) errs.number = "Enter a valid phone number";
        if (!form.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email";
        if (selectedTreatments.length === 0) errs.treatments = "Please select at least one focal point";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setCurrentStep(3);
        setIsLoading(true);
        setError(null);

        try {
            setLoadingMsg("Establishing secure connection...");
            const storageRef = ref(storage, `smiles/${Date.now()}_${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            const originalImageUrl = await getDownloadURL(storageRef);

            setLoadingMsg("Rendering visual enhancements...");
            const imageBlob = await generateAfterSmile(imageFile, selectedTreatments);

            setLoadingMsg("Finalizing high-fidelity portrait...");
            const genRef = ref(storage, `generated/${Date.now()}_after.png`);
            await uploadBytes(genRef, imageBlob);
            const afterSmileUrl = await getDownloadURL(genRef);

            setLoadingMsg("Encrypting assessment details...");
            const docRef = await addDoc(collection(db, "consultations"), {
                name: form.name.trim(),
                phone: form.number.trim(),
                email: form.email.trim(),
                treatments: selectedTreatments,
                analysisSummary: analysis.summary,
                originalImageUrl,
                afterSmileUrl,
                createdAt: serverTimestamp(),
            });

            navigate("/result", {
                state: {
                    name: form.name.trim(),
                    treatments: selectedTreatments,
                    analysisSummary: analysis.summary,
                    afterSmileUrl,
                    originalImageUrl,
                    docId: docRef.id,
                },
            });
        } catch (err) {
            console.error(err);
            setError("We encountered an issue processing your portrait. Please try again.");
            setCurrentStep(2);
        } finally {
            setIsLoading(false);
        }
    }

    function handleFormChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }

    return (
        <main className="analyze-page">
            <div className="progress-bar-wrap">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`progress-step ${i <= currentStep ? "active" : ""} ${i < currentStep ? "done" : ""}`}>
                            <div className="progress-step__dot">
                                {i < currentStep ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <span>{i + 1}</span>
                                )}
                            </div>
                            <span className="progress-step__label">{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`progress-line ${i < currentStep ? "done" : ""}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="analyze-container">
                {/* ────────────── STEP 0: UPLOAD ────────────── */}
                {currentStep === 0 && (
                    <div className="step-panel">
                        <div className="step-panel__header">
                            <h1 className="step-panel__title">Initiate Assessment</h1>
                            <p className="step-panel__desc">
                                Please provide a clear, front-facing portrait to ensure mapping precision.
                            </p>
                        </div>

                        {!imagePreview ? (
                            <div
                                {...getRootProps()}
                                className={`dropzone ${isDragActive ? "dropzone--active" : ""}`}
                            >
                                <input {...getInputProps()} />
                                <div className="dropzone__icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="12" y1="8" x2="12" y2="16"/>
                                        <line x1="8" y1="12" x2="16" y2="12"/>
                                    </svg>
                                </div>
                                <p className="dropzone__title">
                                    {isDragActive ? "Release to capture" : "Upload your portrait"}
                                </p>
                                <p className="dropzone__sub">Drag & drop or click to browse · Secure & Private</p>
                                <button
                                    type="button"
                                    className="btn btn--primary"
                                    style={{ marginTop: "24px", pointerEvents: "none" }}
                                >
                                    Select Image
                                </button>
                            </div>
                        ) : (
                            <div className="image-preview-wrap">
                                <img src={imagePreview} alt="Portrait subject" className="image-preview" />
                                <div className="image-preview__actions">
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                                    >
                                        Retake Photo
                                    </button>
                                    <button
                                        className="btn btn--primary"
                                        onClick={handleAnalyze}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Proceed to Mapping
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                                {isLoading && <p className="loading-status-text">{loadingMsg}</p>}
                            </div>
                        )}
                        {error && <p className="error-msg">{error}</p>}
                    </div>
                )}

                {/* ────────────── STEP 1: ANALYSIS RESULT ────────────── */}
                {currentStep === 1 && analysis && (
                    <div className="step-panel">
                        <div className="step-panel__header">
                            <h1 className="step-panel__title">Clinical Assessment</h1>
                            <p className="step-panel__desc">Review the structural insights derived from your portrait.</p>
                        </div>

                        <div className="analysis-layout">
                            <div className="analysis-image-col">
                                <img src={imagePreview} alt="Portrait subject" className="analysis-thumb" />
                                <div className="ai-badge">
                                    <span className="badge-indicator"></span> Mapped successfully
                                </div>
                            </div>

                            <div className="analysis-content-col">
                                <div className="analysis-summary glass-card">
                                    <h3 className="analysis-summary__title">Visual Baseline</h3>
                                    <p className="analysis-summary__text">{analysis.summary}</p>
                                </div>

                                <div className="treatments-section">
                                    <h3 className="treatments-title">Identified Focal Points</h3>
                                    <p className="treatments-subtitle">Deselect items you wish to exclude from the preview.</p>
                                    <div className="treatments-grid">
                                        {analysis.treatments.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`treatment-chip ${selectedTreatments.includes(t) ? "selected" : ""}`}
                                                onClick={() => toggleTreatment(t)}
                                            >
                                                <span className="chip-check">
                                                    {selectedTreatments.includes(t) ? "✓" : "+"}
                                                </span>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button className="btn btn--ghost" onClick={() => setCurrentStep(0)}>
                                ← Back
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleProceedToForm}
                                disabled={selectedTreatments.length === 0}
                            >
                                Confirm & Continue
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ────────────── STEP 2: FORM ────────────── */}
                {currentStep === 2 && (
                    <div className="step-panel">
                        <div className="step-panel__header">
                            <h1 className="step-panel__title">Final Details</h1>
                            <p className="step-panel__desc">
                                Provide your contact information so an expert can prepare your consultation.
                            </p>
                        </div>

                        <div className="form-layout">
                            <div className="form-treatments-summary glass-card">
                                <h3 className="summary-title">Selected Focus</h3>
                                <ul className="summary-list">
                                    {selectedTreatments.map((t) => (
                                        <li key={t} className="summary-item">
                                            <span className="summary-check">✓</span>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    style={{ marginTop: "16px", padding: '8px 16px', fontSize: '0.85rem' }}
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Modify Focus
                                </button>
                            </div>

                            <form className="patient-form" onSubmit={handleSubmit} noValidate>
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className={`form-input ${errors.name ? "form-input--error" : ""}`}
                                        placeholder="e.g. Elena Ramirez"
                                        value={form.name}
                                        onChange={handleFormChange}
                                    />
                                    {errors.name && <span className="form-error">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="number" className="form-label">Phone Reference</label>
                                    <input
                                        id="number"
                                        name="number"
                                        type="tel"
                                        className={`form-input ${errors.number ? "form-input--error" : ""}`}
                                        placeholder="e.g. +1 415 555 0198"
                                        value={form.number}
                                        onChange={handleFormChange}
                                    />
                                    {errors.number && <span className="form-error">{errors.number}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Private Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className={`form-input ${errors.email ? "form-input--error" : ""}`}
                                        placeholder="e.g. target@domain.com"
                                        value={form.email}
                                        onChange={handleFormChange}
                                    />
                                    {errors.email && <span className="form-error">{errors.email}</span>}
                                </div>

                                {errors.treatments && (
                                    <p className="error-msg">{errors.treatments}</p>
                                )}

                                {error && <p className="error-msg">{error}</p>}

                                <button
                                    type="submit"
                                    className="btn btn--primary btn--full"
                                    disabled={isLoading}
                                    style={{ marginTop: '12px' }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner" />
                                            {loadingMsg}
                                        </>
                                    ) : (
                                        <>
                                            Generate Portfolio
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                <p className="form-privacy">
                                    Processed under heavy encryption guidelines. Your data is strictly confidential.
                                </p>
                            </form>
                        </div>
                    </div>
                )}

                {/* ────────────── STEP 3: GENERATING ────────────── */}
                {currentStep === 3 && (
                    <div className="step-panel generating-panel">
                        <div className="generating-animation">
                            <div className="gen-ring" />
                            <div className="gen-orb" />
                        </div>
                        <h1 className="step-panel__title" style={{ marginTop: "40px" }}>
                            Rendering Portrait
                        </h1>
                        <p className="step-panel__desc">{loadingMsg || "Synchronizing structural modifications..."}</p>
                        
                        <div className="gen-steps">
                            {["Connecting to endpoint", "Applying visual transformations", "Finalizing high-fidelity image"].map((s, i) => (
                                <div key={s} className="gen-step">
                                    <span className="gen-step__dot" style={{ animationDelay: `${i * 0.4}s` }} />
                                    {s}
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div style={{ marginTop: "24px" }}>
                                <p className="error-msg">{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
