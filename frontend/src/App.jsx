import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AccessibilityControls from './components/AccessibilityControls';
import Home from './pages/Home';
import Login from './pages/Login';
import UploadPrescription from './pages/UploadPrescription';
import ScanMedicine from './pages/ScanMedicine';
import VerifyTablet from './pages/VerifyTablet';
import Reminders from './pages/Reminders';
import MedicineHistory from './pages/MedicineHistory';

// Context for user state and accessibility
export const AppContext = React.createContext();

function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light'); // light, dark, high-contrast
    const [fontSize, setFontSize] = useState('normal'); // normal, large, xlarge
    const [voiceEnabled, setVoiceEnabled] = useState(false);

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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const contextValue = {
        user,
        login,
        logout,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        voiceEnabled,
        setVoiceEnabled,
        speakText
    };

    return (
        <AppContext.Provider value={contextValue}>
            <BrowserRouter>
                <div className="app-container">
                    <Navbar />
                    <AccessibilityControls />
                    <main className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/upload" element={user ? <UploadPrescription /> : <Navigate to="/login" />} />
                            <Route path="/scan" element={user ? <ScanMedicine /> : <Navigate to="/login" />} />
                            <Route path="/verify" element={user ? <VerifyTablet /> : <Navigate to="/login" />} />
                            <Route path="/history" element={user ? <MedicineHistory /> : <Navigate to="/login" />} />
                            <Route path="/reminders" element={user ? <Reminders /> : <Navigate to="/login" />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
