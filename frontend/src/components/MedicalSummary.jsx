import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Edit3, User, Activity, FileText, AlertCircle } from 'lucide-react';

const MedicalSummary = ({ onEdit }) => {
    const { user } = useContext(AppContext);
    const profile = user?.medical_profile || {};

    return (
        <div className="card card-glass p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="m-0 flex items-center gap-2 text-slate-800"><User className="text-primary" /> Medical Information</h2>
                <button onClick={onEdit} className="btn btn-ghost text-primary flex items-center gap-2 bg-primary-light hover:bg-primary hover:text-white transition-all">
                    <Edit3 size={18} /> Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Details */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-4">Personal Details</h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li><strong className="text-slate-800">Name:</strong> {profile.name || user?.name || 'Not provided'}</li>
                        <li><strong className="text-slate-800">Age / Gender:</strong> {profile.age || user?.age || 'N/A'} / {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}</li>
                        <li><strong className="text-slate-800">Contact:</strong> {profile.contactNumber || user?.phone || 'Not provided'}</li>
                        <li><strong className="text-slate-800">Address:</strong> {profile.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''}` : 'Not provided'}</li>
                    </ul>
                </div>

                {/* Vitals & Biometrics */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 border-b pb-2 mb-4 flex items-center gap-2"><Activity size={18} className="text-slate-500" /> Vitals & Biometrics</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><strong className="block text-slate-800 text-xs uppercase mb-1">Blood Group</strong> {profile.bloodGroup || '--'}</div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><strong className="block text-slate-800 text-xs uppercase mb-1">Blood Pressure</strong> {profile.bloodPressure || '--'}</div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><strong className="block text-slate-800 text-xs uppercase mb-1">Height (cm)</strong> {profile.height || '--'}</div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><strong className="block text-slate-800 text-xs uppercase mb-1">Weight (kg)</strong> {profile.weight || '--'}</div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 col-span-2"><strong className="block text-slate-800 text-xs uppercase mb-1">Sugar Level</strong> {profile.sugarLevel || '--'}</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18} className="text-slate-500" /> Current Problem</h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {profile.describeProblem || "No active problem described."}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-slate-500" /> Known Allergies</h3>
                <div className="flex gap-2 flex-wrap">
                    {profile.allergies?.latex === 'yes' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Latex</span>}
                    {profile.allergies?.iodine === 'yes' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Iodine</span>}
                    {profile.allergies?.bromine === 'yes' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Bromine</span>}
                    {profile.allergies?.other && profile.allergies.other.trim() !== '' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{profile.allergies.other}</span>}
                    {(!profile.allergies || (profile.allergies.latex !== 'yes' && profile.allergies.iodine !== 'yes' && profile.allergies.bromine !== 'yes' && !profile.allergies.other)) && (
                        <span className="text-sm text-slate-500">No known allergies reported.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalSummary;
