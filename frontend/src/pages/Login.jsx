import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { authAPI } from '../services/api';
import { User, Lock, Mail, Phone, AlertTriangle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PatientForm from '../components/PatientForm';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
];

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMedicalForm, setShowMedicalForm] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [showLangPopup, setShowLangPopup] = useState(false);

    const { login, speakText, language, setLanguage } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'age' && value !== '') {
            const num = parseInt(value, 10);
            if (num < 0 || num > 120) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchToRegister = () => {
        setShowLangPopup(true);
        setError('');
    };

    const handleLangSelect = (langCode) => {
        setLanguage(langCode);
        speakText(langCode === 'hi' ? 'हिंदी चुनी गई' : langCode === 'mr' ? 'मराठी निवडली' : 'English selected');
    };

    const handleLangConfirm = () => {
        setShowLangPopup(false);
        setIsLogin(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && !agreedToTerms) {
            setToastMsg(t('login.agree_privacy') + ' ' + t('login.privacy_link'));
            setTimeout(() => setToastMsg(''), 4000);
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                speakText(t('login.btn_login'));
                const res = await authAPI.login({ email: formData.email, password: formData.password });
                login({ ...res.data.user, token: res.data.access_token });
                navigate('/');
            } else {
                speakText(t('login.btn_register'));
                const res = await authAPI.register({
                    name: formData.name, email: formData.email, password: formData.password,
                    age: formData.age ? parseInt(formData.age) : null, phone: formData.phone
                });
                login({ ...res.data.user, token: res.data.access_token });
                setShowMedicalForm(true);
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "An error occurred";
            setError(msg);
            speakText(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (showMedicalForm) {
        return <PatientForm onComplete={() => navigate('/select-concern')} />;
    }

    return (
        <div className="login-container flex justify-center items-center py-12 px-4" style={{ minHeight: '90vh' }}>

            {/* ===== LANGUAGE POPUP ===== */}
            {showLangPopup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '1.75rem', padding: '2.5rem 2rem',
                        maxWidth: '440px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '1rem',
                                background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Globe size={28} color="#2563eb" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem' }}>
                                {t('lang_popup.title')}
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                {t('lang_popup.subtitle')}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangSelect(lang.code)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem 1.25rem', borderRadius: '1rem', cursor: 'pointer',
                                        border: language === lang.code ? '2.5px solid #2563eb' : '2px solid #e2e8f0',
                                        background: language === lang.code ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : '#f8fafc',
                                        transition: 'all 0.25s ease', fontFamily: 'inherit',
                                        boxShadow: language === lang.code ? '0 4px 14px rgba(37,99,235,0.15)' : 'none'
                                    }}
                                >
                                    <span style={{ fontSize: '1.75rem' }}>{lang.flag}</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{lang.native}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{lang.name}</div>
                                    </div>
                                    {language === lang.code && (
                                        <span style={{
                                            marginLeft: 'auto', background: '#2563eb', color: '#fff',
                                            padding: '0.2rem 0.75rem', borderRadius: '999px',
                                            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                                        }}>✓ {t('lang_popup.selected')}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleLangConfirm}
                            style={{
                                width: '100%', padding: '0.9rem', borderRadius: '0.875rem',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                                fontSize: '1rem', fontWeight: 800, border: 'none', cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(37,99,235,0.3)', fontFamily: 'inherit'
                            }}
                        >
                            {t('lang_popup.confirm')} →
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                            {t('lang_popup.footer')}
                        </p>
                    </div>
                </div>
            )}

            {/* ===== LOGIN / REGISTER FORM ===== */}
            <div className="card card-glass w-full animate-slide-up shadow-xl" style={{ maxWidth: '480px', padding: '3rem' }}>
                <div className="text-center mb-10">
                    <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <img src="/favicon.jpeg" alt="Scan4Elders Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0' }}>
                        {isLogin ? t('login.welcome_back') : t('login.create_account')}
                    </h2>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: '#64748b' }}>
                        {isLogin ? t('login.subtitle_login') : t('login.subtitle_register')}
                    </p>
                </div>

                {error && (
                    <div className="badge badge-error w-full py-4 mb-6 rounded-xl flex items-center justify-center gap-2 border border-red-200">
                        <AlertTriangle size={18} />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {!isLogin && (
                        <div className="input-group">
                            <label className="label">{t('login.full_name')}</label>
                            <div className="flex items-center gap-2">
                                <User size={20} color="var(--text-light)" />
                                <input type="text" name="name" className="input" placeholder="John Doe" value={formData.name} onChange={handleChange} required={!isLogin} />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="label">{t('login.email')}</label>
                        <div className="flex items-center gap-2">
                            <Mail size={20} color="var(--text-light)" />
                            <input type="email" name="email" className="input" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">{t('login.password')}</label>
                        <div className="flex items-center gap-2">
                            <Lock size={20} color="var(--text-light)" />
                            <input type="password" name="password" className="input" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="grid-2 mt-2">
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="label">{t('login.age')}</label>
                                <input type="number" name="age" className="input" placeholder="65" value={formData.age} onChange={handleChange} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="label">{t('login.phone')}</label>
                                <div className="flex items-center gap-2">
                                    <Phone size={20} color="var(--text-light)" />
                                    <input type="tel" name="phone" className="input" placeholder="9876543210" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="input-group mt-2">
                            <label className="flex items-start gap-2 cursor-pointer font-medium text-sm text-slate-700">
                                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1" />
                                <span>{t('login.agree_privacy')} <Link to="/privacy" className="text-primary hover:underline" target="_blank">{t('login.privacy_link')}</Link>.</span>
                            </label>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? <span className="skeleton-line half" style={{ margin: 0, height: '16px' }}></span> : (isLogin ? t('login.btn_login') : t('login.btn_register'))}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-secondary">
                        {isLogin ? t('login.no_account') + ' ' : t('login.have_account') + ' '}
                        <button
                            type="button" className="btn btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--primary-color)' }}
                            onClick={() => {
                                if (isLogin) {
                                    handleSwitchToRegister();
                                } else {
                                    setIsLogin(true);
                                    setError('');
                                }
                            }}
                        >
                            {isLogin ? t('login.sign_up') : t('login.log_in')}
                        </button>
                    </p>
                </div>
            </div>

            {toastMsg && (
                <div style={{
                    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: 'var(--error-light)', color: 'var(--error-color)',
                    padding: '12px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--error-color)'
                }} className="animate-slide-up">
                    <AlertTriangle size={20} />
                    <span style={{ fontWeight: 500 }}>{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default Login;
