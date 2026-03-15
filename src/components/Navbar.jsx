import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <Link to="/" className="navbar__brand">
                <span className="navbar__logo-icon">✦</span>
                <span>
                    <span className="navbar__brand-smile">Smile</span>
                    <span className="navbar__brand-preview"> Preview</span>
                </span>
            </Link>
            <div className="navbar__links">
                <Link to="/" className={`navbar__link ${location.pathname === "/" ? "active" : ""}`}>
                    Home
                </Link>
                <Link
                    to="/analyze"
                    className={`navbar__link navbar__cta ${location.pathname === "/analyze" ? "active" : ""}`}
                >
                    Begin Assessment
                </Link>
            </div>
        </nav>
    );
}
