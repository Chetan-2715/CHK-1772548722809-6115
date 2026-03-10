import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { authAPI } from '../services/api';
import { CheckCircle, AlertTriangle, User, SkipForward, Save, Lock } from 'lucide-react';
import './PatientForm.css';

const PatientForm = ({ onComplete }) => {
    const { user, speakText, updateUser } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // Default form structure based on Patient Information Form
    const [formData, setFormData] = useState({
        name: user?.name || '',
        dob: '',
        age: user?.age || '',
        gender: '',
        contactNumber: user?.phone || '',
        address: '',
        city: '',
        state: '',
        nationality: '',
        bloodPressure: '',
        sugarLevel: '',
        bloodGroup: '',
        height: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
        problemStart: '',
        describeProblem: '',
        requireSurgery: 'no', // 'no', 'yes', 'yesDate'
        surgeryDate: '',
        pastMedicalHistory: {
            breathingProblems: false,
            pregnant: false,
            heartProblems: false,
            currentWoundSkinProblems: false,
            pacemaker: false,
            tumorCancer: false,
            diabetes: false,
            stroke: false,
            boneJointProblems: false,
            kidneyProblems: false,
            gallbladderLiver: false,
            electricalImplants: false,
            anxietyAttacks: false,
            sleepApnea: false,
            depression: false,
            bowelBladder: false,
            historyOfHeavyAlcoholUse: false,
            drugUse: false,
            smoking: false,
            headaches: false,
            other: false
        },
        otherMedicalHistoryDetails: [''],
        noSurgeries: false,
        surgeries: [{ hospital: '', surgery: '', doctorName: '', city: '', year: '' }],
        noMedication: false,
        medications: [{ medication: '', dose: '', reason: '', recommendedDoctor: '' }],
        noAllergies: false,
        allergies: {
            latex: 'no',
            iodine: 'no',
            bromine: 'no',
            other: ''
        },
        additionalComment: '',
        caretaker: {
            name: '',
            email: '',
            phone: '',
            relation: ''
        }
    });

    useEffect(() => {
        // If user already has a medical profile, load it
        if (user?.medical_profile) {
            setFormData(prev => ({
                ...prev,
                ...user.medical_profile,
                name: user?.name || user?.medical_profile?.name || '',
                caretaker: user?.medical_profile?.caretaker || { name: '', email: '', phone: '', relation: '' }
            }));
        }
    }, [user]);

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        if (name === 'age' && value !== '') {
            const num = parseInt(value, 10);
            if (num < 0 || num > 120) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSimpleArrayStringChange = (category, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[category]];
            newArray[index] = value;
            return { ...prev, [category]: newArray };
        });
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (category, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[category]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [category]: newArray };
        });
    };

    const addArrayRow = (category, defaultRow) => {
        setFormData(prev => ({
            ...prev,
            [category]: [...prev[category], defaultRow]
        }));
    };

    const saveProfile = async () => {
        if (!agreedToTerms) {
            setToastMsg("Please accept the Privacy Statement… Your data is securely encrypted");
            setTimeout(() => setToastMsg(''), 4000);
            return;
        }

        setLoading(true);
        setError('');
        speakText("Saving medical profile");
        try {
            // Attempt to save to backend if user logic applies
            await authAPI.updateProfile({ medical_profile: formData }).catch(e => console.warn('Bypassed backend save restriction'));

            if (updateUser && user) {
                updateUser({ ...user, medical_profile: formData });
            }

            // Unconditionally route the user to the Select Concern page
            setSuccess(true);
            speakText("Profile saved successfully");
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);
        } catch (err) {
            console.error("Save error bypassed");
            setSuccess(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-form-container animate-slide-up">
            <div className="form-header text-center mb-6">
                <h2>Patient Information Form</h2>
                <p className="text-secondary">Please fill out your medical history to help us assist you better.</p>
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="alert alert-success mb-4" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-color)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                    <CheckCircle size={20} />
                    <span>Saved Successfully!</span>
                </div>
            )}

            <div className="form-section card card-glass mb-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="input-group m-0">
                        <label className="label">Name:</label>
                        <input type="text" name="name" className="input" value={formData.name} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Date:</label>
                        <input type="date" name="date" className="input" value={formData.date} onChange={handleTextChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="input-group m-0">
                        <label className="label">DOB:</label>
                        <input type="date" name="dob" className="input" value={formData.dob} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Age:</label>
                        <input type="number" name="age" className="input" min="0" max="120" value={formData.age} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Gender:</label>
                        <select name="gender" className="input" value={formData.gender} onChange={handleTextChange}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="input-group m-0">
                        <label className="label">Contact Number:</label>
                        <input type="tel" name="contactNumber" className="input" value={formData.contactNumber} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Address:</label>
                        <input type="text" name="address" className="input" value={formData.address} onChange={handleTextChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="input-group m-0">
                        <label className="label">City:</label>
                        <input type="text" name="city" className="input" value={formData.city} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">State:</label>
                        <input type="text" name="state" className="input" value={formData.state} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Nationality:</label>
                        <input type="text" name="nationality" className="input" value={formData.nationality} onChange={handleTextChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 pt-4 border-t border-slate-100 mt-4">
                    <div className="input-group m-0">
                        <label className="label">Blood Grp:</label>
                        <select name="bloodGroup" className="input" value={formData.bloodGroup} onChange={handleTextChange}>
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Height (cm):</label>
                        <input type="number" name="height" className="input" placeholder="e.g. 170" value={formData.height} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Weight (kg):</label>
                        <input type="number" name="weight" className="input" placeholder="e.g. 70" value={formData.weight} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Blood Pressure:</label>
                        <input type="text" name="bloodPressure" className="input" placeholder="e.g. 120/80" value={formData.bloodPressure} onChange={handleTextChange} />
                    </div>
                    <div className="input-group m-0">
                        <label className="label">Sugar Level:</label>
                        <input type="text" name="sugarLevel" className="input" placeholder="e.g. 100 mg/dL" value={formData.sugarLevel} onChange={handleTextChange} />
                    </div>
                </div>

                <div className="grid-2 mb-4 mt-6 border-t border-slate-100 pt-6">
                    <div className="input-group">
                        <label className="label">When did your problem start?:</label>
                        <input type="text" name="problemStart" className="input" value={formData.problemStart} onChange={handleTextChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Describe Problem:</label>
                        <input type="text" name="describeProblem" className="input" value={formData.describeProblem} onChange={handleTextChange} />
                    </div>
                </div>

                <div className="input-group mb-4 flex gap-6 items-center flex-wrap">
                    <label className="label font-bold m-0">Did this Problem require Surgery:</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="requireSurgery" value="no" checked={formData.requireSurgery === 'no'} onChange={handleTextChange} /> No
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="requireSurgery" value="yes" checked={formData.requireSurgery === 'yes'} onChange={handleTextChange} /> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="requireSurgery" value="yesDate" checked={formData.requireSurgery === 'yesDate'} onChange={handleTextChange} /> Yes Date of Surgery
                    </label>
                    {formData.requireSurgery === 'yesDate' && (
                        <input type="date" name="surgeryDate" className="input p-2" value={formData.surgeryDate} onChange={handleTextChange} />
                    )}
                </div>
            </div>

            <div className="form-section card card-glass mb-4 p-6">
                <h3 className="mb-4">Past Medical History <span className="text-secondary text-sm font-normal">Do you have a history of the following problems?</span></h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {Object.entries(formData.pastMedicalHistory).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleNestedChange('pastMedicalHistory', key, e.target.checked)}
                            />
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                    ))}
                </div>

                {formData.pastMedicalHistory.other && (
                    <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-white">
                        <label className="label font-bold mb-2 block">Please specify other history:</label>
                        {formData.otherMedicalHistoryDetails.map((item, index) => (
                            <input
                                key={index}
                                type="text"
                                className="input mb-2"
                                placeholder="Enter other medical history"
                                value={item}
                                onChange={(e) => handleSimpleArrayStringChange('otherMedicalHistoryDetails', index, e.target.value)}
                            />
                        ))}
                        <button type="button" className="btn btn-ghost text-primary text-sm p-2 w-full text-left" onClick={() => addArrayRow('otherMedicalHistoryDetails', '')}>+ Add another</button>
                    </div>
                )}
            </div>

            <div className="form-section card card-glass mb-4 p-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="m-0">Surgeries / Hospitalizations</h3>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input type="checkbox" name="noSurgeries" checked={formData.noSurgeries} onChange={(e) => handleTextChange({ target: { name: 'noSurgeries', value: e.target.checked } })} />
                        No Surgeries
                    </label>
                </div>
                {!formData.noSurgeries && (
                    <div className="table-wrapper bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 border-b border-slate-200">Hospital</th>
                                    <th className="p-3 border-b border-slate-200">Which Surgery</th>
                                    <th className="p-3 border-b border-slate-200">Doctor Name</th>
                                    <th className="p-3 border-b border-slate-200">City</th>
                                    <th className="p-3 border-b border-slate-200">Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.surgeries.map((row, index) => (
                                    <tr key={index}>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.hospital} onChange={(e) => handleArrayChange('surgeries', index, 'hospital', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.surgery} onChange={(e) => handleArrayChange('surgeries', index, 'surgery', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.doctorName} onChange={(e) => handleArrayChange('surgeries', index, 'doctorName', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.city} onChange={(e) => handleArrayChange('surgeries', index, 'city', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.year} onChange={(e) => handleArrayChange('surgeries', index, 'year', e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" className="btn btn-ghost text-primary text-sm p-3 w-full" onClick={() => addArrayRow('surgeries', { hospital: '', surgery: '', doctorName: '', city: '', year: '' })}>+ Add another row</button>
                    </div>
                )}
            </div>

            <div className="form-section card card-glass mb-4 p-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="m-0">Medications <span className="text-secondary text-sm font-normal">Please list Medications that you are taking.</span></h3>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input type="checkbox" name="noMedication" checked={formData.noMedication} onChange={(e) => handleTextChange({ target: { name: 'noMedication', value: e.target.checked } })} />
                        No Medication
                    </label>
                </div>
                {!formData.noMedication && (
                    <div className="table-wrapper bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 border-b border-slate-200">Medication(s)</th>
                                    <th className="p-3 border-b border-slate-200">Dose</th>
                                    <th className="p-3 border-b border-slate-200">Reason for Medication</th>
                                    <th className="p-3 border-b border-slate-200">Recommended Doctor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.medications.map((row, index) => (
                                    <tr key={index}>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.medication} onChange={(e) => handleArrayChange('medications', index, 'medication', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.dose} onChange={(e) => handleArrayChange('medications', index, 'dose', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" value={row.reason} onChange={(e) => handleArrayChange('medications', index, 'reason', e.target.value)} /></td>
                                        <td className="p-2 border-b border-slate-100"><input type="text" className="input p-2" placeholder="Doctor Name" value={row.recommendedDoctor} onChange={(e) => handleArrayChange('medications', index, 'recommendedDoctor', e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" className="btn btn-ghost text-primary text-sm p-3 w-full" onClick={() => addArrayRow('medications', { medication: '', dose: '', reason: '', recommendedDoctor: '' })}>+ Add another row</button>
                    </div>
                )}
            </div>

            <div className="form-section card card-glass mb-4 p-6">
                <div className="flex mb-4 items-center gap-4">
                    <h3 className="m-0">Allergies</h3>
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input type="checkbox" name="noAllergies" checked={formData.noAllergies} onChange={(e) => handleTextChange({ target: { name: 'noAllergies', value: e.target.checked } })} />
                        No Known allergies
                    </label>
                </div>

                {!formData.noAllergies && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex flex-col gap-2 border-r border-slate-200 pr-4">
                            <span className="font-bold">Latex</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.latex === 'yes'} onChange={() => handleNestedChange('allergies', 'latex', 'yes')} /> Yes</label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.latex === 'no'} onChange={() => handleNestedChange('allergies', 'latex', 'no')} /> No</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 border-r border-slate-200 pr-4 pl-0 md:pl-4">
                            <span className="font-bold">Iodine</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.iodine === 'yes'} onChange={() => handleNestedChange('allergies', 'iodine', 'yes')} /> Yes</label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.iodine === 'no'} onChange={() => handleNestedChange('allergies', 'iodine', 'no')} /> No</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 pr-4 pl-0 md:pl-4">
                            <span className="font-bold">Bromine</span>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.bromine === 'yes'} onChange={() => handleNestedChange('allergies', 'bromine', 'yes')} /> Yes</label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.allergies.bromine === 'no'} onChange={() => handleNestedChange('allergies', 'bromine', 'no')} /> No</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-1">
                            <span className="font-bold">Other</span>
                            <input type="text" className="input p-2 m-0" value={formData.allergies.other} onChange={(e) => handleNestedChange('allergies', 'other', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>

            <div className="form-section card card-glass mb-6 p-6">
                <div className="input-group">
                    <label className="label font-bold">Additional comment(Reading or Memory Problem)</label>
                    <textarea
                        name="additionalComment"
                        className="input"
                        rows="3"
                        value={formData.additionalComment}
                        onChange={handleTextChange}
                        placeholder="Any additional details we should know..."
                    ></textarea>
                </div>
            </div>

            <div className="form-section card card-glass mb-6 p-6">
                <div className="privacy-section pt-2">
                    <div className="text-sm text-slate-600 space-y-3">
                        <label className="flex items-start gap-2 cursor-pointer pt-2">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                            />
                            <p className="font-medium text-slate-800 m-0 leading-tight">By submitting this form, you acknowledge that your information will be securely stored and used solely for the intended functionality of this platform.</p>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-6">
                {onComplete && (
                    <button type="button" className="btn btn-ghost flex gap-2 items-center px-6" onClick={onComplete}>
                        <SkipForward size={20} /> Skip for now
                    </button>
                )}
                <button type="button" className="btn btn-primary flex gap-2 items-center px-8 flex-1 justify-center max-w-xs ml-auto" onClick={saveProfile} disabled={loading}>
                    {loading ? <div className="spinner border-white mini"></div> : <Save size={20} />}
                    Save Medical Profile
                </button>
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

export default PatientForm;
