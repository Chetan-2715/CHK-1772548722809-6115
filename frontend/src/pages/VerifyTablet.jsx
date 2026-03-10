import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { medicineAPI } from '../services/api';
import { ShieldCheck, AlertTriangle, XCircle, Search, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VerifyTablet = () => {
    // This component verifies if a tablet belongs to a user's prescriptions
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const { speakText } = useContext(AppContext);
    const { t } = useTranslation();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);
        speakText(t('verify.voice.verifying', { name: searchTerm }));

        try {
            const res = await medicineAPI.verifyTablet({ medicine_name: searchTerm });
            setResult(res.data);

            if (res.data.status === 'confirmed') {
                speakText(t('verify.voice.confirmed', { name: searchTerm }));
            } else if (res.data.status === 'replacement') {
                speakText(t('verify.voice.replacement', { name: searchTerm }));
            } else {
                speakText(t('verify.voice.warning', { name: searchTerm }));
            }

        } catch (err) {
            setError(err.response?.data?.detail || t('verify.error_failed'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'var(--success-color)';
            case 'replacement': return 'var(--warning-color)';
            default: return 'var(--error-color)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <ShieldCheck size={48} color="var(--success-color)" />;
            case 'replacement': return <AlertTriangle size={48} color="var(--warning-color)" />;
            default: return <XCircle size={48} color="var(--error-color)" />;
        }
    };

    return (
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="text-center mb-8">
                <h1>{t('verify.title')}</h1>
                <p className="text-secondary" style={{ fontSize: '1.25rem' }}>
                    {t('verify.subtitle')}
                </p>
            </div>

            <div className="card card-glass mb-8 p-6 shadow-md border-t-4" style={{ borderTopColor: 'var(--primary-color)' }}>
                <form onSubmit={handleVerify} className="flex-col gap-4">
                    <label className="label font-bold text-lg mb-2 block">{t('verify.medicine_name')}</label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            className="input flex-1 p-4 text-xl bg-white border-2 focus:border-blue-500 rounded-lg shadow-sm"
                            placeholder={t('verify.placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary px-8 text-lg" disabled={loading || !searchTerm.trim()}>
                            {loading ? t('verify.checking') : <Search size={24} />}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="alert alert-error animate-slide-up">
                    <AlertTriangle /> {error}
                </div>
            )}

            {result && (
                <div className="card shadow-lg p-8 animate-slide-up text-center border-t-8"
                    style={{ borderTopColor: getStatusColor(result.status) }}>

                    <div className="flex justify-center mb-6 pulse-animation-slow">
                        {getStatusIcon(result.status)}
                    </div>

                    <h2 className="text-3xl mb-4 font-bold" style={{ color: getStatusColor(result.status) }}>
                        {result.status === 'confirmed' && t('verify.safe_to_take')}
                        {result.status === 'replacement' && t('verify.similar_substitute')}
                        {result.status === 'warning' && t('verify.not_prescribed')}
                    </h2>

                    <p className="text-xl text-slate-700 mb-8 font-medium leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-200">
                        {result.message}
                    </p>

                    {result.status === 'confirmed' && result.prescription_details && (
                        <div className="text-left bg-green-50 p-6 rounded-xl border border-green-200 mt-4 shadow-sm inline-block mx-auto max-w-md w-full">
                            <h4 className="flex items-center gap-2 text-green-800 font-bold mb-4 border-b border-green-200 pb-2">
                                <CalendarCheck size={20} /> {t('verify.prescribed_details')}
                            </h4>
                            <p className="text-lg mb-2 text-green-900 border-b border-green-100 pb-2"><strong>{t('verify.medicine')}:</strong> {result.prescription_details.medicine_name}</p>
                            <p className="text-lg mb-2 text-green-900 border-b border-green-100 pb-2"><strong>{t('verify.dosage')}:</strong> {result.prescription_details.dosage}</p>
                            <p className="text-lg text-green-900"><strong>{t('verify.instructions')}:</strong> {result.prescription_details.instructions}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VerifyTablet;
