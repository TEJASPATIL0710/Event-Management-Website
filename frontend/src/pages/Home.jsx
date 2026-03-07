import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar'];
const CAT_ICONS = { Conference: '🎯', Workshop: '🛠️', Concert: '🎵', Sports: '⚽', Festival: '🎉', Networking: '🤝', Exhibition: '🖼️', Webinar: '💻' };

function formatDate(event) {
  const s = new Date(event.date);
  const fmt = (d, o) => d.toLocaleDateString('en-IN', o);
  if (event.isMultiDay && event.endDate) {
    const e = new Date(event.endDate);
    const sm = fmt(s, { month: 'short' }), em = fmt(e, { month: 'short' });
    if (sm === em) return `${s.getDate()}–${e.getDate()} ${sm} ${fmt(e, { year: 'numeric' })}`;
    return `${fmt(s, { day: 'numeric', month: 'short' })} – ${fmt(e, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return fmt(s, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EventCard({ event }) {
  const price = event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`;
  const numDays = event.isMultiDay && event.endDate
    ? Math.ceil((new Date(event.endDate) - new Date(event.date)) / 86400000) + 1 : 1;

  return (
    <Link to={`/events/${event._id}`} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ height: 160, background: '#f1f0ee', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {event.image
          ? <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 36, opacity: 0.5 }}>{CAT_ICONS[event.category] || '📅'}</span>
        }
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span className={`badge ${event.price === 0 ? 'badge-green' : 'badge-blue'}`}>{price}</span>
          {event.isMultiDay && <span className="badge badge-purple">{numDays} days</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-gray">{event.category}</span>
          {event.featured && <span className="badge badge-yellow">Featured</span>}
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{event.title}</h3>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <Row icon="📅" text={`${formatDate(event)}${!event.isMultiDay && event.time ? ` · ${event.time}` : ''}`} />
          <Row icon="📍" text={`${event.location?.venue}, ${event.location?.city}`} />
          <Row icon="🎟️" text={`${event.availableSeats} seats available`} color={event.availableSeats < 20 ? 'var(--danger)' : 'var(--success)'} />
        </div>
      </div>
    </Link>
  );
}

const Row = ({ icon, text, color }) => (
  <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, color: color || 'var(--text-secondary)' }}>
    <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
    <span style={{ lineHeight: 1.4 }}>{text}</span>
  </div>
);

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events/featured').then(({ data }) => setFeatured(data.events || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/events?search=${search}` : '/events');
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)', paddingTop: 100, paddingBottom: 72 }}>
        <div className="container">
          <div style={{ maxWidth: 600 }}>
            <span className="badge badge-blue" style={{ marginBottom: 16, fontSize: 12 }}>India's Event Platform</span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
              Find events<br /><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>worth attending</em>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, maxWidth: 460, lineHeight: 1.7 }}>
              Conferences, workshops, concerts and more — discover and book events happening near you.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 480, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <input
                type="text" placeholder="Search events..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', padding: '12px 16px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: '12px 20px' }}>Search</button>
            </form>

            <div style={{ display: 'flex', gap: 36, marginTop: 40 }}>
              {[['500+', 'Events'], ['50K+', 'Attendees'], ['20+', 'Cities']].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{n}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Browse by category</h2>
            <Link to="/events" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/events?category=${cat}`} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px 12px', textAlign: 'center', transition: 'all 0.15s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{CAT_ICONS[cat]}</div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{cat}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Featured events</h2>
              <Link to="/events" className="btn btn-ghost btn-sm">All events →</Link>
            </div>
            <div className="events-grid">
              {featured.slice(0, 3).map(e => <EventCard key={e._id} event={e} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'var(--accent)', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'white', marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 28, fontSize: 15 }}>Create a free account and start discovering events.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" style={{ background: 'white', color: 'var(--accent)', padding: '11px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14, transition: 'opacity 0.15s' }}>Create account</Link>
            <Link to="/events" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '11px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 500, fontSize: 14, border: '1px solid rgba(255,255,255,0.3)' }}>Browse events</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
