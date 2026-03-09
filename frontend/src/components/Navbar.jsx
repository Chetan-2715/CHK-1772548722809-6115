import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { Activity, Camera, ScanLine, Clock, History, LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, speakText } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
        speakText('Logged out successfully');
    };

    const navItems = [
        { path: '/', name: 'Home', icon: Activity },
        { path: '/upload', name: 'Prescription', icon: Camera },
        { path: '/scan', name: 'Scan Medicine', icon: ScanLine },
        { path: '/history', name: 'History', icon: History },
        { path: '/reminders', name: 'Reminders', icon: Clock },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-container container">
                <Link
                    to="/"
                    className="navbar-brand"
                    onMouseEnter={() => speakText("Medi-Scribe Home")}
                >
                    <Activity className="brand-icon pulse-animation" />
                    <span>Medi-Scribe</span>
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
                            onClick={handleLogout}
                            className="btn btn-ghost nav-link logout-btn"
                            onMouseEnter={() => speakText("Logout")}
                        >
                            <LogOut size={20} />
                            <span className="nav-text">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="nav-menu">
                        <Link to="/login" className="btn btn-primary" onMouseEnter={() => speakText("Login or Register")}>
                            <UserIcon size={18} /> Login / Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
