import React, { useState, useContext } from 'react';
import { Upload, Camera, FileText, CheckCircle, AlertTriangle, PlayCircle, Clock } from 'lucide-react';
import { AppContext } from '../App';
import { prescriptionAPI, remindersAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

import './UploadPrescription.css';

const UploadPrescription = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { speakText } = useContext(AppContext);
    const { t } = useTranslation();

    // Reminder state
    const [showReminderForm, setShowReminderForm] = useState(null);
    const [reminderData, setReminderData] = useState({ frequency: 'daily', reminder_time: '09:00' });

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selected);
            speakText(t('upload.voice.image_selected'));
        }
    };

    const handleUpload = async () => {
        if (!file) {
            speakText(t('upload.voice.select_image_first'));
            setError(t('upload.voice.select_image_first'));
            return;
        }

        setLoading(true);
        setError('');
        speakText(t('upload.voice.analyzing'));

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await prescriptionAPI.upload(formData);
            if (res.data.success) {
                setResult(res.data);
                speakText(t('upload.voice.success_found', { count: res.data.medicines_count }));
            } else {
                setError(res.data.error || t('upload.voice.failed_process'));
                speakText(t('upload.voice.failed_process'));
            }
        } catch (err) {
            const msg = err.response?.data?.detail || t('upload.voice.upload_error');
            setError(msg);
            speakText(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const buildMedicineSpeech = (med) => {
        const parts = [
            `Medicine: ${med.medicine_name}.`,
            `Usage: ${med.usage || t('scan.unknown')}.`,
            `Dosage: ${med.dosage || t('scan.refer_doctor')}.`
        ];

        if (med.usage_instructions) {
            parts.push(`Instructions: ${med.usage_instructions}.`);
        }

        if (med.side_effects) {
            parts.push(`Side effects: ${med.side_effects}.`);
        }

        return parts.join(' ');
    };

    const buildPrescriptionSpeech = (data) => {
        if (!data) return '';

        const headerParts = [
            `${t('upload.found')}: ${data.medicines_count} ${t('upload.medicines')}.`
        ];

        if (data.doctor_name) {
            headerParts.push(`${t('upload.doctor')}: ${data.doctor_name}.`);
        }

        if (data.hospital_name) {
            headerParts.push(`${t('upload.hospital')}: ${data.hospital_name}.`);
        }

        const medicineParts = (data.medicines || []).map((med, index) => `Medicine ${index + 1}. ${buildMedicineSpeech(med)}`);

        return [...headerParts, ...medicineParts].join(' ');
    };

    return (
        <div className="upload-container animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{t('upload.title')}</h1>
                <p className="subtitle text-secondary mt-4 font-medium opacity-80">
                    {t('upload.subtitle')}
                </p>
            </div>

            <div className="upload-layout">
                <div className="card upload-card card-glass shadow-xl" style={{ borderTop: '4px solid var(--primary-color)' }}>
                    <h3><Camera className="inline-icon" /> {t('upload.upload_image')}</h3>

                    <div className={`dropzone ${preview ? 'has-image' : ''}`}>
                        {preview ? (
                            <div className="preview-container">
                                <img src={preview} alt="Prescription preview" className="image-preview" />
                                <button
                                    className="btn btn-ghost clear-btn"
                                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                                    onMouseEnter={() => speakText(t('upload.clear'))}
                                >
                                    {t('upload.clear')}
                                </button>
                            </div>
                        ) : (
                            <label className="upload-label" onMouseEnter={() => speakText(t('upload.click_choose'))}>
                                <div className="upload-placeholder">
                                    <Upload size={48} color="var(--primary-color)" className="pulse-animation" />
                                    <span className="mt-4 font-bold">{t('upload.click_choose')}</span>
                                    <span className="text-secondary text-sm mt-2">{t('upload.formats')}</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="file-input"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        className="btn btn-primary w-full mt-6 btn-lg"
                        onClick={handleUpload}
                        disabled={!file || loading}
                        onMouseEnter={() => speakText(t('upload.analyze'))}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2"><div className="spinner"></div> {t('upload.analyzing')}</span>
                        ) : (
                            <span className="flex items-center gap-2"><FileText size={20} /> {t('upload.analyze')}</span>
                        )}
                    </button>
                </div>

                <div className="card result-card">
                    <h3><CheckCircle className="inline-icon" color="var(--success-color)" /> {t('upload.results')}</h3>

                    {!result && !loading && (
                        <div className="empty-state text-center text-secondary">
                            <FileText size={48} opacity={0.5} className="mb-4" />
                            <p>{t('upload.results_placeholder')}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-state">
                            <div className="skeleton-line full" style={{ height: '30px', marginBottom: '1rem' }}></div>
                            <div className="skeleton-line half" style={{ height: '20px', marginBottom: '2rem' }}></div>

                            <div className="card card-glass skeleton mb-4" style={{ height: '150px' }}></div>
                            <div className="card card-glass skeleton mb-4" style={{ height: '150px' }}></div>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="analysis-results animate-slide-up">
                            <div className="prescription-meta mb-6 p-4 rounded-lg bg-primary-light">
                                {result.doctor_name && <p><strong>{t('upload.doctor')}:</strong> {result.doctor_name}</p>}
                                {result.hospital_name && <p><strong>{t('upload.hospital')}:</strong> {result.hospital_name}</p>}
                                <p><strong>{t('upload.found')}:</strong> {result.medicines_count} {t('upload.medicines')}</p>

                                <button
                                    className="btn btn-ghost btn-sm mt-2 flex items-center gap-1 text-primary cursor-pointer hover:bg-white p-2 rounded-md transition-colors"
                                    onClick={() => speakText(buildPrescriptionSpeech(result))}
                                >
                                    <PlayCircle size={16} /> {t('upload.play_audio')}
                                </button>
                            </div>

                            <div className="medicines-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                                {result.medicines.map((med, index) => (
                                    <div key={index} className="medicine-card card shadow-sm border border-slate-200">
                                        <div className="med-header flex justify-between items-center bg-slate-50 p-4 border-b border-slate-200 rounded-t-xl">
                                            <h4 className="text-xl text-primary font-bold m-0 flex items-center gap-2">
                                                {med.medicine_name}
                                                <button className="bg-transparent border-none cursor-pointer hover:scale-110 transition-transform text-slate-500 hover:text-primary" onClick={() => speakText(buildMedicineSpeech(med))} title="Listen">
                                                    <VolumeIcon />
                                                </button>
                                            </h4>
                                            <span className="badge badge-success px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold text-sm">{t('upload.prescribed')}</span>
                                        </div>

                                        <div className="med-details p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {med.usage && (
                                                <div className="detail-item">
                                                    <span className="label" style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.04em' }}>{t('dashboard.usage')}</span>
                                                    <span className="value" style={{ display: 'block', fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.5 }}>{med.usage}</span>
                                                </div>
                                            )}
                                            {med.dosage && (
                                                <div className="detail-item">
                                                    <span className="label" style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.04em' }}>{t('dashboard.dosage')}</span>
                                                    <span className="value" style={{ display: 'block', fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.5 }}>{med.dosage}</span>
                                                </div>
                                            )}

                                            {med.usage_instructions && (
                                                <div className="detail-item col-span-1 md:col-span-2 mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
                                                    <span className="label block text-blue-700 text-sm font-bold uppercase mb-1">{t('dashboard.instructions')}</span>
                                                    <span className="value block text-blue-900 font-medium">{med.usage_instructions}</span>
                                                </div>
                                            )}

                                            {med.side_effects && (
                                                <div className="detail-item col-span-1 md:col-span-2 mt-2 bg-red-50 p-3 rounded-md border border-red-100">
                                                    <span className="label text-red-700 text-sm font-bold uppercase mb-1 flex items-center gap-1"><AlertTriangle size={14} /> {t('upload.side_effects')}</span>
                                                    <span className="value block text-red-900">{med.side_effects}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
                                            <button
                                                className="btn btn-secondary w-full flex items-center justify-center gap-2"
                                                onClick={() => setShowReminderForm(showReminderForm === index ? null : index)}
                                            >
                                                <Clock size={16} /> {showReminderForm === index ? t('upload.cancel_reminder') : t('upload.set_reminder')}
                                            </button>

                                            {showReminderForm === index && (
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    remindersAPI.create({
                                                        medicine_name: med.medicine_name,
                                                        dosage: med.dosage || 'As prescribed',
                                                        frequency: reminderData.frequency,
                                                        reminder_time: reminderData.reminder_time,
                                                        notes: ''
                                                    }).then(() => {
                                                        speakText(`Reminder set for ${med.medicine_name}`);
                                                        setShowReminderForm(null);
                                                    }).catch(err => {
                                                        speakText(t('upload.voice.reminder_failed'));
                                                    });
                                                }} className="mt-4 flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-slide-up">
                                                    <div className="input-group m-0">
                                                        <label className="label text-sm font-bold">{t('upload.time_to_take')}</label>
                                                        <input type="time" className="input bg-white" required value={reminderData.reminder_time} onChange={e => setReminderData({ ...reminderData, reminder_time: e.target.value })} />
                                                    </div>
                                                    <div className="input-group m-0">
                                                        <label className="label text-sm font-bold">{t('upload.frequency')}</label>
                                                        <select className="input bg-white" value={reminderData.frequency} onChange={e => setReminderData({ ...reminderData, frequency: e.target.value })}>
                                                            <option value="daily">{t('upload.daily')}</option>
                                                            <option value="twice_daily">{t('upload.twice_daily')}</option>
                                                            <option value="weekly">{t('upload.weekly')}</option>
                                                        </select>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary w-full mt-2">{t('upload.save_reminder')}</button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

// Extracted small VolumeIcon component for inline use
const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);

export default UploadPrescription;
