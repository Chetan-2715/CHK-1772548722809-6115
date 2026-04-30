import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, UserCheck, Activity, TrendingUp,
  BarChart3, Upload, Settings, LogOut, Plus, Shield,
  CheckCircle, AlertCircle, CreditCard, ChevronUp
} from 'lucide-react';
import api from '../services/api';

const PLAN_COLORS = {
  basic: { color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', bg: '#eff6ff' },
  professional: { color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', bg: '#f5f3ff' },
  enterprise: { color: '#0f172a', gradient: 'linear-gradient(135deg, #0f172a, #1e3a5f)', bg: '#f8fafc' },
};

const OrgDashboard = () => {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [addDoctorEmail, setAddDoctorEmail] = useState('');
  const [addDoctorMsg, setAddDoctorMsg] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'org_admin') { navigate('/'); return; }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/org/dashboard');
      setDashData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/org/add-doctor?doctor_email=${encodeURIComponent(addDoctorEmail)}`);
      setAddDoctorMsg({ type: 'success', text: res.data.message });
      setAddDoctorEmail('');
      fetchDashboard();
    } catch (err) {
      setAddDoctorMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to add doctor' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
      <Activity size={40} />
      <p>Loading dashboard...</p>
    </div>
  );

  const org = dashData?.organization;
  const stats = dashData?.stats;
  const doctors = dashData?.doctors || [];
  const patients = dashData?.patients || [];
  const planColors = PLAN_COLORS[org?.subscription_plan] || PLAN_COLORS.basic;

  const usedDoctors = parseInt(stats?.slots_used_doctors?.split('/')[0] || '0');
  const maxDoctors = parseInt(stats?.slots_used_doctors?.split('/')[1] || '1');
  const usedPatients = parseInt(stats?.slots_used_patients?.split('/')[0] || '0');
  const maxPatients = parseInt(stats?.slots_used_patients?.split('/')[1] || '1');

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{
        background: planColors.gradient,
        borderRadius: '1.5rem', padding: '1.5rem 2rem', marginBottom: '2rem',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '1rem', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={28} />
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Organization Dashboard
            </p>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem' }}>{org?.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.6rem',
                borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
              }}>
                {org?.subscription_plan} Plan
              </span>
              <span style={{ opacity: 0.7, fontSize: '0.8rem', textTransform: 'capitalize' }}>{org?.org_type}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/pricing')} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>
            <ChevronUp size={16} /> Upgrade
          </button>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', padding: '0.6rem 1.2rem', borderRadius: '0.75rem',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Doctors', value: stats?.total_doctors || 0, icon: UserCheck, color: '#3b82f6', bg: '#eff6ff', sub: stats?.slots_used_doctors },
          { label: 'Total Patients', value: stats?.total_patients || 0, icon: Users, color: '#10b981', bg: '#f0fdf4', sub: stats?.slots_used_patients },
          { label: 'Plan', value: org?.subscription_plan?.charAt(0).toUpperCase() + org?.subscription_plan?.slice(1), icon: CreditCard, color: planColors.color, bg: planColors.bg, sub: 'Active' },
          { label: 'Status', value: org?.is_active ? 'Active' : 'Inactive', icon: Shield, color: '#16a34a', bg: '#f0fdf4', sub: 'Verified' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${s.color}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{s.label}</p>
                <p style={{ margin: '0 0 0.2rem', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                {s.sub && <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{s.sub}</p>}
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Doctor Slots Used', used: usedDoctors, max: maxDoctors, color: '#3b82f6' },
          { label: 'Patient Slots Used', used: usedPatients, max: maxPatients, color: '#10b981' },
        ].map(meter => {
          const pct = Math.min((meter.used / meter.max) * 100, 100);
          const isWarning = pct > 80;
          return (
            <div key={meter.label} style={{
              background: 'white', borderRadius: '1rem', padding: '1.25rem',
              border: '1.5px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meter.label}</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isWarning ? '#ef4444' : meter.color }}>
                  {meter.used}/{meter.max}
                </span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: isWarning ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : `linear-gradient(90deg, ${meter.color}, ${meter.color}dd)`,
                  borderRadius: '1rem', transition: 'width 0.5s ease',
                }} />
              </div>
              {isWarning && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> Approaching limit — consider upgrading
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
        background: '#f8fafc', borderRadius: '1rem', padding: '0.4rem', overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: '🏥 Doctors' },
          { id: 'patients', label: '👥 Patients' },
          { id: 'add-doctor', label: '➕ Add Doctor' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: '0 0 auto', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: activeTab === t.id ? planColors.gradient : 'transparent',
            color: activeTab === t.id ? 'white' : '#64748b',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Doctors Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {doctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <UserCheck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No doctors added yet.</p>
              <button onClick={() => setActiveTab('add-doctor')} style={{
                marginTop: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                border: 'none', background: planColors.gradient, color: 'white', cursor: 'pointer', fontWeight: 600,
              }}>Add Your First Doctor</button>
            </div>
          ) : (
            doctors.map(d => (
              <div key={d.id} style={{
                background: 'white', borderRadius: '1.25rem', padding: '1.25rem',
                border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: planColors.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0,
                }}>
                  {d.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>Dr. {d.name}</h3>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600,
                      background: d.is_available ? '#dcfce7' : '#fee2e2',
                      color: d.is_available ? '#16a34a' : '#dc2626',
                    }}>
                      {d.is_available ? '● Available' : '● Unavailable'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    {d.specialization} · {d.domain}
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{d.total_consultations || 0}</p>
                  <p style={{ margin: 0 }}>consultations</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No patients enrolled yet.</p>
            </div>
          ) : (
            patients.map(p => (
              <div key={p.id} style={{
                background: 'white', borderRadius: '1.25rem', padding: '1.25rem',
                border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, flexShrink: 0,
                }}>{p.name?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 700 }}>{p.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{p.email}</p>
                </div>
                {p.age && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Age {p.age}</span>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Doctor Tab */}
      {activeTab === 'add-doctor' && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2rem', border: '1.5px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Add a Doctor</h2>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              The doctor must already have a Scan4Elders doctor account. Enter their registered email to link them to your organization.
            </p>

            {addDoctorMsg && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem',
                background: addDoctorMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: addDoctorMsg.type === 'success' ? '#16a34a' : '#dc2626',
                fontSize: '0.9rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                {addDoctorMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {addDoctorMsg.text}
              </div>
            )}

            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Doctor's Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="doctor@example.com"
                  value={addDoctorEmail}
                  onChange={e => setAddDoctorEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0',
                    borderRadius: '0.75rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button type="submit" style={{
                padding: '0.9rem', borderRadius: '0.75rem', border: 'none',
                background: planColors.gradient, color: 'white', fontWeight: 700,
                fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                <Plus size={18} /> Add Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgDashboard;
