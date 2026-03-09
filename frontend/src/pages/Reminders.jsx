import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import { remindersAPI } from '../services/api';
import { Clock, Plus, Trash2, Calendar, Pill, Bell } from 'lucide-react';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        medicine_name: '',
        dosage: '',
        frequency: 'daily',
        reminder_time: '09:00',
        notes: ''
    });

    const { speakText } = useContext(AppContext);

    const fetchReminders = async () => {
        try {
            const res = await remindersAPI.getAll();
            setReminders(res.data.reminders || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await remindersAPI.create(formData);
            speakText(`Reminder set for ${formData.medicine_name} at ${formData.reminder_time}`);
            setShowForm(false);
            setFormData({
                medicine_name: '',
                dosage: '',
                frequency: 'daily',
                reminder_time: '09:00',
                notes: ''
            });
            fetchReminders();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete reminder for ${name}?`)) {
            try {
                await remindersAPI.delete(id);
                speakText("Reminder deleted");
                fetchReminders();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="container py-8 animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 flex-wrap gap-4">
                <div>
                    <h1>My Reminders</h1>
                    <p className="text-secondary text-lg">Never miss a dose.</p>
                </div>
                <button
                    className="btn btn-primary px-6"
                    onClick={() => setShowForm(!showForm)}
                    onMouseEnter={() => speakText(showForm ? "Cancel adding reminder" : "Add a new reminder")}
                >
                    {showForm ? 'Cancel' : <><Plus /> Add Reminder</>}
                </button>
            </div>

            {showForm && (
                <div className="card shadow-lg mb-8 animate-slide-up border-t-4 border-blue-500 bg-blue-50">
                    <h3 className="mb-6 flex items-center gap-2 text-blue-800"><Bell size={24} /> Set New Reminder</h3>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="label font-bold text-slate-700">Medicine Name</label>
                            <input
                                type="text"
                                name="medicine_name"
                                className="input p-3 border-slate-300"
                                placeholder="e.g. Paracetamol"
                                required
                                value={formData.medicine_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="label font-bold text-slate-700">Dosage</label>
                            <input
                                type="text"
                                name="dosage"
                                className="input p-3 border-slate-300"
                                placeholder="e.g. 1 tablet"
                                required
                                value={formData.dosage}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="label font-bold text-slate-700">Time to Take</label>
                            <input
                                type="time"
                                name="reminder_time"
                                className="input p-3 border-slate-300 font-mono text-lg"
                                required
                                value={formData.reminder_time}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="label font-bold text-slate-700">Frequency</label>
                            <select
                                name="frequency"
                                className="input p-3 border-slate-300"
                                value={formData.frequency}
                                onChange={handleChange}
                            >
                                <option value="daily">Every Day</option>
                                <option value="twice_daily">Twice a Day</option>
                                <option value="weekly">Once a Week</option>
                            </select>
                        </div>

                        <div className="input-group md:col-span-2 mt-4">
                            <button type="submit" className="btn btn-primary w-full py-4 text-lg font-bold shadow-md">
                                Save Reminder
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12"><div className="spinner border-blue-500" style={{ width: '40px', height: '40px' }}></div></div>
            ) : reminders.length === 0 ? (
                <div className="card p-12 text-center bg-slate-50 border-dashed border-2 border-slate-300">
                    <Clock size={64} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-slate-500 font-medium">No reminders set yet</h3>
                    <p className="text-slate-400">Click "Add Reminder" to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reminders.map(reminder => (
                        <div key={reminder.id} className="card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="bg-blue-100 text-blue-700 p-3 rounded-full shrink-0 group-hover:scale-110 transition-transform">
                                    <Clock size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="m-0 text-xl font-bold flex items-center gap-2">
                                        {reminder.medicine_name}
                                        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{reminder.dosage}</span>
                                    </h3>
                                    <div className="text-slate-500 font-medium flex gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-slate-700"><Calendar size={16} /> {reminder.frequency.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0 pl-16 md:pl-0 border-t md:border-0 border-slate-100 pt-4 md:pt-0 mt-2 md:mt-0">
                                <div className="text-3xl font-mono text-primary font-bold tracking-tighter bg-blue-50 px-4 py-2 rounded-lg">
                                    {reminder.reminder_time}
                                </div>
                                <button
                                    className="btn btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-full cursor-pointer ml-4"
                                    onClick={() => handleDelete(reminder.id, reminder.medicine_name)}
                                    title="Delete Reminder"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reminders;
