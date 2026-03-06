import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#111827', borderTop: '1px solid #1e293b', marginTop: 80, padding: '60px 24px 30px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, color: '#0a0e1a' }}>E</div>
              <span style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700 }}>Event<span style={{ color: '#f59e0b' }}>Sphere</span></span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>Discover and experience extraordinary events. Your gateway to unforgettable moments.</p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Explore</h4>
            {['Events', 'Categories', 'Venues', 'Organizers'].map(item => (
              <Link key={item} to="/events" style={{ display: 'block', color: '#64748b', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#64748b'}>
                {item}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Account</h4>
            {[['Sign In', '/login'], ['Register', '/register'], ['My Bookings', '/my-bookings'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <Link key={label} to={to} style={{ display: 'block', color: '#64748b', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#64748b'}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Categories</h4>
            {['Conference', 'Concert', 'Workshop', 'Festival', 'Networking'].map(cat => (
              <Link key={cat} to={`/events?category=${cat}`} style={{ display: 'block', color: '#64748b', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#64748b'}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ color: '#475569', fontSize: 13 }}>© {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <p style={{ color: '#475569', fontSize: 13 }}>Built with MERN Stack 🚀</p>
        </div>
      </div>
    </footer>
  );
}
