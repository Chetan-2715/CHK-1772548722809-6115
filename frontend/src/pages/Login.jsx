import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { authAPI } from '../services/api';
import { User, Lock, Mail, Phone, Activity, AlertTriangle } from 'lucide-react';
import PatientForm from '../components/PatientForm';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMedicalForm, setShowMedicalForm] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const { login, speakText } = useContext(AppContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'age' && value !== '') {
            const num = parseInt(value, 10);
            if (num < 0 || num > 120) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin && !agreedToTerms) {
            setToastMsg("Please accept the Privacy Statement before creating an account.");
            setTimeout(() => setToastMsg(''), 4000);
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                speakText("Logging in. Please wait.");
                const res = await authAPI.login({
                    email: formData.email,
                    password: formData.password
                });
                login({ ...res.data.user, token: res.data.access_token });
                speakText("Login successful. Welcome back.");
                navigate('/');
            } else {
                speakText("Registering account. Please wait.");
                const res = await authAPI.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    age: formData.age ? parseInt(formData.age) : null,
                    phone: formData.phone
                });
                login({ ...res.data.user, token: res.data.access_token });
                speakText("Registration successful. Please complete your medical profile.");
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
        <div className="login-container flex justify-center items-center" style={{ minHeight: '70vh' }}>
            <div className="card card-glass w-full animate-slide-up" style={{ maxWidth: '500px' }}>
                <div className="text-center mb-6">
                    <Activity size={48} color="var(--primary-color)" className="pulse-animation-slow" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-secondary">
                        {isLogin ? 'Enter your details to access your account' : 'Join Scan4Elders for a safer medication journey'}
                    </p>
                </div>

                {error && (
                    <div className="card mb-4" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-color)', padding: '1rem', border: '1px solid var(--error-color)' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    {!isLogin && (
                        <div className="input-group">
                            <label className="label">Full Name</label>
                            <div className="flex items-center gap-2">
                                <User size={20} color="var(--text-light)" />
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <div className="flex items-center gap-2">
                            <Mail size={20} color="var(--text-light)" />
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Password</label>
                        <div className="flex items-center gap-2">
                            <Lock size={20} color="var(--text-light)" />
                            <input
                                type="password"
                                name="password"
                                className="input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="grid-2 mt-2">
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="label">Age (Optional)</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="input"
                                    placeholder="65"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="label">Phone (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <Phone size={20} color="var(--text-light)" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="input"
                                        placeholder="9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="input-group mt-2">
                            <label className="flex items-start gap-2 cursor-pointer font-medium text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1"
                                />
                                <span>I agree to the <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy and Terms of Service</Link>.</span>
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        disabled={loading}
                        onMouseEnter={() => speakText(isLogin ? "Click to Login" : "Click to Register")}
                    >
                        {loading ? <span className="skeleton-line half" style={{ margin: 0, height: '16px' }}></span> : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <p className="text-secondary">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', color: 'var(--primary-color)' }}
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                speakText(isLogin ? "Switching to Register form" : "Switching to Login form");
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>

            {toastMsg && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--error-light)',
                        color: 'var(--error-color)',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--error-color)'
                    }}
                    className="animate-slide-up"
                >
                    <AlertTriangle size={20} />
                    <span style={{ fontWeight: 500 }}>{toastMsg}</span>
                </div>
            )}
        </div>
    );
};

export default Login;
