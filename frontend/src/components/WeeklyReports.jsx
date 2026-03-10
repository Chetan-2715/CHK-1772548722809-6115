import React from 'react';
import { BarChart, Activity, TrendingUp } from 'lucide-react';

const WeeklyReports = () => {
    return (
        <div className="card card-glass p-6 animate-fade-in">
            <h2 className="mb-4 flex items-center gap-2 text-slate-800"><BarChart className="text-primary" /> Weekly Health Reports</h2>
            <p className="text-secondary mb-6">Here is a summary of your scanned medications and adherence for the past week.</p>

            {/* Dummy Report Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-2"><TrendingUp size={18} /> Medication Adherence</h3>
                    <div className="w-full bg-slate-200 rounded-full h-4 mb-2 mt-4 overflow-hidden">
                        <div className="bg-success h-4" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm font-bold m-0" style={{ color: 'var(--success-color)' }}>85% On Time</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2 mb-2"><Activity size={18} /> Scans this Week</h3>
                    <p className="text-4xl font-extrabold text-primary m-0">4</p>
                    <p className="text-sm text-secondary m-0 mt-1">New Prescriptions analyzed</p>
                </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="bg-blue-200 p-2 rounded-lg mt-1">
                    <Activity size={24} className="text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold m-0 mb-2 text-lg">AI Health Assistant Note</h4>
                    <p className="m-0 leading-relaxed">You've successfully taken all your required morning doses for the last 5 days! Keep up the excellent work. Remember to take your Calcium supplement after lunch tomorrow for optimal absorption.</p>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReports;
