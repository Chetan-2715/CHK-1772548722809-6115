import React, { useState, useContext } from 'react';
import PatientForm from '../components/PatientForm';
import MedicalSummary from '../components/MedicalSummary';
import CaretakerSetup from '../components/CaretakerSetup';
import WeeklyReports from '../components/WeeklyReports';
import AppointmentScheduler from '../components/AppointmentScheduler';
import { FileText, Users, BarChart2, Calendar, LogOut, SlidersHorizontal, Globe, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, speakText, theme, setTheme, language, setLanguage } = useContext(AppContext);
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('medical');
    const [isEditingMedical, setIsEditingMedical] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        speakText('Logged out successfully');
    };

    const languages = [
        { code: 'en', label: 'English', native: 'English' },
        { code: 'hi', label: 'Hindi', native: 'हिंदी' },
        { code: 'mr', label: 'Marathi', native: 'मराठी' },
    ];

    const tabs = [
        { id: 'medical', name: t('profile.medical_history'), icon: FileText },
        { id: 'caretaker', name: t('profile.caretaker'), icon: Users },
        { id: 'reports', name: t('profile.weekly_reports'), icon: BarChart2 },
        { id: 'appointments', name: t('profile.appointments'), icon: Calendar },
        { id: 'settings', name: t('profile.general_settings') || 'General Settings', icon: SlidersHorizontal },
    ];

    const GeneralSettings = () => (
        <div className="card card-glass p-6" style={{ borderRadius: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                {t('profile.general_settings') || 'General Settings'}
            </h2>

            {/* Language Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Globe size={20} />
                    {t('profile.primary_language') || 'Primary Language'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {t('profile.language_desc') || 'This language will be used across the entire app, including AI responses.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {languages.map(lang => {
                        const isActive = i18n.language === lang.code;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: isActive ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                                    background: isActive ? 'var(--primary-light, #eff6ff)' : 'var(--background-secondary)',
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    minWidth: '100px',
                                }}
                            >
                                <span style={{ fontSize: '1.05rem' }}>{lang.native}</span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang.label}</span>
                                {isActive && <span style={{ fontSize: '0.7rem', marginTop: '2px' }}>✓ {t('profile.selected') || 'Selected'}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Theme Section */}
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    {t('profile.appearance') || 'Appearance'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {t('profile.appearance_desc') || 'Choose your preferred display mode.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {[
                        { key: 'light', label: t('profile.light_mode') || 'Light Mode', icon: <Sun size={22} /> },
                        { key: 'dark', label: t('profile.dark_mode') || 'Dark Mode', icon: <Moon size={22} /> },
                    ].map(opt => {
                        const isActive = theme === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setTheme(opt.key)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: isActive ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                                    background: isActive ? 'var(--primary-light, #eff6ff)' : 'var(--background-secondary)',
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    minWidth: '150px',
                                }}
                            >
                                {opt.icon}
                                <span>{opt.label}</span>
                                {isActive && <span style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                {/* Sidebar */}
                <div style={{ flex: '1 1 250px', minWidth: '250px', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingLeft: '1rem', paddingTop: '1rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '-0.5rem' }}>
                            {t('profile.title') || 'My Profile'}
                        </h2>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const color = isActive ? "#2b6cb0" : "#1e293b"; // blueish vs slate

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex items-center gap-5 w-full text-left transition-all focus:outline-none hover:opacity-80"
                                >
                                    <Icon size={28} color={color} strokeWidth={2.5} style={{ transition: 'color 0.2s', padding: '2px' }} />
                                    <span style={{ color: color, transition: 'color 0.2s' }} className={`text-[1.1rem] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                                        {tab.name}
                                    </span>
                                </button>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-5 w-full text-left transition-all focus:outline-none hover:opacity-80 mt-2"
                            onMouseEnter={() => speakText(t('profile.logout'))}
                        >
                            <LogOut size={28} color="#1e293b" strokeWidth={2.5} style={{ transition: 'color 0.2s', padding: '2px' }} />
                            <span style={{ color: "#1e293b" }} className="text-[1.1rem] font-semibold">
                                {t('profile.logout')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: '3 1 500px', minWidth: '300px' }}>
                    {activeTab === 'medical' && (
                        isEditingMedical ? (
                            <PatientForm onComplete={() => setIsEditingMedical(false)} />
                        ) : (
                            <MedicalSummary onEdit={() => setIsEditingMedical(true)} />
                        )
                    )}
                    {activeTab === 'caretaker' && <CaretakerSetup />}
                    {activeTab === 'reports' && <WeeklyReports />}
                    {activeTab === 'appointments' && <AppointmentScheduler />}
                    {activeTab === 'settings' && <GeneralSettings />}
                </div>
            </div>
        </div>
    );
};

export default Profile;
