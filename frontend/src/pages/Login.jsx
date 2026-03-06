import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, color: '#0a0e1a', fontSize: 24, margin: '0 auto 16px' }}>E</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8' }}>Sign in to your EventSphere account</p>
        </div>

        <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-control" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #1e293b', marginTop: 24, paddingTop: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>Demo Credentials</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setForm({ email: 'user@demo.com', password: 'demo123' })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#94a3b8', fontSize: 12, fontFamily: 'DM Sans' }}>
                  👤 User Demo
                </button>
                <button onClick={() => setForm({ email: 'admin@demo.com', password: 'admin123' })} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#f59e0b', fontSize: 12, fontFamily: 'DM Sans' }}>
                  ⚡ Admin Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: '#f59e0b', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
