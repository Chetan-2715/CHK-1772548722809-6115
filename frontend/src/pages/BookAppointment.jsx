import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageSquare, MapPin, Stethoscope, Star, Search, ChevronRight, CheckCircle } from 'lucide-react';
import { AppContext } from '../App';
import api from '../services/api';

const CONCERN_COLORS = {
  allopathy: { gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', light: '#eff6ff' },
  ayurvedic: { gradient: 'linear-gradient(135deg, #16a34a, #15803d)', light: '#f0fdf4' },
  homeopathy: { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', light: '#f5f3ff' },
  unani: { gradient: 'linear-gradient(135deg, #d97706, #b45309)', light: '#fffbeb' },
  siddha: { gradient: 'linear-gradient(135deg, #db2777, #9d174d)', light: '#fdf2f8' },
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [bookingData, setBookingData] = useState({
    appointment_date: '',
    appointment_time: '',
    consultation_type: 'chat',
    symptoms: ''
  });
  const [bookingStep, setBookingStep] = useState('search'); // search | form | success
  const [bookedAppt, setBookedAppt] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('find'); // find | my

  const selectedConcern = localStorage.getItem('selectedConcern') || '';

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
  }, [filterDomain]);

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDomain) params.append('domain', filterDomain);
      else if (selectedConcern) params.append('domain', selectedConcern);
      const res = await api.get(`/doctor/all?${params}`);
      // Normalise: backend returns array directly, but guard against wrapped responses
      const raw = Array.isArray(res.data) ? res.data : (res.data?.doctors ?? []);
      // Ensure consultation_types is always an array on every doctor object
      const normalised = raw.map(d => ({
        ...d,
        consultation_types: Array.isArray(d.consultation_types)
          ? d.consultation_types
          : typeof d.consultation_types === 'string'
            ? d.consultation_types.split(',')
            : ['chat'],
      }));
      setDoctors(normalised);
    } catch (e) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setMyAppointments(Array.isArray(res.data) ? res.data : (res.data?.appointments ?? []));
    } catch (e) { setMyAppointments([]); }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBook = async () => {
    if (!bookingData.appointment_date || !bookingData.appointment_time) {
      alert('Please select date and time');
      return;
    }
    try {
      const res = await api.post('/appointments/book', {
        doctor_id: selectedDoctor.id,
        ...bookingData,
      });
      setBookedAppt(res.data);
      setBookingStep('success');
      fetchMyAppointments();
    } catch (e) {
      alert(e.response?.data?.detail || 'Booking failed. Please try again.');
    }
  };

  const cancelAppt = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchMyAppointments();
    } catch (e) {
      alert('Failed to cancel appointment');
    }
  };

  const concern = selectedConcern || 'allopathy';
  const colors = CONCERN_COLORS[concern] || CONCERN_COLORS.allopathy;

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
  };

  const consultIcons = { chat: MessageSquare, video: Video, 'in-person': MapPin };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        background: colors.gradient,
        borderRadius: '1.5rem',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-2rem', top: '-2rem',
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <Stethoscope size={32} style={{ marginBottom: '0.5rem' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Book an Appointment
        </h1>
        <p style={{ opacity: 0.85, margin: 0 }}>
          Connect with certified {concern} specialists
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
        background: 'var(--card-bg, #f8fafc)', borderRadius: '1rem', padding: '0.4rem',
      }}>
        {[
          { id: 'find', label: 'Find a Doctor' },
          { id: 'my', label: `My Appointments (${myAppointments.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            background: activeTab === tab.id ? colors.gradient : 'transparent',
            color: activeTab === tab.id ? 'white' : 'var(--text-secondary, #64748b)',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── FIND DOCTOR TAB ── */}
      {activeTab === 'find' && bookingStep === 'search' && (
        <>
          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1.5px solid var(--border, #e2e8f0)', borderRadius: '0.75rem',
                  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                  background: 'var(--card-bg, white)',
                }}
              />
            </div>
            <select
              value={filterDomain}
              onChange={e => setFilterDomain(e.target.value)}
              style={{
                padding: '0.75rem 1rem', border: '1.5px solid var(--border, #e2e8f0)',
                borderRadius: '0.75rem', fontSize: '0.9rem', outline: 'none',
                background: 'var(--card-bg, white)', cursor: 'pointer',
              }}
            >
              <option value="">All Domains</option>
              <option value="allopathy">Allopathy</option>
              <option value="ayurvedic">Ayurvedic</option>
              <option value="homeopathy">Homeopathy</option>
              <option value="unani">Unani</option>
              <option value="siddha">Siddha</option>
            </select>
          </div>

          {/* Doctor Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', borderRadius: '1rem',
              background: 'var(--card-bg, #f8fafc)', color: '#94a3b8',
            }}>
              <Stethoscope size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No doctors found for this domain.</p>
              <p style={{ fontSize: '0.85rem' }}>Doctors can register at the Doctor portal.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredDoctors.map(doc => {
                const dcol = CONCERN_COLORS[doc.domain] || CONCERN_COLORS.allopathy;
                return (
                  <div key={doc.id} style={{
                    background: 'var(--card-bg, white)', borderRadius: '1.25rem',
                    padding: '1.5rem', border: '1.5px solid var(--border, #e2e8f0)',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    transition: 'all 0.2s', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                      background: dcol.gradient, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700,
                    }}>
                      {doc.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Dr. {doc.name}</h3>
                        {doc.is_verified && (
                          <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                            ✓ Verified
                          </span>
                        )}
                        <span style={{
                          background: dcol.light, color: doc.domain === 'allopathy' ? '#2563eb' : doc.domain === 'ayurvedic' ? '#15803d' : '#7c3aed',
                          fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {doc.domain}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{doc.specialization}</p>
                      {doc.clinic_name && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {doc.clinic_name}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={12} style={{ color: '#f59e0b' }} /> {doc.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span>{doc.total_consultations || 0} consultations</span>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>
                          {doc.consultation_fee > 0 ? `₹${doc.consultation_fee}` : 'Free'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedDoctor(doc); setBookingStep('form'); }}
                      style={{
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                        border: 'none', cursor: 'pointer', fontWeight: 600,
                        background: dcol.gradient, color: 'white',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      Book <ChevronRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── BOOKING FORM ── */}
      {activeTab === 'find' && bookingStep === 'form' && selectedDoctor && (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button onClick={() => setBookingStep('search')} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600,
          }}>← Back to doctors</button>

          <div style={{
            background: 'var(--card-bg, white)', borderRadius: '1.25rem',
            padding: '2rem', border: '1.5px solid var(--border, #e2e8f0)',
          }}>
            <h2 style={{ margin: '0 0 1.5rem', fontWeight: 700 }}>
              Book with Dr. {selectedDoctor.name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Date */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <Calendar size={16} /> Appointment Date
                </label>
                <input type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.appointment_date}
                  onChange={e => setBookingData({ ...bookingData, appointment_date: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem', border: '1.5px solid var(--border, #e2e8f0)',
                    borderRadius: '0.75rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    background: 'var(--card-bg, white)',
                  }}
                />
              </div>

              {/* Time */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <Clock size={16} /> Preferred Time
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                    <button key={t} onClick={() => setBookingData({ ...bookingData, appointment_time: t })}
                      style={{
                        padding: '0.6rem', borderRadius: '0.6rem', border: '1.5px solid',
                        borderColor: bookingData.appointment_time === t ? '#3b82f6' : 'var(--border, #e2e8f0)',
                        background: bookingData.appointment_time === t ? '#eff6ff' : 'var(--card-bg, white)',
                        color: bookingData.appointment_time === t ? '#2563eb' : 'var(--text, #1e293b)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', display: 'block' }}>
                  Consultation Type
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectedDoctor.consultation_types.map(type => {
                    const Icon = consultIcons[type] || MessageSquare;
                    return (
                      <button key={type} onClick={() => setBookingData({ ...bookingData, consultation_type: type })}
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid',
                          borderColor: bookingData.consultation_type === type ? '#3b82f6' : 'var(--border, #e2e8f0)',
                          background: bookingData.consultation_type === type ? '#eff6ff' : 'var(--card-bg, white)',
                          color: bookingData.consultation_type === type ? '#2563eb' : '#64748b',
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        }}>
                        <Icon size={16} /> {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', display: 'block' }}>
                  Symptoms / Reason for visit
                </label>
                <textarea
                  placeholder="Describe your symptoms briefly..."
                  value={bookingData.symptoms}
                  onChange={e => setBookingData({ ...bookingData, symptoms: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%', padding: '0.75rem', border: '1.5px solid var(--border, #e2e8f0)',
                    borderRadius: '0.75rem', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', background: 'var(--card-bg, white)', fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Fee Info */}
              <div style={{
                background: colors.light, borderRadius: '0.75rem', padding: '1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600 }}>Consultation Fee</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: selectedDoctor.consultation_fee > 0 ? '#dc2626' : '#16a34a' }}>
                  {selectedDoctor.consultation_fee > 0 ? `₹${selectedDoctor.consultation_fee}` : 'FREE'}
                </span>
              </div>

              <button onClick={handleBook} style={{
                width: '100%', padding: '1rem', borderRadius: '0.75rem', border: 'none',
                background: colors.gradient, color: 'white', fontWeight: 700,
                fontSize: '1rem', cursor: 'pointer',
              }}>
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {activeTab === 'find' && bookingStep === 'success' && bookedAppt && (
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#dcfce7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={40} style={{ color: '#16a34a' }} />
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Appointment Booked!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Your appointment with <strong>Dr. {bookedAppt.doctor_name}</strong> on{' '}
            <strong>{bookedAppt.appointment_date}</strong> at <strong>{bookedAppt.appointment_time}</strong> is confirmed.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => { setBookingStep('search'); setActiveTab('my'); }} style={{
              flex: 1, padding: '0.9rem', borderRadius: '0.75rem', border: 'none',
              background: colors.gradient, color: 'white', fontWeight: 700, cursor: 'pointer',
            }}>View My Appointments</button>
            <button onClick={() => setBookingStep('search')} style={{
              flex: 1, padding: '0.9rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer',
              border: '1.5px solid var(--border, #e2e8f0)', background: 'transparent',
            }}>Book Another</button>
          </div>
        </div>
      )}

      {/* ── MY APPOINTMENTS TAB ── */}
      {activeTab === 'my' && (
        <div>
          {myAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No appointments yet.</p>
              <button onClick={() => setActiveTab('find')} style={{
                marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                border: 'none', background: colors.gradient, color: 'white', cursor: 'pointer', fontWeight: 600,
              }}>Find a Doctor</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myAppointments.map(a => (
                <div key={a.id} style={{
                  background: 'var(--card-bg, white)', borderRadius: '1.25rem', padding: '1.5rem',
                  border: '1.5px solid var(--border, #e2e8f0)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontWeight: 700 }}>Dr. {a.doctor_name}</h3>
                      <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{a.doctor_specialization}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {a.appointment_date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {a.appointment_time}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600,
                        background: statusColors[a.status] + '20', color: statusColors[a.status],
                        textTransform: 'capitalize',
                      }}>{a.status}</span>
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <button onClick={() => cancelAppt(a.id)} style={{
                          background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem',
                          cursor: 'pointer', fontWeight: 600,
                        }}>Cancel</button>
                      )}
                    </div>
                  </div>
                  {a.doctor_notes && (
                    <div style={{
                      marginTop: '0.75rem', padding: '0.75rem', background: '#f0fdf4',
                      borderRadius: '0.75rem', fontSize: '0.85rem', color: '#15803d',
                    }}>
                      <strong>Doctor's Notes:</strong> {a.doctor_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
