import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, CheckCircle, Clock, MessageSquare,
  Activity, Star, TrendingUp, LogOut, User, Stethoscope,
  ChevronRight, AlertCircle, FileText
} from 'lucide-react';
import api from '../services/api';

const DoctorPortal = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [completingId, setCompletingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [showNotesFor, setShowNotesFor] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'doctor') { navigate('/'); return; }
    setDoctor(u);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, patRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/patients'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmAppt = async (id) => {
    try {
      await api.put(`/appointments/${id}/confirm`);
      fetchData();
    } catch (e) { alert('Failed to confirm'); }
  };

  const completeAppt = async (id) => {
    try {
      await api.put(`/appointments/${id}/complete`, { doctor_notes: notes });
      setShowNotesFor(null);
      setNotes('');
      fetchData();
    } catch (e) { alert('Failed to complete'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const today = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]);
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');

  const statusColors = {
    pending: { bg: '#fef3c7', color: '#d97706' },
    confirmed: { bg: '#dbeafe', color: '#2563eb' },
    completed: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
      <Activity size={40} style={{ animation: 'spin 1s linear infinite' }} />
      <p>Loading your portal...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        borderRadius: '1.5rem', padding: '1.5rem 2rem', marginBottom: '2rem',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700,
          }}>
            {doctor?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>Doctor Portal</p>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem' }}>
              Dr. {doctor?.name || 'Doctor'}
            </h1>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem', textTransform: 'capitalize' }}>
              {doctor?.specialization} · {doctor?.domain}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: "Today's Patients", value: today.length, icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Pending', value: pending.length, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Confirmed', value: confirmed.length, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Completed', value: completed.length, icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Total Patients', value: patients.length, icon: Users, color: '#ef4444', bg: '#fef2f2' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, borderRadius: '1rem', padding: '1.25rem',
            border: `1px solid ${stat.color}22`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>{stat.value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: stat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
        background: '#f8fafc', borderRadius: '1rem', padding: '0.4rem',
        overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: 'Appointments' },
          { id: 'patients', label: 'My Patients' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: '0 0 auto', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: activeTab === tab.id ? 'linear-gradient(135deg, #0f172a, #1e3a5f)' : 'transparent',
            color: activeTab === tab.id ? 'white' : '#64748b',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Appointments Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No appointments yet. Patients can find you on the Book Appointment page.</p>
            </div>
          ) : (
            appointments.map(a => {
              const sc = statusColors[a.status] || statusColors.pending;
              return (
                <div key={a.id} style={{
                  background: 'white', borderRadius: '1.25rem', padding: '1.5rem',
                  border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700,
                        }}>
                          {a.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontWeight: 700 }}>{a.patient_name}</h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{a.patient_email}</p>
                        </div>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem',
                          fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize',
                        }}>{a.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {a.appointment_date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {a.appointment_time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MessageSquare size={12} /> {a.consultation_type}
                        </span>
                      </div>
                      {a.symptoms && (
                        <p style={{
                          margin: '0.75rem 0 0', padding: '0.5rem 0.75rem',
                          background: '#f8fafc', borderRadius: '0.5rem',
                          fontSize: '0.85rem', color: '#475569',
                        }}>
                          <strong>Symptoms:</strong> {a.symptoms}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {a.status === 'pending' && (
                        <button onClick={() => confirmAppt(a.id)} style={{
                          padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
                          fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                        }}>Confirm</button>
                      )}
                      {a.status === 'confirmed' && (
                        <>
                          {showNotesFor === a.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <textarea
                                placeholder="Add consultation notes..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                style={{
                                  padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                                  fontSize: '0.85rem', resize: 'vertical', minWidth: 200, fontFamily: 'inherit',
                                }}
                              />
                              <button onClick={() => completeAppt(a.id)} style={{
                                padding: '0.6rem', borderRadius: '0.5rem', border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                                fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                              }}>Mark Complete</button>
                            </div>
                          ) : (
                            <button onClick={() => setShowNotesFor(a.id)} style={{
                              padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                              background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                              fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                            }}>Complete</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No patients yet.</p>
            </div>
          ) : (
            patients.map(p => (
              <div key={p.id} style={{
                background: 'white', borderRadius: '1.25rem', padding: '1.25rem',
                border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0,
                }}>
                  {p.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.2rem', fontWeight: 700 }}>{p.name}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{p.email}</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                  <p style={{ margin: 0 }}>{p.total_appointments} visit(s)</p>
                  {p.age && <p style={{ margin: 0 }}>Age {p.age}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorPortal;
