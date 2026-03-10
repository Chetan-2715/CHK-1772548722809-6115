import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Leaf, Droplets, Pill, HeartPulse, Brain, Bone, Baby, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SelectConcern = () => {
    const navigate = useNavigate();
    const { speakText } = useContext(AppContext);
    const { t } = useTranslation();

    const concerns = [
        { id: 'ayurvedic', label: t('domains.ayurvedic'), icon: <Leaf size={48} color="var(--success-color)" /> },
        { id: 'homeopathy', label: t('domains.homeopathy'), icon: <Droplets size={48} color="var(--primary-color)" /> },
        { id: 'allopathy', label: t('domains.allopathy'), icon: <Pill size={48} color="var(--accent-color)" /> },
        { id: 'cardiologist', label: t('domains.cardiologist'), icon: <HeartPulse size={48} color="var(--error-color)" /> },
        { id: 'neurological', label: t('domains.neurological'), icon: <Brain size={48} color="var(--primary-hover)" /> },
        { id: 'orthopedic', label: t('domains.orthopedic'), icon: <Bone size={48} color="var(--text-secondary)" /> },
        { id: 'pediatric', label: t('domains.pediatric'), icon: <Baby size={48} color="var(--secondary-color)" /> },
        { id: 'other', label: t('domains.other'), icon: <Activity size={48} color="var(--text-main)" /> },
    ];

    const handleSelect = (concern) => {
        speakText(t('concern.voice.selected', { concern: concern.label }));
        localStorage.setItem('selectedConcern', concern.id);
        navigate('/');
    };

    return (
        <div className="select-concern-container flex justify-center items-center py-16" style={{ minHeight: '90vh' }}>
            <div className="w-full animate-slide-up" style={{ maxWidth: '1100px', padding: '0 2rem' }}>
                <div className="text-center mb-16">
                    <h1 className="text-slate-900 tracking-tight" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 900 }}>{t('concern.title')}</h1>
                    <p className="text-secondary text-xl max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
                        {t('concern.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {concerns.map(c => (
                        <ConcernCard key={c.id} concern={c} handleSelect={handleSelect} speakText={speakText} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ConcernCard = ({ concern, handleSelect, speakText }) => (
    <button
        className="card card-glass group flex flex-col items-center text-center p-8 transition-all hover:border-primary hover:shadow-primary/20"
        style={{
            minHeight: '220px',
            borderRadius: '2rem'
        }}
        onClick={() => handleSelect(concern)}
        onMouseEnter={() => speakText(concern.label)}
    >
        <div className="icon-wrapper p-6 rounded-[1.5rem] bg-white shadow-sm mb-6 group-hover:scale-110 group-hover:shadow-md transition-all">
            {concern.icon}
        </div>
        <span className="font-extrabold text-2xl text-slate-800 tracking-tight group-hover:text-primary transition-colors">{concern.label}</span>
    </button>
);

export default SelectConcern;
