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
import RoleSelection from './pages/RoleSelection';
import BlindAssistant from './pages/BlindAssistant';
import BookAppointment from './pages/BookAppointment';
import DoctorPortal from './pages/DoctorPortal';
import OrgDashboard from './pages/OrgDashboard';
import Pricing from './pages/Pricing';

// Context for user state and accessibility
export const AppContext = React.createContext();

function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('normal');
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

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

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-fontsize', fontSize);
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('voiceEnabled', voiceEnabled);
    }, [theme, fontSize, voiceEnabled]);

    const speakText = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const maxRetries = 3;
        let attempts = 0;
        const trySpeak = () => {
            attempts++;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const englishVoices = voices.filter(v => v.lang.startsWith('en'));
                utterance.voice = englishVoices[0] || voices[0];
                window.speechSynthesis.speak(utterance);
            } else if (attempts < maxRetries) {
                setTimeout(trySpeak, 100);
            } else {
                window.speechSynthesis.speak(utterance);
            }
        };
        trySpeak();
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // Support both token field names from different endpoints
        localStorage.setItem('token', userData.access_token || userData.token || '');
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

    // Role-based default route after login
    const getRoleHome = () => {
        if (!user) return <Home />;
        const role = user.role || 'patient';
        if (role === 'doctor') return <Navigate to="/doctor-portal" />;
        if (role === 'org_admin') return <Navigate to="/org-dashboard" />;
        return <Dashboard />;
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
                            {/* Root — role-based redirect */}
                            <Route path="/" element={user ? getRoleHome() : <Home />} />

                            {/* Public routes */}
                            <Route path="/role-selection" element={<Navigate to="/login" replace />} />
                            <Route path="/blind-assistant" element={<BlindAssistant />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/pricing" element={<Pricing />} />

                            {/* Patient routes (auth required) */}
                            <Route path="/upload" element={user ? <UploadPrescription /> : <Navigate to="/login" />} />
                            <Route path="/scan" element={user ? <ScanMedicine /> : <Navigate to="/login" />} />
                            <Route path="/history" element={user ? <MedicineHistory /> : <Navigate to="/login" />} />
                            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                            <Route path="/select-concern" element={user ? <SelectConcern /> : <Navigate to="/login" />} />
                            <Route path="/book-appointment" element={user ? <BookAppointment /> : <Navigate to="/login" />} />

                            {/* Doctor portal */}
                            <Route path="/doctor-portal" element={user ? <DoctorPortal /> : <Navigate to="/login" />} />

                            {/* Organization admin dashboard */}
                            <Route path="/org-dashboard" element={user ? <OrgDashboard /> : <Navigate to="/login" />} />

                            {/* Catch-all */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
