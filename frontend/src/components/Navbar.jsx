import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { Activity, Camera, ScanLine, History, User as UserIcon, PhoneCall, Stethoscope, Calendar, Building2, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
    const { user, speakText } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    // Do not show Navbar on login, blind assistant, or select-concern pages
    if (['/login', '/blind-assistant', '/select-concern'].includes(location.pathname)) {
        return null;
    }

    const handleEmergencyCall = () => {
        const phone = user?.caretaker_phone || user?.medical_profile?.caretaker?.phone;
        if (phone) {
            speakText('Calling caretaker');
            window.location.href = `tel:${phone}`;
        } else {
            speakText('No caretaker phone number found. Please add one in your profile.');
            alert('No caretaker phone number found. Please add one in your profile.');
        }
    };

    // Role-aware nav items
    const getNavItems = () => {
        if (!user) return [];

        const role = user.role || 'patient';

        if (role === 'doctor') {
            return [
                { path: '/doctor-portal', name: 'My Portal', icon: Stethoscope },
            ];
        }

        if (role === 'org_admin') {
            return [
                { path: '/org-dashboard', name: 'Dashboard', icon: Building2 },
            ];
        }

        // Patient (default)
        return [
            { path: '/', name: t('app.home'), icon: Activity },
            { path: '/upload', name: t('app.prescription'), icon: Camera },
            { path: '/scan', name: t('app.scan_medicine'), icon: ScanLine },
            { path: '/book-appointment', name: 'Appointments', icon: Calendar },
            { path: '/history', name: t('app.history'), icon: History },
            { path: '/profile', name: t('app.profile'), icon: UserIcon },
        ];
    };

    const navItems = getNavItems();

    return (
        <nav className="navbar">
            <div className="navbar-container" style={{ width: '100%', padding: '0 2rem', maxWidth: 'none' }}>
                <Link
                    to="/"
                    className="navbar-brand"
                    onMouseEnter={() => speakText("Scan4Elders Home")}
                >
                    <img
                        src="/favicon.jpeg"
                        alt="Scan4Elders Logo"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        }}
                    />
                    <span>{t('app.title')}</span>
                </Link>

                {user ? (
                    <div className="nav-menu">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    onMouseEnter={() => speakText(item.name)}
                                >
                                    <Icon size={20} />
                                    <span className="nav-text">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* Pricing — shown to all roles */}
                        <Link
                            to="/pricing"
                            className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
                            onMouseEnter={() => speakText('Pricing Plans')}
                        >
                            <Tag size={20} />
                            <span className="nav-text">Pricing</span>
                        </Link>

                        {/* Emergency — only for patients */}
                        {(!user.role || user.role === 'patient') && (
                            <button
                                onClick={handleEmergencyCall}
                                className="btn btn-ghost nav-link logout-btn text-red-600 hover:bg-red-50 hover:text-red-700"
                                style={{ color: '#dc2626' }}
                                onMouseEnter={() => speakText("Emergency Alert Call Caretaker")}
                            >
                                <PhoneCall size={20} />
                                <span className="nav-text font-bold">Emergency</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="nav-menu">
                        <Link to="/pricing" className="nav-link" onMouseEnter={() => speakText('Pricing Plans')}>
                            <Tag size={18} />
                            <span className="nav-text">Pricing</span>
                        </Link>
                        <Link to="/login" className="btn btn-primary" onMouseEnter={() => speakText("Login or Register")}>
                            <UserIcon size={18} /> {t('app.login_register')}
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

