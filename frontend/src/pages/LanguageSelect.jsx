import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import i18n from '../i18n';
import './LanguageSelect.css';

const LanguageSelect = () => {
    const navigate = useNavigate();
    const { setLanguage } = useContext(AppContext);
    const [selectedLang, setSelectedLang] = useState('en');

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    ];

    const handleLanguageSelect = async (langCode) => {
        setSelectedLang(langCode);
        await i18n.changeLanguage(langCode);
        setLanguage(langCode);
        localStorage.setItem('language', langCode);
        setTimeout(() => {
            navigate('/login');
        }, 300);
    };

    return (
        <div className="language-select-container">
            <div className="language-select-card">
                <div className="language-header">
                    <h1>Choose Your Language</h1>
                    <p>अपनी भाषा चुनें | உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்</p>
                </div>

                <div className="language-grid">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-button ${selectedLang === lang.code ? 'active' : ''}`}
                            onClick={() => handleLanguageSelect(lang.code)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                        </button>
                    ))}
                </div>

                <div className="language-footer">
                    <p>You can change your language preference anytime in Settings</p>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelect;
