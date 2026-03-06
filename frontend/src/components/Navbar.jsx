import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10,14,26,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid #1e293b' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, color: '#0a0e1a', fontSize: 18 }}>E</div>
          <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700 }}>Event<span style={{ color: '#f59e0b' }}>Sphere</span></span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#f59e0b' : '#94a3b8', fontWeight: 500, fontSize: 15, transition: 'color 0.2s' })}>Home</NavLink>
          <NavLink to="/events" style={({ isActive }) => ({ color: isActive ? '#f59e0b' : '#94a3b8', fontWeight: 500, fontSize: 15, transition: 'color 0.2s' })}>Events</NavLink>
          {isAdmin && (
            <NavLink to="/admin" style={({ isActive }) => ({ color: isActive ? '#f59e0b' : '#94a3b8', fontWeight: 500, fontSize: 15 })}>Admin</NavLink>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#f1f5f9' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#0a0e1a' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#1a2235', border: '1px solid #334155', borderRadius: 10, padding: 8, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #334155', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{user.email}</p>
                  </div>
                  {isAdmin ? (
                    <>
                      <DropItem to="/admin" label="Admin Dashboard" onClick={() => setDropdownOpen(false)} />
                      <DropItem to="/admin/events" label="Manage Events" onClick={() => setDropdownOpen(false)} />
                      <DropItem to="/admin/users" label="Manage Users" onClick={() => setDropdownOpen(false)} />
                    </>
                  ) : (
                    <>
                      <DropItem to="/dashboard" label="My Dashboard" onClick={() => setDropdownOpen(false)} />
                      <DropItem to="/my-bookings" label="My Bookings" onClick={() => setDropdownOpen(false)} />
                    </>
                  )}
                  <div style={{ borderTop: '1px solid #334155', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 12px', borderRadius: 6, fontSize: 14, fontFamily: 'DM Sans' }}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const DropItem = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} style={{ display: 'block', padding: '8px 12px', borderRadius: 6, fontSize: 14, color: '#94a3b8', transition: 'all 0.15s' }}
    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#f1f5f9'; }}
    onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#94a3b8'; }}>
    {label}
  </Link>
);
