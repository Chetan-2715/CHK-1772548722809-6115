import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EarOff } from 'lucide-react';
import { AppContext } from '../App';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { speakText } = useContext(AppContext);

    const speak = (text) => {
        if (speakText) speakText(text);
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '80vh', padding: '2rem',
        }}>
            <h1 style={{
                fontSize: '2.5rem', fontWeight: 800,
                marginBottom: '3rem', color: 'var(--text-main)', textAlign: 'center',
            }}>
                Select Your Profile
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '500px' }}>
                <button
                    onClick={() => { speak("Going to login page"); setTimeout(() => navigate('/login'), 500); }}
                    onMouseEnter={() => speak("Sighted Person button")}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
                        padding: '2rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                        fontSize: '1.5rem', fontWeight: 700, boxShadow: '0 8px 30px rgba(37,99,235,0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                    <Eye size={48} />
                    <span>Sighted Person</span>
                </button>

                <button
                    onClick={() => { speak("Going to voice assistant"); setTimeout(() => navigate('/blind-assistant'), 500); }}
                    onMouseEnter={() => speak("Blind Person button")}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
                        padding: '2rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white',
                        fontSize: '1.5rem', fontWeight: 700, boxShadow: '0 8px 30px rgba(109,40,217,0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                    <EarOff size={48} />
                    <span>Blind Person</span>
                </button>
            </div>
        </div>
    );
};

export default RoleSelection;
