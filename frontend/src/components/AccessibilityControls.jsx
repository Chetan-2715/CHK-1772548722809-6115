import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Sun, Moon, Settings, Globe } from 'lucide-react';
import './AccessibilityControls.css';
import { useTranslation } from 'react-i18next';

const AccessibilityControls = () => {
    const {
        theme, setTheme,
        speakText,
        setLanguage
    } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const cycleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
    };

    const cycleLanguage = () => {
        const langs = ['en', 'hi', 'mr'];
        const currentIdx = langs.indexOf(i18n.language) >= 0 ? langs.indexOf(i18n.language) : 0;
        const nextLang = langs[(currentIdx + 1) % langs.length];
        setLanguage(nextLang);
    };

    return (
        <div className={`accessibility-controls ${isOpen ? 'open' : ''}`}>
            <button
                className="btn-floating a11y-toggle"
                onClick={togglePanel}
                aria-label="Toggle Accessibility Menu"
            >
                <Settings size={28} className="spin-slow" />
            </button>

            <div className="a11y-panel card card-glass">
                <h3><Settings size={20} /> {t('a11y.options') || 'Quick Settings'}</h3>

                <div className="a11y-grid">
                    {/* Theme */}
                    <button
                        className="a11y-btn hover-grow"
                        onClick={cycleTheme}
                    >
                        {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                        <span>{theme === 'light' ? (t('a11y.light') || 'Light') : (t('a11y.dark') || 'Dark')}</span>
                    </button>

                    {/* Language Setting */}
                    <button
                        className="a11y-btn hover-grow whitespace-nowrap"
                        onClick={cycleLanguage}
                    >
                        <Globe size={24} />
                        <span>{t('a11y.language') || 'भाषा'}: {i18n.language.toUpperCase()}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityControls;
