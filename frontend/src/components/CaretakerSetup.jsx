import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { authAPI } from '../services/api';
import { Save, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';

const CaretakerSetup = () => {
    const { user, speakText, updateUser } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [caretaker, setCaretaker] = useState({
        name: '',
        email: '',
        phone: '',
        relation: ''
    });

    useEffect(() => {
        if (user) {
            setCaretaker({
                name: user.caretaker_name || '',
                email: user.caretaker_email || '',
                phone: user.caretaker_phone || '',
                relation: user.caretaker_relation || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setCaretaker({ ...caretaker, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const explicitUpdate = {
                caretaker_name: caretaker.name,
                caretaker_email: caretaker.email,
                caretaker_phone: caretaker.phone,
                caretaker_relation: caretaker.relation,
            };
            await authAPI.updateProfile(explicitUpdate);

            // Update user context here
            if (updateUser) {
                updateUser({
                    ...user,
                    caretaker_name: caretaker.name,
                    caretaker_email: caretaker.email,
                    caretaker_phone: caretaker.phone,
                    caretaker_relation: caretaker.relation
                });
            }

            setSuccess(true);
            speakText("Caretaker information saved. They will receive an email shortly.");
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError('Failed to save caretaker information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-glass p-6 animate-fade-in" style={{ borderLeft: '4px solid var(--primary-color)' }}>
            <div className="flex items-center gap-3 mb-4">
                <UserPlus size={28} className="text-primary" />
                <h2 className="m-0 text-primary font-bold">Caretaker Setup</h2>
            </div>
            <p className="text-secondary mb-6">
                Add a caretaker who can access your prescriptions, weekly reports, and reminders. An email will be sent to them with access instructions.
            </p>

            {error && (
                <div className="alert alert-error mb-4">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="alert alert-success mb-4 flex gap-2">
                    <CheckCircle size={20} />
                    <span>Caretaker successfully assigned and notified via email!</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="input-group m-0">
                    <label className="label font-bold">Caretaker Name:</label>
                    <input type="text" name="name" className="input" placeholder="Enter caretaker's name" value={caretaker.name} onChange={handleChange} />
                </div>
                <div className="input-group m-0">
                    <label className="label font-bold">Email Address:</label>
                    <input type="email" name="email" className="input" placeholder="Enter caretaker's email" value={caretaker.email} onChange={handleChange} />
                </div>
                <div className="input-group m-0">
                    <label className="label font-bold">Contact Number:</label>
                    <input type="tel" name="phone" className="input" placeholder="Enter contact number" value={caretaker.phone} onChange={handleChange} />
                </div>
                <div className="input-group m-0">
                    <label className="label font-bold">Relation to you:</label>
                    <input type="text" name="relation" className="input" placeholder="e.g., Son, Daughter, Nurse" value={caretaker.relation} onChange={handleChange} />
                </div>
            </div>

            <button className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto ml-auto px-8" onClick={handleSave} disabled={loading}>
                {loading ? <div className="spinner mini border-white"></div> : <Save size={20} />}
                Save Caretaker
            </button>
        </div>
    );
};

export default CaretakerSetup;
