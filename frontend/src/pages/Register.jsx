import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to EventSphere 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, color: '#0a0e1a', fontSize: 24, margin: '0 auto 16px' }}>E</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: '#94a3b8' }}>Join thousands of event enthusiasts</p>
        </div>

        <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" required placeholder="John Doe" value={form.name} onChange={update('name')} />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input className="form-control" placeholder="+91 9999999999" value={form.phone} onChange={update('phone')} />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" type="email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" required placeholder="Min 6 characters" value={form.password} onChange={update('password')} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="form-control" type="password" required placeholder="Repeat password" value={form.confirmPassword} onChange={update('confirmPassword')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#f59e0b', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
