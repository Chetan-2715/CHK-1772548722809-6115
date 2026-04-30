import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { authAPI } from '../services/api';
import api from '../services/api';
import { User, Lock, Mail, Phone, AlertTriangle, Globe, Stethoscope, Building2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PatientForm from '../components/PatientForm';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
];

const ROLES = [
    { id: 'patient', label: 'Patient', icon: '👤' },
    { id: 'doctor', label: 'Doctor', icon: '🩺' },
    { id: 'organization', label: 'Organization', icon: '🏥' },
];

const DOMAINS = ['allopathy', 'ayurvedic', 'homeopathy', 'cardiologist', 'neurological', 'orthopedic', 'pediatric'];

const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e2e8f0',
    borderRadius: '0.75rem', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', background: '#f8fafc',
};

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showMedicalForm, setShowMedicalForm] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showLangPopup, setShowLangPopup] = useState(false);

    // Shared fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');

    // Doctor extra fields
    const [specialization, setSpecialization] = useState('');
    const [domain, setDomain] = useState('allopathy');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [clinicName, setClinicName] = useState('');

    // Org extra fields
    const [orgType, setOrgType] = useState('clinic');
    const [address, setAddress] = useState('');
    const [plan, setPlan] = useState('basic');

    const { login, speakText, language, setLanguage } = useContext(AppContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const switchMode = () => {
        if (isLogin) { setShowLangPopup(true); setError(''); }
        else { setIsLogin(true); setError(''); setSuccess(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && !agreedToTerms) {
            setError('Please agree to the privacy policy to continue.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                if (role === 'doctor') {
                    const res = await api.post('/doctor/login', { email, password });
                    login({ ...res.data.user, access_token: res.data.access_token, role: 'doctor' });
                    navigate('/doctor-portal');
                } else if (role === 'organization') {
                    // Org admins log in as regular users with org_admin role
                    const res = await authAPI.login({ email, password });
                    login({ ...res.data.user, access_token: res.data.access_token });
                    navigate('/');
                } else {
                    const res = await authAPI.login({ email, password });
                    login({ ...res.data.user, access_token: res.data.access_token });
                    navigate('/');
                }
            } else {
                if (role === 'doctor') {
                    const res = await api.post('/doctor/register', {
                        name, email, password, phone: phone || null,
                        specialization, domain,
                        license_number: licenseNumber || null,
                        clinic_name: clinicName || null,
                    });
                    login({ ...res.data.user, access_token: res.data.access_token, role: 'doctor' });
                    navigate('/doctor-portal');
                } else if (role === 'organization') {
                    await api.post('/org/register', {
                        name, email, phone: phone || null,
                        address: address || null,
                        org_type: orgType,
                        subscription_plan: plan,
                    });
                    setSuccess('Organization registered! Please log in with your email and password.');
                    setIsLogin(true);
                    setRole('organization');
                } else {
                    const res = await authAPI.register({
                        name, email, password,
                        age: age ? parseInt(age) : null,
                        phone: phone || null,
                    });
                    login({ ...res.data.user, access_token: res.data.access_token });
                    setShowMedicalForm(true);
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (showMedicalForm) {
        return <PatientForm onComplete={() => navigate('/select-concern')} />;
    }

    const roleColor = role === 'doctor' ? '#8b5cf6' : role === 'organization' ? '#0f172a' : '#2563eb';
    const roleGradient = role === 'doctor'
        ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
        : role === 'organization'
            ? 'linear-gradient(135deg, #0f172a, #1e3a5f)'
            : 'linear-gradient(135deg, #2563eb, #1d4ed8)';

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '90vh', padding: '2rem 1rem' }}>

            {/* Language Popup */}
            {showLangPopup && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', maxWidth: 400, width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <Globe size={32} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
                            <h2 style={{ margin: 0, fontWeight: 800 }}>{t('lang_popup.title')}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>{t('lang_popup.subtitle')}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            {LANGUAGES.map(l => (
                                <button key={l.code} onClick={() => setLanguage(l.code)} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem',
                                    borderRadius: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                                    border: language === l.code ? '2.5px solid #2563eb' : '2px solid #e2e8f0',
                                    background: language === l.code ? '#eff6ff' : '#f8fafc',
                                }}>
                                    <span style={{ fontSize: '1.5rem' }}>{l.flag}</span>
                                    <span style={{ fontWeight: 700 }}>{l.native}</span>
                                    {language === l.code && <span style={{ marginLeft: 'auto', background: '#2563eb', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>✓</span>}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { setShowLangPopup(false); setIsLogin(false); }} style={{
                            width: '100%', padding: '0.85rem', borderRadius: '0.875rem',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                            fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                        }}>{t('lang_popup.confirm')} →</button>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem 2rem', maxWidth: 480, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1.5px solid #e2e8f0' }}>

                {/* Logo + Title */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <img src="/favicon.jpeg" alt="Scan4Elders" style={{ width: 64, height: 64, borderRadius: 12, marginBottom: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', color: '#0f172a' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        {isLogin ? 'Sign in to your account' : 'Join Scan4Elders today'}
                    </p>
                </div>

                {/* Role Selector */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '0.875rem', padding: '0.3rem', marginBottom: '1.5rem', gap: '0.2rem' }}>
                    {ROLES.map(r => (
                        <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                            flex: 1, padding: '0.55rem 0.4rem', borderRadius: '0.65rem', border: 'none',
                            fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s',
                            background: role === r.id ? 'white' : 'transparent',
                            color: role === r.id ? roleColor : '#64748b',
                            boxShadow: role === r.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        }}>
                            <div>{r.icon}</div>
                            <div style={{ marginTop: '0.15rem' }}>{r.label}</div>
                        </button>
                    ))}
                </div>

                {/* Success / Error */}
                {success && (
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <CheckCircle size={16} /> {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                    {/* Signup-only: Name */}
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>
                                {role === 'organization' ? 'Organization Name' : 'Full Name'} *
                            </label>
                            <input style={inputStyle} placeholder={role === 'organization' ? 'Apollo Hospitals' : 'Dr. John Doe'} value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Email *</label>
                        <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    {/* Password — not shown for org signup (no auth for org register) */}
                    {!(role === 'organization' && !isLogin) && (
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Password *</label>
                            <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    )}

                    {/* Patient signup extras */}
                    {!isLogin && role === 'patient' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Age</label>
                                <input style={inputStyle} type="number" placeholder="65" value={age} onChange={e => setAge(e.target.value)} min="0" max="120" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Phone</label>
                                <input style={inputStyle} type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Doctor signup extras */}
                    {!isLogin && role === 'doctor' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Specialization *</label>
                                    <input style={inputStyle} placeholder="General Physician" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Domain *</label>
                                    <select style={{ ...inputStyle }} value={domain} onChange={e => setDomain(e.target.value)}>
                                        {DOMAINS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>License No.</label>
                                    <input style={inputStyle} placeholder="MCI-123456" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Phone</label>
                                    <input style={inputStyle} type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Clinic / Hospital Name</label>
                                <input style={inputStyle} placeholder="City Health Clinic" value={clinicName} onChange={e => setClinicName(e.target.value)} />
                            </div>
                        </>
                    )}

                    {/* Organization signup extras */}
                    {!isLogin && role === 'organization' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Phone</label>
                                    <input style={inputStyle} type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Org Type</label>
                                    <select style={{ ...inputStyle }} value={orgType} onChange={e => setOrgType(e.target.value)}>
                                        {['clinic', 'hospital', 'pharmacy', 'diagnostic_center', 'other'].map(t => (
                                            <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Address</label>
                                <input style={inputStyle} placeholder="123 Health St, Mumbai" value={address} onChange={e => setAddress(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: '#374151' }}>Subscription Plan</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                                    {[['basic','Basic','₹999/mo'],['professional','Pro','₹4,999/mo'],['enterprise','Enterprise','Custom']].map(([v,label,price]) => (
                                        <button key={v} type="button" onClick={() => setPlan(v)} style={{
                                            padding: '0.6rem 0.4rem', borderRadius: '0.65rem', cursor: 'pointer',
                                            border: plan === v ? `2px solid ${roleColor}` : '2px solid #e2e8f0',
                                            background: plan === v ? '#f0fdf4' : '#f8fafc',
                                            fontFamily: 'inherit', textAlign: 'center',
                                        }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: plan === v ? roleColor : '#374151' }}>{label}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{price}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Privacy checkbox for signup */}
                    {!isLogin && (
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                            <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                            <span>I agree to the <Link to="/privacy" target="_blank" style={{ color: roleColor }}>Privacy Policy</Link></span>
                        </label>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '0.9rem', borderRadius: '0.875rem', border: 'none',
                        background: roleGradient, color: 'white', fontWeight: 700, fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                        {loading ? 'Please wait…' : isLogin ? `Sign In as ${ROLES.find(r => r.id === role)?.label}` : `Create ${ROLES.find(r => r.id === role)?.label} Account`}
                    </button>
                </form>

                {/* Toggle login/register */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <button type="button" onClick={switchMode} style={{
                        background: 'none', border: 'none', color: roleColor, fontWeight: 700,
                        fontSize: '0.9rem', cursor: 'pointer', padding: 0,
                    }}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
