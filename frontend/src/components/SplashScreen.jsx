import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ isVisible, onComplete }) => {
    const [showFadeOut, setShowFadeOut] = useState(false);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setShowFadeOut(true);
                setTimeout(onComplete, 600);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    return (
        <div className={`splash-screen ${showFadeOut ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <div className="splash-logo">
                    <img src="/favicon.ico" alt="Scan4Elders" />
                </div>
                <h1>Scan4Elders</h1>
                <p>AI Medication Assistant for Seniors</p>
                <div className="splash-loader">
                    <div className="loader-ring"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
