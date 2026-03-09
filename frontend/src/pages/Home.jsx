import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { FileText, Camera, ScanLine, Clock, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import './Home.css';

const Home = () => {
    const { user, speakText } = useContext(AppContext);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <Badge text="Made for Seniors" icon={<HeartPulse size={12} />} />
                    <h1 className="hero-title">
                        Your Personal <span className="text-gradient">AI Medication Assistant</span>
                    </h1>
                    <p className="hero-subtitle">
                        Understand your prescriptions, verify your tablets, and never miss a dose.
                        Designed to be simple, clear, and easy to use.
                    </p>

                    <div className="hero-actions">
                        {!user ? (
                            <Link to="/login" className="btn btn-primary hero-btn">
                                Get Started <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/upload" className="btn btn-primary hero-btn" onMouseEnter={() => speakText("Scan a new prescription")}>
                                <Camera size={20} /> Scan Prescription
                            </Link>
                        )}
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="glass-mockup pulse-animation-slow">
                        <div className="mockup-header">
                            <ShieldCheck size={28} color="var(--success-color)" />
                            <span>Verified Safe</span>
                        </div>
                        <div className="mockup-body">
                            <div className="skeleton-line full"></div>
                            <div className="skeleton-line half"></div>
                            <div className="pill-container">
                                <div className="pill pulse-animation"></div>
                                <div className="pill-text">Paracetamol 500mg</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <h2 className="section-title text-center">How Medi-Scribe Helps You</h2>

                <div className="grid-3 mt-8">
                    <FeatureCard
                        to="/upload"
                        icon={<FileText size={40} className="feature-icon" />}
                        title="Read Prescriptions"
                        description="Take a photo of your doctor's handwriting. Our AI will read it and explain every medicine simply."
                        color="primary"
                    />

                    <FeatureCard
                        to="/scan"
                        icon={<ScanLine size={40} className="feature-icon" />}
                        title="Verify Medicine"
                        description="Not sure about a tablet? Scan its barcode or upload a picture to check if it's the right one."
                        color="secondary"
                    />

                    <FeatureCard
                        to="/reminders"
                        icon={<Clock size={40} className="feature-icon" />}
                        title="Smart Reminders"
                        description="Get notified when it's time to take your pills automatically via Google Calendar."
                        color="warning"
                    />
                </div>
            </section>
        </div>
    );
};

const Badge = ({ text, icon }) => (
    <div className="hero-badge animate-fade-in">
        {icon}
        <span>{text}</span>
    </div>
);

const FeatureCard = ({ icon, title, description, to, color }) => {
    const { speakText } = useContext(AppContext);

    return (
        <Link
            to={to}
            className={`card feature-card card-${color} animate-slide-up`}
            onMouseEnter={() => speakText(`Go to ${title}. ${description}`)}
        >
            <div className={`icon-wrapper wrapper-${color}`}>
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="card-arrow">
                <ArrowRight size={24} />
            </div>
        </Link>
    );
};

export default Home;
