import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import i18n from './i18n';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import UploadPrescription from './pages/UploadPrescription';
import ScanMedicine from './pages/ScanMedicine';
import MedicineHistory from './pages/MedicineHistory';
import Profile from './pages/Profile';
import Privacy from './pages/Privacy';
import SelectConcern from './pages/SelectConcern';
import Dashboard from './pages/Dashboard';


// Context for user state and accessibility
export const AppContext = React.createContext();

function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light'); // light, dark, high-contrast
    const [fontSize, setFontSize] = useState('normal'); // normal, large, xlarge
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Check local storage for user and settings
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) setTheme(storedTheme);

        const storedFontSize = localStorage.getItem('fontSize');
        if (storedFontSize) setFontSize(storedFontSize);

        const storedVoice = localStorage.getItem('voiceEnabled');
        if (storedVoice) setVoiceEnabled(storedVoice === 'true');

        const storedLang = localStorage.getItem('language');
        if (storedLang) {
            setLanguage(storedLang);
            i18n.changeLanguage(storedLang);
        }
    }, []);

    // Update DOM when accessibility settings change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-fontsize', fontSize);
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('voiceEnabled', voiceEnabled);
    }, [theme, fontSize, voiceEnabled]);

    // Global TTS function
    const speakText = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const maxRetries = 3;
        let attempts = 0;

        const trySpeak = () => {
            attempts++;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for seniors
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Try to find a clear voice
                const englishVoices = voices.filter(v => v.lang.startsWith('en'));
                utterance.voice = englishVoices[0] || voices[0];
                window.speechSynthesis.speak(utterance);
            } else if (attempts < maxRetries) {
                // Voices not loaded yet, wait and retry
                setTimeout(trySpeak, 100);
            } else {
                // Fallback
                window.speechSynthesis.speak(utterance);
            }
        };

        trySpeak();
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token); // Assume returned in userData
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const contextValue = {
        user,
        login,
        logout,
        updateUser,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        voiceEnabled,
        setVoiceEnabled,
        speakText,
        language,
        setLanguage: (lang) => {
            setLanguage(lang);
            localStorage.setItem('language', lang);
            i18n.changeLanguage(lang);
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <BrowserRouter>
                <div className="app-container">
                    <Navbar />
                    <main className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                        <Routes>
                            <Route path="/" element={user ? <Dashboard /> : <Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/upload" element={user ? <UploadPrescription /> : <Navigate to="/login" />} />
                            <Route path="/scan" element={user ? <ScanMedicine /> : <Navigate to="/login" />} />
                            <Route path="/history" element={user ? <MedicineHistory /> : <Navigate to="/login" />} />
                            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/select-concern" element={user ? <SelectConcern /> : <Navigate to="/login" />} />
                        </Routes>
                    </main>

                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
