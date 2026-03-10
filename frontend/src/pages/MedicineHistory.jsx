import React, { useState, useEffect, useContext } from 'react';
import { medicineAPI } from '../services/api';
import { History, Search, Camera, CheckSquare, Clock } from 'lucide-react';

const MedicineHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await medicineAPI.getHistory();
                setHistory(res.data.history || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getActionIcon = (action) => {
        switch (action) {
            case 'search': return <Search className="text-blue-500" />;
            case 'scan': return <Camera className="text-purple-500" />;
            case 'verify': return <CheckSquare className="text-green-500" />;
            case 'prescription': return <Search className="text-orange-500" />;
            default: return <History className="text-slate-500" />;
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case 'search': return 'Searched manually';
            case 'scan': return 'Scanned Barcode/Image';
            case 'verify': return 'Verified Check';
            case 'prescription': return 'Extracted from Prescription';
            default: return 'Viewed';
        }
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
            <div className="mb-8">
                <h1>Interaction History</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.25rem' }}>A log of all medicines you have checked.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><div className="spinner border-blue-500"></div></div>
            ) : history.length === 0 ? (
                <div className="card text-center p-12 bg-slate-50 border-dashed border-2 border-slate-300">
                    <History size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-slate-500">No history yet</h3>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {history.map((item, index) => (
                        <div key={item.id} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-full">
                                    {getActionIcon(item.action)}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{item.medicine_name}</h3>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>{getActionText(item.action)}</span>
                                </div>
                            </div>
                            <div className="text-sm text-slate-400 font-mono bg-slate-50 px-3 py-1 rounded-md flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(item.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicineHistory;
