import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const processSteps = [
    {
        step: "01",
        title: "Submit a Portrait",
        desc: "Provide a clear, front-facing photograph. Our secure server handles the rest with absolute privacy.",
    },
    {
        step: "02",
        title: "Clinical Mapping",
        desc: "Advanced imaging technology maps your dental structure, establishing a baseline for aesthetic enhancement.",
    },
    {
        step: "03",
        title: "Your New Look",
        desc: "Receive a high-fidelity visual preview of your enhanced smile, paired with a specialist consultation.",
    },
];

export default function HomePage() {
    return (
        <main className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero__content">
                    <div className="hero__badge">
                        Premium Aesthetic Preview
                    </div>
                    <h1 className="hero__title">
                        SmilePreview
                    </h1>
                    <p className="hero__subtitle" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        Envision your finest smile.
                    </p>
                    <p className="hero__subtitle">
                        Experience the exceptional before you commit. We utilize state-of-the-art clinical imaging to provide a realistic preview of your potential dental transformation.
                    </p>
                    <div className="hero__actions">
                        <Link to="/analyze" className="btn btn--primary">
                            Begin Assessment
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <a href="#process" className="btn btn--ghost">
                            Discover How
                        </a>
                    </div>
                </div>

                <div className="hero__visual">
                    <div className="hero__image-wrapper">
                        <img 
                            src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800" 
                            alt="Beautiful natural smile" 
                            className="hero__image"
                        />
                        <div className="floating-card glass-card">
                            <span className="floating-card__label">Precision</span>
                            <span className="floating-card__value">99%</span>
                            <span className="floating-card__desc">Mapping Accuracy</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Editorial Highlight */}
            <section className="editorial-info">
                <div className="editorial-card glass-card">
                    <h2 className="editorial-title">Clarity in Every Detail</h2>
                    <p className="editorial-desc">
                        True aesthetic dentistry begins with visualization. By combining sophisticated AI mapping with clinical principles, we remove the guesswork from your smile journey.
                    </p>
                </div>
            </section>

            {/* Process Section */}
            <section className="process" id="process">
                <div className="section-header">
                    <p className="section-eyebrow">The Experience</p>
                    <h2 className="section-title">Refined & Transparent</h2>
                </div>
                <div className="process-grid">
                    {processSteps.map((step, i) => (
                        <div key={i} className="process-item glass-card">
                            <div className="process-item__header">
                                <span className="process-item__number">{step.step}</span>
                            </div>
                            <h3 className="process-item__title">{step.title}</h3>
                            <p className="process-item__desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-section__inner glass-card">
                    <h2 className="cta-section__title">
                        Ready to see your <span className="gradient-text">new look?</span>
                    </h2>
                    <p className="cta-section__desc">
                        A personalized aesthetic assessment awaits you. Discover your potential today.
                    </p>
                    <Link to="/analyze" className="btn btn--primary btn--lg">
                        Start Your Journey
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </section>
        </main>
    );
}
