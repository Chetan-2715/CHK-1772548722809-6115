import React, { useState, useContext } from 'react';
import PatientForm from '../components/PatientForm';
import MedicalSummary from '../components/MedicalSummary';
import CaretakerSetup from '../components/CaretakerSetup';
import WeeklyReports from '../components/WeeklyReports';
import AppointmentScheduler from '../components/AppointmentScheduler';
import { FileText, Users, BarChart2, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, speakText } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('medical');
    const [isEditingMedical, setIsEditingMedical] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        speakText('Logged out successfully');
    };

    const tabs = [
        { id: 'medical', name: 'Medical History', icon: FileText },
        { id: 'caretaker', name: 'Caretaker', icon: Users },
        { id: 'reports', name: 'Weekly Reports', icon: BarChart2 },
        { id: 'appointments', name: 'Appointment Scheduler', icon: Calendar },
    ];

    return (
        <div className="container py-8 animate-fade-in">
            <h1 className="mb-6 text-center text-3xl font-bold text-slate-800">My Profile</h1>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar */}
                <div className="w-full md:w-1/4">
                    <div className="flex flex-col gap-6 md:sticky md:top-24 pl-2 font-body">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 w-full text-left py-1 transition-all group focus:outline-none`}
                                >
                                    <Icon size={32} color={isActive ? "var(--primary-color)" : "#1E293B"} strokeWidth={isActive ? 2.5 : 2} style={{ transition: 'color 0.2s' }} />
                                    <span style={{ color: isActive ? "var(--primary-color)" : "#1E293B", transition: 'color 0.2s' }} className={`text-[1.15rem] leading-none ${isActive ? 'font-bold' : 'font-bold'} hover:opacity-80`}>
                                        {tab.name}
                                    </span>
                                </button>
                            );
                        })}
                        <div className="h-6"></div> {/* Additional Spacing for Logout */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-4 w-full text-left py-1 transition-all group focus:outline-none`}
                            onMouseEnter={() => speakText("Logout")}
                        >
                            <LogOut size={32} color="#1E293B" strokeWidth={2} style={{ transition: 'color 0.2s' }} className="group-hover:opacity-80" />
                            <span style={{ color: "#1E293B" }} className="text-[1.15rem] leading-none font-bold group-hover:opacity-80 transition-opacity">
                                Logout
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full md:w-3/4">
                    {activeTab === 'medical' && (
                        isEditingMedical ? (
                            <PatientForm onComplete={() => setIsEditingMedical(false)} />
                        ) : (
                            <MedicalSummary onEdit={() => setIsEditingMedical(true)} />
                        )
                    )}
                    {activeTab === 'caretaker' && <CaretakerSetup />}
                    {activeTab === 'reports' && <WeeklyReports />}
                    {activeTab === 'appointments' && <AppointmentScheduler />}
                </div>
            </div>
        </div>
    );
};

export default Profile;
