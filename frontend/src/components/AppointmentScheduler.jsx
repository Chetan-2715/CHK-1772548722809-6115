import React from 'react';
import { Calendar, Lock, Crown } from 'lucide-react';

const AppointmentScheduler = () => {
    return (
        <div className="card card-glass p-8 animate-fade-in text-center border-2 border-amber-200" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)' }}>
            <div className="inline-flex items-center justify-center p-5 bg-amber-100 text-amber-600 rounded-full mb-6 shadow-sm">
                <Crown size={48} />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-3">Appointment Scheduler</h2>
            <p className="text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                Seamlessly schedule doctor appointments, get AI-powered availability matching, and manage all your follow-ups in one place.
            </p>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 max-w-sm mx-auto mb-8 relative overflow-hidden text-left user-select-none">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:backdrop-blur-[2px]">
                    <div className="bg-slate-800/80 text-white px-4 py-2 rounded-full flex items-center gap-2 mb-2 shadow-lg">
                        <Lock size={16} />
                        <span className="font-bold text-sm">Locked Feature</span>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Upcoming</h3>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Dr. Sharma (Cardiology)</span>
                    <span className="text-xs font-bold text-primary bg-primary-light px-2 py-1 rounded">10:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Dr. Patel (General)</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Tomorrow</span>
                </div>
            </div>

            <button className="btn w-full max-w-md mx-auto flex items-center justify-center gap-2 text-lg py-3 shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                <Crown size={22} className="mb-1" />
                Take Pro Mode to unlock
            </button>
        </div>
    );
};

export default AppointmentScheduler;
