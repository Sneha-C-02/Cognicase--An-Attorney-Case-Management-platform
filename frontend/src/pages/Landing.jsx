import React from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Layout, ListChecks, FileText,
    Clock, BarChart3, ChevronRight, Scale,
    Briefcase, Globe, Users, Star
} from 'lucide-react';
import heroDashboard from '../assets/hero-dashboard.png';

const Landing = () => {
    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="container">
                    <div className="logo">
                        <Scale size={30} className="logo-icon" />
                        <span>CogniCase</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/login" className="btn-text">Log In</Link>
                        <Link to="/signup" className="btn btn-primary btn-glow landing-nav-cta">
                            Get Started Free <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-gradient-overlay" />
                <div className="container">
                    <div className="hero-grid">
                        {/* Left: Text */}
                        <div className="hero-content fade-in-up">
                            <div className="badge-premium">
                                <Star size={13} fill="currentColor" /> Trusted by 2,400+ legal professionals
                            </div>
                            <h1>
                                Smarter Case Management for{' '}
                                <span className="text-gradient">Modern Legal Teams.</span>
                            </h1>
                            <p className="hero-description">
                                CogniCase brings all your cases, tasks, clients, and documents into one
                                intelligent workspace — built exclusively for attorneys who demand precision.
                            </p>
                            <div className="hero-cta">
                                <Link to="/signup" className="btn btn-primary btn-lg btn-glow hover-elevate">
                                    Start Free Trial <ChevronRight size={20} />
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg hover-elevate">
                                    Member Login
                                </Link>
                            </div>
                            {/* Social proof row */}
                            <div className="hero-proof">
                                <div className="proof-avatars">
                                    {['S', 'M', 'J', 'R'].map((l, i) => (
                                        <div key={i} className="proof-avatar">{l}</div>
                                    ))}
                                </div>
                                <span className="proof-text">Joined by 2,400+ attorneys this month</span>
                            </div>
                        </div>

                        {/* Right: Real screenshot/illustration */}
                        <div className="hero-visual fade-in">
                            <div className="hero-img-wrap hover-elevate">
                                <img
                                    src={heroDashboard}
                                    alt="CogniCase Attorney Dashboard"
                                    className="hero-img"
                                />
                                {/* Floating badge */}
                                <div className="hero-float-badge top-right">
                                    <span className="float-dot active-dot" />
                                    <span>12 Active Cases</span>
                                </div>
                                <div className="hero-float-badge bottom-left">
                                    <Shield size={14} />
                                    <span>Bank-grade Encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <p className="section-eyebrow">Everything you need</p>
                        <h2 className="section-title">A Unified Legal OS</h2>
                        <p className="section-subtitle">Precision tools for every stage of the legal lifecycle.</p>
                    </div>
                    <div className="feature-grid-premium">
                        {[
                            { icon: <Layout size={26} />, title: 'Case Tracking', desc: 'Global oversight of your entire caseload with real-time progress indicators and status management.' },
                            { icon: <ListChecks size={26} />, title: 'Task Management', desc: 'Automated deadline tracking and priority queues tailored for legal teams. Never miss a filing.' },
                            { icon: <FileText size={26} />, title: 'Document Engine', desc: 'Secure vault for firm-wide document sharing and matter-specific organisation.' },
                            { icon: <Clock size={26} />, title: 'Activity Timeline', desc: 'Full audit trails and chronological breakdown of every case interaction.' },
                            { icon: <BarChart3 size={26} />, title: 'Practice Analytics', desc: 'Beautiful data visualisations to track performance, case distribution, and outcomes.' },
                            { icon: <Shield size={26} />, title: 'Secure Access', desc: 'OTP-based authentication and encrypted storage to protect client confidentiality.' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="feature-card-premium glass hover-elevate">
                                <div className="icon-box violet">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="trust-section">
                <div className="container text-center">
                    <p className="trust-heading">Trusted by leading law firms and independent practices worldwide</p>
                    <div className="trust-logos">
                        {[
                            { icon: <Scale size={20} />, name: 'Elite Law Partners' },
                            { icon: <Briefcase size={20} />, name: 'Global Associates' },
                            { icon: <Globe size={20} />, name: 'Justice Network' },
                            { icon: <Users size={20} />, name: 'Counsel Collective' },
                        ].map(({ icon, name }) => (
                            <div key={name} className="logo-mute">
                                {icon} <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-banner">
                <div className="container text-center">
                    <h2>Ready to modernise your practice?</h2>
                    <p>Join thousands of legal professionals using CogniCase to run sharper, faster, smarter.</p>
                    <Link to="/signup" className="btn btn-primary btn-lg btn-glow hover-elevate" style={{ marginTop: '2rem', display: 'inline-flex' }}>
                        Start Free — No Credit Card Required <ChevronRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="logo">
                                <Scale size={22} className="logo-icon" />
                                <span>CogniCase</span>
                            </div>
                            <p>Transforming legal strategy through intelligent management.</p>
                        </div>
                        <div className="footer-legal">
                            <span>© {new Date().getFullYear()} CogniCase SaaS. All rights reserved.</span>
                            <div className="footer-links-inline">
                                <Link to="#">Privacy Policy</Link>
                                <Link to="#">Terms of Service</Link>
                                <Link to="#">Security</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
