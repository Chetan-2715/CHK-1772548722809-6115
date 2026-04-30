import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Building2, Phone, ArrowRight, Star } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    icon: '🏥',
    price_monthly: 999,
    price_yearly: 9990,
    badge: null,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    bg: '#eff6ff',
    features: [
      'Up to 50 patients',
      'Up to 3 doctors',
      'AI Prescription scanning',
      'Medicine verification',
      'Medication reminders',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: '🏨',
    price_monthly: 4999,
    price_yearly: 49990,
    badge: 'Most Popular',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    bg: '#f5f3ff',
    features: [
      'Up to 500 patients',
      'Up to 20 doctors',
      'Everything in Basic',
      'Appointment booking system',
      'Doctor portal dashboard',
      'Analytics & reports',
      'Bulk patient CSV upload',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '🏢',
    price_monthly: null,
    price_yearly: null,
    badge: 'Custom',
    color: '#0f172a',
    gradient: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
    bg: '#f8fafc',
    features: [
      'Unlimited patients & doctors',
      'Everything in Professional',
      'White-label API access',
      'Custom EHR integrations',
      'Multi-hospital network',
      'Dedicated account manager',
      'SLA guarantee (99.9% uptime)',
      'HIPAA compliance package',
    ],
    cta: 'Contact Sales',
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly'); // monthly | yearly

  const handleCTA = (plan) => {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@scan4elders.com?subject=Enterprise Inquiry';
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1rem 1rem 4rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '2rem',
          background: 'linear-gradient(135deg, #8b5cf620, #3b82f620)',
          color: '#6d28d9', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem',
          border: '1px solid #8b5cf630',
        }}>
          🚀 B2B Health Platform
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
          Simple, Transparent
          <br />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Pricing for Healthcare
          </span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: 520, margin: '0 auto 2rem' }}>
          Power your hospital, clinic, or pharmacy with AI-driven medication management.
          Scale from a small practice to a multi-hospital network.
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex', background: '#f1f5f9', borderRadius: '1rem',
          padding: '0.35rem', gap: '0.25rem',
        }}>
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly', badge: 'Save 17%' },
          ].map(b => (
            <button key={b.id} onClick={() => setBilling(b.id)} style={{
              padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: billing === b.id ? 'white' : 'transparent',
              color: billing === b.id ? '#0f172a' : '#64748b',
              boxShadow: billing === b.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              {b.label}
              {b.badge && (
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                  borderRadius: '0.5rem', fontWeight: 700,
                }}>{b.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background: plan.id === 'professional' ? 'white' : 'white',
            borderRadius: '1.5rem',
            border: plan.id === 'professional' ? `2px solid ${plan.color}` : '1.5px solid #e2e8f0',
            padding: '2rem',
            position: 'relative',
            boxShadow: plan.id === 'professional'
              ? `0 20px 60px ${plan.color}25`
              : '0 4px 16px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            {/* Badge */}
            {plan.badge && (
              <div style={{
                position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
                background: plan.gradient, color: 'white', padding: '0.2rem 1rem',
                borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
              }}>{plan.badge}</div>
            )}

            {/* Plan Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{plan.icon}</div>
              <h2 style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1.4rem' }}>{plan.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                {plan.price_monthly !== null ? (
                  <>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>₹</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: plan.color }}>
                      {billing === 'monthly' ? plan.price_monthly.toLocaleString() : Math.floor(plan.price_yearly / 12).toLocaleString()}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>/month</span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: plan.color }}>Custom</span>
                )}
              </div>
              {billing === 'yearly' && plan.price_yearly && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Billed ₹{plan.price_yearly.toLocaleString()}/year
                </p>
              )}
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: plan.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.05rem',
                  }}>
                    <Check size={12} style={{ color: plan.color }} strokeWidth={3} />
                  </div>
                  <span style={{ color: '#374151' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button onClick={() => handleCTA(plan)} style={{
              width: '100%', padding: '0.9rem', borderRadius: '0.9rem', border: 'none',
              background: plan.gradient, color: 'white', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'opacity 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              {plan.cta}
              {plan.id === 'enterprise' ? <Phone size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.8rem', marginBottom: '2rem' }}>
          Compare Features
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: '1rem', border: '1.5px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1.5px solid #e2e8f0' }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.id} style={{
                    padding: '1rem', textAlign: 'center', fontWeight: 700,
                    color: p.color, borderBottom: '1.5px solid #e2e8f0',
                  }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Patients', basic: '50', pro: '500', ent: 'Unlimited' },
                { label: 'Doctors', basic: '3', pro: '20', ent: 'Unlimited' },
                { label: 'AI Prescription Scan', basic: '✓', pro: '✓', ent: '✓' },
                { label: 'Appointment Booking', basic: '–', pro: '✓', ent: '✓' },
                { label: 'Analytics Dashboard', basic: '–', pro: '✓', ent: '✓' },
                { label: 'White-label API', basic: '–', pro: '–', ent: '✓' },
                { label: 'Dedicated Support', basic: 'Email', pro: 'Priority', ent: 'Dedicated Manager' },
                { label: 'SLA Guarantee', basic: '–', pro: '–', ent: '99.9%' },
              ].map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '0.9rem 1.5rem', color: '#374151', fontWeight: 500 }}>{row.label}</td>
                  <td style={{ padding: '0.9rem', textAlign: 'center', color: row.basic === '–' ? '#cbd5e1' : '#374151' }}>{row.basic}</td>
                  <td style={{ padding: '0.9rem', textAlign: 'center', color: row.pro === '–' ? '#cbd5e1' : '#374151', fontWeight: row.pro === '✓' ? 700 : 400 }}>{row.pro}</td>
                  <td style={{ padding: '0.9rem', textAlign: 'center', color: row.ent === '–' ? '#cbd5e1' : '#374151', fontWeight: row.ent === '✓' ? 700 : 400 }}>{row.ent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Social Proof / Testimonial Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
        borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center', color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={20} style={{ color: '#f59e0b' }} fill="#f59e0b" />)}
        </div>
        <p style={{ fontSize: '1.2rem', fontStyle: 'italic', maxWidth: 560, margin: '0 auto 1rem', opacity: 0.9 }}>
          "Scan4Elders reduced prescription errors in our geriatric ward by 40% within the first month. The AI domain filtering is incredibly accurate."
        </p>
        <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: 0 }}>— Dr. Priya S., Apollo Hospitals</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {[['500+', 'Hospitals'], ['50K+', 'Patients Served'], ['98%', 'Accuracy Rate'], ['24/7', 'Support']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{n}</div>
              <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
