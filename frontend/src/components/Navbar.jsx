import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { Activity, Camera, ScanLine, Clock, History, User as UserIcon, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
    const { user, speakText } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    // Do not show Navbar on login or select-concern pages
    if (location.pathname === '/login' || location.pathname === '/select-concern') {
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

    const navItems = [
        { path: '/', name: t('app.home'), icon: Activity },
        { path: '/upload', name: t('app.prescription'), icon: Camera },
        { path: '/scan', name: t('app.scan_medicine'), icon: ScanLine },
        { path: '/history', name: t('app.history'), icon: History },
        { path: '/profile', name: t('app.profile'), icon: UserIcon },
    ];

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
                            width: '36px',
                            height: '36px',
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
                        <button
                            onClick={handleEmergencyCall}
                            className="btn btn-ghost nav-link logout-btn text-red-600 hover:bg-red-50 hover:text-red-700"
                            style={{ color: '#dc2626' }}
                            onMouseEnter={() => speakText("Emergency Alert Call Caretaker")}
                        >
                            <PhoneCall size={20} />
                            <span className="nav-text font-bold">Emergency</span>
                        </button>
                    </div>
                ) : (
                    <div className="nav-menu">
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
