import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinkStyle = ({ isActive }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    transition: 'color 0.15s',
    padding: '4px 0',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
  });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      height: 64,
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>EventSphere</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <NavLink to="/" style={navLinkStyle}>Home</NavLink>
          <NavLink to="/events" style={navLinkStyle}>Events</NavLink>
          {isAdmin && <NavLink to="/admin" style={navLinkStyle}>Admin</NavLink>}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px 6px 8px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 6, minWidth: 180, boxShadow: 'var(--shadow-lg)', zIndex: 20 }}>
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                    {isAdmin ? (
                      <>
                        <DropItem to="/admin" label="Dashboard" close={() => setDropdownOpen(false)} />
                        <DropItem to="/admin/events" label="Manage Events" close={() => setDropdownOpen(false)} />
                        <DropItem to="/admin/users" label="Manage Users" close={() => setDropdownOpen(false)} />
                        <DropItem to="/admin/bookings" label="Bookings" close={() => setDropdownOpen(false)} />
                      </>
                    ) : (
                      <>
                        <DropItem to="/dashboard" label="My Dashboard" close={() => setDropdownOpen(false)} />
                        <DropItem to="/my-bookings" label="My Bookings" close={() => setDropdownOpen(false)} />
                      </>
                    )}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                      <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const DropItem = ({ to, label, close }) => (
  <Link to={to} onClick={close} style={{ display: 'block', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: 'var(--text-secondary)', transition: 'all 0.12s', fontWeight: 500 }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
    {label}
  </Link>
);
