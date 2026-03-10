import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { prescriptionAPI } from '../services/api';
import { FileText, Calendar, MapPin, Search, ChevronDown, ChevronUp, Clock, Pill, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { user, speakText } = useContext(AppContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState([]);
    const [detailedData, setDetailedData] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [currentDomain, setCurrentDomain] = useState(localStorage.getItem('selectedConcern') || 'allopathy');
    const { t } = useTranslation();

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const res = await prescriptionAPI.getAll();
                setPrescriptions(res.data.prescriptions || []);
                speakText(`You have ${res.data.prescriptions?.length || 0} prescriptions scanned.`);
            } catch (err) {
                console.error("Failed to load prescriptions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [speakText, currentDomain]);

    const handleDomainChange = (e) => {
        const newDomain = e.target.value;
        localStorage.setItem('selectedConcern', newDomain);
        setCurrentDomain(newDomain);
        speakText(`Domain changed to ${newDomain}`);
    };

    const toggleExpand = async (id) => {
        if (expandedIds.includes(id)) {
            setExpandedIds(prev => prev.filter(e => e !== id));
            return;
        }

        setExpandedIds(prev => [...prev, id]);

        if (!detailedData[id]) {
            setLoadingDetails(true);
            try {
                speakText("Loading full prescription details.");
                const res = await prescriptionAPI.getById(id);
                setDetailedData(prev => ({ ...prev, [id]: res.data }));
            } catch (err) {
                console.error("Error fetching detail", err);
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    return (
        <div className="container py-10 animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                <div>
                    <h1 className="mb-2">{t('dashboard.title')}</h1>
                    <p className="text-secondary text-lg font-medium opacity-80">{t('dashboard.welcome', { name: user?.name || 'User' })}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 flex-1 lg:flex-none">
                        <label className="text-secondary font-semibold whitespace-nowrap text-sm uppercase tracking-wider">{t('dashboard.active_domain')}</label>
                        <select
                            value={currentDomain}
                            onChange={handleDomainChange}
                            className="bg-transparent border-none outline-none font-bold text-primary cursor-pointer flex-1"
                            style={{ fontSize: '1rem', minWidth: '140px' }}
                        >
                            <option value="ayurvedic">{t('domains.ayurvedic')}</option>
                            <option value="homeopathy">{t('domains.homeopathy')}</option>
                            <option value="allopathy">{t('domains.allopathy')}</option>
                            <option value="cardiologist">{t('domains.cardiologist')}</option>
                            <option value="neurological">{t('domains.neurological')}</option>
                            <option value="orthopedic">{t('domains.orthopedic')}</option>
                            <option value="pediatric">{t('domains.pediatric')}</option>
                            <option value="other">{t('domains.other')}</option>
                        </select>
                    </div>
                    <Link to="/upload" className="btn btn-primary px-8 py-3.5 shadow-primary" onMouseEnter={() => speakText("Scan a new prescription")}>
                        <Camera className="mr-2" size={20} />
                        {t('dashboard.scan_new')}
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 animate-pulse"><div className="spinner border-blue-500"></div></div>
            ) : prescriptions.length === 0 ? (
                <div className="card text-center py-20 px-8 bg-slate-50/50 border-dashed border-2 border-slate-200 shadow-none hover:shadow-none hover:translate-y-0">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <FileText size={40} className="text-slate-300" />
                    </div>
                    <h2 className="text-slate-700 mb-3">{t('dashboard.no_prescriptions')}</h2>
                    <p className="text-secondary mb-8 text-lg max-w-md mx-auto">{t('dashboard.scan_first')}</p>
                    <Link to="/upload" className="btn btn-primary btn-lg">{t('dashboard.start_scanning')}</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {prescriptions.map((p) => {
                        const isExpanded = expandedIds.includes(p.id);
                        const data = detailedData[p.id];

                        return (
                            <div key={p.id} className="card p-0 overflow-hidden bg-white shadow-md border border-slate-200 transition-all">
                                <div
                                    className="p-6 cursor-pointer flex justify-between items-center hover:bg-slate-50"
                                    onClick={() => toggleExpand(p.id)}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-primary-light text-primary rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <h3 className="m-0 text-xl font-bold">
                                                {p.doctor_name || t('dashboard.unknown_doctor')}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary font-medium">
                                            {p.hospital_name && (
                                                <span className="flex items-center gap-1"><MapPin size={16} /> {p.hospital_name}</span>
                                            )}
                                            <span className="flex items-center gap-1"><Calendar size={16} /> {p.prescription_date ? new Date(p.prescription_date).toLocaleDateString() : (p.created_at ? new Date(p.created_at).toLocaleDateString() : t('dashboard.unknown_date'))}</span>
                                            <span className="flex items-center gap-1"><Pill size={16} /> {t('dashboard.medicines_count', { count: p.medicines_count })}</span>
                                        </div>
                                    </div>
                                    <div className="text-slate-400">
                                        {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-6 pt-2 border-t border-slate-100 bg-slate-50 animate-slide-up">
                                        {loadingDetails && !data ? (
                                            <div className="p-4 text-center"><div className="spinner mini mx-auto"></div></div>
                                        ) : data ? (
                                            <div className="mt-6">
                                                <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">{t('dashboard.medicines_info')}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {data.medicines && data.medicines.map((med, idx) => (
                                                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h5 className="font-bold text-primary text-lg m-0">{med.medicine_name}</h5>
                                                                {med.duration && <span className="badge badge-primary">{med.duration}</span>}
                                                            </div>
                                                            <div className="mb-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg inline-block">
                                                                <strong>{t('dashboard.dosage')}:</strong> {med.dosage} ({med.frequency})
                                                            </div>

                                                            {med.detailed_info && (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                                                    {med.detailed_info.usage_instructions && (
                                                                        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem', lineHeight: '1.6' }}><strong><Clock size={14} className="inline mr-1" />{t('dashboard.instructions')}:</strong> {med.detailed_info.usage_instructions}</p>
                                                                    )}
                                                                    {med.detailed_info.usage && (
                                                                        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem', lineHeight: '1.6' }}><strong>{t('dashboard.usage')}:</strong> {med.detailed_info.usage}</p>
                                                                    )}
                                                                    {med.detailed_info.precautions && (
                                                                        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.9rem', lineHeight: '1.6', color: '#d97706' }}><strong>{t('dashboard.precautions')}:</strong> {med.detailed_info.precautions}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-secondary p-4">{t('dashboard.could_not_load_details')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
