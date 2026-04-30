import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { FileText, Camera, ScanLine, Clock, ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Home.css';

const Home = () => {
    const { user, speakText } = useContext(AppContext);
    const { t } = useTranslation();

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <Badge text={t('home.badge')} icon={<HeartPulse size={12} />} />
                    <h1 className="hero-title">
                        {t('home.title_prefix')} <span className="text-gradient">{t('home.title_highlight')}</span>
                    </h1>
                    <p className="hero-subtitle">
                        {t('home.subtitle')}
                    </p>

                    <div className="hero-actions">
                        {!user ? (
                            <Link to="/login" className="btn btn-primary hero-btn">
                                {t('home.get_started')} <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/upload" className="btn btn-primary hero-btn" onMouseEnter={() => speakText(t('home.scan_new'))}>
                                <Camera size={20} /> {t('home.scan_new')}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="glass-mockup">
                        <div className="mockup-header">
                            <ShieldCheck size={28} color="var(--success-color)" />
                            <span>{t('home.verified_safe')}</span>
                        </div>
                        <div className="mockup-body">
                            <div className="skeleton-line full"></div>
                            <div className="skeleton-line half"></div>
                            <div className="pill-container">
                                <div className="pill"></div>
                                <div className="pill-text">{t('home.sample_pill')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <h2 className="section-title text-center" style={{ fontWeight: 900 }}>{t('home.how_it_helps')}</h2>

                <div className="features-grid mt-12">
                    <FeatureCard
                        to="/upload"
                        icon={<FileText size={40} className="feature-icon" />}
                        title={t('home.read')}
                        description={t('home.read_desc')}
                        color="primary"
                    />

                    <FeatureCard
                        to="/scan"
                        icon={<ScanLine size={40} className="feature-icon" />}
                        title={t('app.scan_medicine')}
                        description={t('home.identify_desc')}
                        color="secondary"
                    />



                    <FeatureCard
                        to="/"
                        icon={<Clock size={40} className="feature-icon" />}
                        title={t('home.reminders')}
                        description={t('home.reminders_desc')}
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
