import React from 'react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">SmilePreview</span>
                    <p className="footer-tagline">Visualize your personalized dental outcome.</p>
                </div>
                <div className="footer-links">
                    <a href="/privacy.html" target="_blank" rel="noreferrer" className="footer-link">Privacy Policy</a>
                    <a href="/terms.html" target="_blank" rel="noreferrer" className="footer-link">Terms of Service</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SmilePreview. All rights reserved.</p>
            </div>
        </footer>
    );
}
