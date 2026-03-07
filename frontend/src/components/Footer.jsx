import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'white', borderTop: '1px solid var(--border)', marginTop: 80 }}>
      <div className="container" style={{ padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>EventSphere</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>Discover and book events that matter to you.</p>
          </div>

          {[
            { title: 'Explore', links: [['Events', '/events'], ['Categories', '/events'], ['Featured', '/events']] },
            { title: 'Account', links: [['Sign In', '/login'], ['Register', '/register'], ['My Bookings', '/my-bookings']] },
            { title: 'Categories', links: [['Conference', '/events?category=Conference'], ['Workshop', '/events?category=Workshop'], ['Concert', '/events?category=Concert']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{title}</p>
              {links.map(([label, to]) => (
                <Link key={label} to={to} style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Built with MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
