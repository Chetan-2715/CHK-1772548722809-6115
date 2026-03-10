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

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user && !isEditing) {
            setCaretaker({
                name: user.caretaker_name || '',
                email: user.caretaker_email || '',
                phone: user.caretaker_phone || '',
                relation: user.caretaker_relation || ''
            });
        }
    }, [user, isEditing]);

    const handleChange = (e) => {
        setCaretaker({ ...caretaker, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!caretaker.name || !caretaker.email) {
            setError('Name and Email are required.');
            return;
        }
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
            setIsEditing(false);
            speakText("Caretaker information saved correctly.");
        } catch (err) {
            setError('Failed to save caretaker information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const hasCaretaker = user?.caretaker_email;

    return (
        <div className="card card-glass p-8 animate-fade-in" style={{ borderLeft: '6px solid var(--primary-color)', borderRadius: '1.5rem' }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <UserPlus size={32} className="text-primary" />
                    <h2 className="m-0 text-slate-900 font-black tracking-tight" style={{ fontSize: '1.75rem' }}>Caretaker Setup</h2>
                </div>
                {hasCaretaker && !isEditing && (
                    <button
                        className="btn btn-ghost text-primary font-bold flex items-center gap-2 hover:bg-primary-light"
                        onClick={() => {
                            setIsEditing(true);
                            setSuccess(false);
                        }}
                    >
                        Edit / Add Another
                    </button>
                )}
            </div>

            <p className="text-secondary text-lg mb-8 opacity-80 font-medium">
                Add a caretaker who can access your prescriptions and reminders. We'll send them a secure access link via email.
            </p>

            {success && (
                <div className="alert alert-success mb-8 py-4 px-6 rounded-xl flex items-center gap-3 animate-slide-down">
                    <CheckCircle size={24} />
                    <span className="font-bold">Caretaker successfully assigned and notified!</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-8 py-4 px-6 rounded-xl flex items-center gap-3 animate-slide-down">
                    <AlertTriangle size={24} />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {hasCaretaker && !isEditing ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-4 animate-scale-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="block text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Caretaker Name</span>
                            <span className="text-xl font-black text-slate-800">{user.caretaker_name}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Email Address</span>
                            <span className="text-xl font-black text-slate-800">{user.caretaker_email}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Phone Number</span>
                            <span className="text-xl font-black text-slate-800">{user.caretaker_phone || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Relationship</span>
                            <span className="text-xl font-black text-slate-800">{user.caretaker_relation || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="input-group m-0">
                            <label className="label font-bold text-slate-700">Caretaker Name *</label>
                            <input type="text" name="name" className="input bg-white" placeholder="Full name" value={caretaker.name} onChange={handleChange} />
                        </div>
                        <div className="input-group m-0">
                            <label className="label font-bold text-slate-700">Email Address *</label>
                            <input type="email" name="email" className="input bg-white" placeholder="email@example.com" value={caretaker.email} onChange={handleChange} />
                        </div>
                        <div className="input-group m-0">
                            <label className="label font-bold text-slate-700">Contact Number</label>
                            <input type="tel" name="phone" className="input bg-white" placeholder="+91 ..." value={caretaker.phone} onChange={handleChange} />
                        </div>
                        <div className="input-group m-0">
                            <label className="label font-bold text-slate-700">Relation</label>
                            <input type="text" name="relation" className="input bg-white" placeholder="Son, Daughter, Friend..." value={caretaker.relation} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {isEditing && (
                            <button
                                className="btn btn-ghost flex-1 py-4 font-bold"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            className="btn btn-primary flex-1 py-4 flex items-center justify-center gap-3 shadow-primary"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <div className="spinner mini border-white"></div> : <Save size={20} />}
                            <span className="font-bold text-lg">Confirm & Save Caretaker</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaretakerSetup;
