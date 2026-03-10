import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="container py-8 animate-fade-in max-w-3xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost flex items-center gap-2 mb-6"
            >
                <ArrowLeft size={20} /> {t('privacy.back')}
            </button>
            <div className="card card-glass p-8">
                <h1 className="mb-6 text-primary">{t('privacy.title')}</h1>
                <div className="text-secondary space-y-4 leading-relaxed">
                    <p>{t('privacy.p1')}</p>
                    <p>{t('privacy.p2')}</p>
                    <p>{t('privacy.p3')}</p>
                    <p className="font-medium text-slate-800 pt-4 border-t border-slate-200">
                        {t('privacy.ack')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
