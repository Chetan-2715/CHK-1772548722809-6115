import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Type, Sun, Moon, Contrast, Volume2, VolumeX, Settings, Globe } from 'lucide-react';
import './AccessibilityControls.css';
import { useTranslation } from 'react-i18next';

const AccessibilityControls = () => {
    const {
        theme, setTheme,
        fontSize, setFontSize,
        voiceEnabled, setVoiceEnabled,
        speakText
    } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const togglePanel = () => {
        setIsOpen(!isOpen);
        if (!isOpen) speakText("Accessibility Settings Opened");
    };

    const cycleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : (theme === 'dark' ? 'high-contrast' : 'light');
        setTheme(nextTheme);
        speakText(`Theme changed to ${nextTheme}`);
    };

    const cycleFontSize = () => {
        const nextSize = fontSize === 'normal' ? 'large' : (fontSize === 'large' ? 'xlarge' : 'normal');
        setFontSize(nextSize);
        speakText(`Text size changed to ${nextSize}`);
    };

    const toggleVoice = () => {
        setVoiceEnabled(!voiceEnabled);
        if (!voiceEnabled) {
            // Small timeout to allow state to update before speaking
            setTimeout(() => speakText("Voice assistance enabled"), 100);
        }
    };

    const cycleLanguage = () => {
        const langs = ['en', 'hi', 'mr'];
        const currentIdx = langs.indexOf(i18n.language) >= 0 ? langs.indexOf(i18n.language) : 0;
        const nextLang = langs[(currentIdx + 1) % langs.length];
        i18n.changeLanguage(nextLang);
        speakText(`Language changed to ${nextLang === 'en' ? 'English' : nextLang === 'hi' ? 'Hindi' : 'Marathi'}`);
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
                <h3><Settings size={20} /> Accessibility Options</h3>

                <div className="a11y-grid">
                    {/* Text Size */}
                    <button
                        className="a11y-btn hover-grow"
                        onClick={cycleFontSize}
                        onMouseEnter={() => speakText("Change Text Size")}
                    >
                        <Type size={24} />
                        <span>Size: {fontSize}</span>
                    </button>

                    {/* Theme */}
                    <button
                        className="a11y-btn hover-grow"
                        onClick={cycleTheme}
                        onMouseEnter={() => speakText("Change Display Theme")}
                    >
                        {theme === 'light' && <Sun size={24} />}
                        {theme === 'dark' && <Moon size={24} />}
                        {theme === 'high-contrast' && <Contrast size={24} />}
                        <span>{theme.replace('-', ' ')}</span>
                    </button>

                    {/* Language Setting */}
                    <button
                        className="a11y-btn hover-grow whitespace-nowrap"
                        onClick={cycleLanguage}
                        onMouseEnter={() => speakText("Change Language")}
                    >
                        <Globe size={24} />
                        <span>{t('a11y.language')}: {i18n.language.toUpperCase()}</span>
                    </button>

                    {/* Voice Assistance */}
                    <button
                        className={`a11y-btn hover-grow ${voiceEnabled ? 'active' : ''}`}
                        onClick={toggleVoice}
                        onMouseEnter={() => speakText(voiceEnabled ? "Turn off Voice" : "Turn on Voice")}
                    >
                        {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        <span>Voice: {voiceEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityControls;
