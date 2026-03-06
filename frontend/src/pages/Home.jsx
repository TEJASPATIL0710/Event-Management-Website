import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar'];

const categoryIcons = { Conference: '🎯', Workshop: '🛠️', Concert: '🎵', Sports: '⚽', Festival: '🎉', Networking: '🤝', Exhibition: '🖼️', Webinar: '💻' };

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({ events: 0, users: 0, cities: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events/featured').then(({ data }) => setFeaturedEvents(data.events || [])).catch(() => {});
    api.get('/events?limit=3').then(({ data }) => setStats(s => ({ ...s, events: data.total || 0 }))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/events?search=${search}`);
    else navigate('/events');
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ maxWidth: 700 }}>
            <div className="badge badge-gold" style={{ marginBottom: 24, fontSize: 13 }}>✨ India's Premier Event Platform</div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
              Discover<br />
              <em style={{ color: '#f59e0b', fontStyle: 'italic' }}>Extraordinary</em><br />
              Events
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40, maxWidth: 500, lineHeight: 1.7 }}>
              From intimate workshops to massive festivals — find and book the events that define your story.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 540, background: '#1a2235', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <input
                type="text"
                placeholder="Search events, concerts, workshops..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', padding: '16px 20px', color: '#f1f5f9', fontSize: 15, fontFamily: 'DM Sans', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: 0, padding: '16px 24px' }}>Search</button>
            </form>

            <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
              {[['500+', 'Events'], ['50K+', 'Attendees'], ['20+', 'Cities']].map(([num, label]) => (
                <div key={label}>
                  <p style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{num}</p>
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 0', background: '#111827' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle">Find exactly what you're looking for</p>
            </div>
            <Link to="/events" className="btn btn-outline">View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/events?category=${cat}`}
                style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 12, padding: '20px 16px', textAlign: 'center', transition: 'all 0.2s', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = '#1f2a40'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1a2235'; }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{categoryIcons[cat]}</div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>{cat}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <h2 className="section-title">Featured Events</h2>
                <p className="section-subtitle">Handpicked experiences you won't want to miss</p>
              </div>
              <Link to="/events" className="btn btn-outline">See All Events</Link>
            </div>
            <div className="events-grid">
              {featuredEvents.slice(0, 3).map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(10,14,26,0) 100%)', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 16 }}>Ready to Experience More?</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32 }}>Join thousands of event-goers who use EventSphere every day.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          <Link to="/events" className="btn btn-outline btn-lg">Browse Events</Link>
        </div>
      </section>
    </div>
  );
}

// Helper: format date range for multi-day events
function formatEventDate(event) {
  const startDate = new Date(event.date);
  const fmt = (d, opts) => d.toLocaleDateString('en-IN', opts);

  if (event.isMultiDay && event.endDate) {
    const endDate = new Date(event.endDate);
    const startMonth = fmt(startDate, { month: 'short' });
    const endMonth = fmt(endDate, { month: 'short' });
    const year = fmt(endDate, { year: 'numeric' });
    // Same month: "12–14 Mar 2025", different month: "28 Mar – 2 Apr 2025"
    if (startMonth === endMonth) {
      return `${startDate.getDate()}–${endDate.getDate()} ${startMonth} ${year}`;
    }
    return `${fmt(startDate, { day: 'numeric', month: 'short' })} – ${fmt(endDate, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return fmt(startDate, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function EventCard({ event }) {
  const price = event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`;
  const date = formatEventDate(event);
  const seatsLeft = event.availableSeats;

  // Calculate number of days
  const numDays = event.isMultiDay && event.endDate
    ? Math.ceil((new Date(event.endDate) - new Date(event.date)) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  return (
    <Link to={`/events/${event._id}`} className="card" style={{ display: 'block' }}>
      <div style={{ height: 180, background: 'linear-gradient(135deg, #1a2235, #1f2a40)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {event.image ? (
          <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 48 }}>{categoryIcons[event.category] || '🎪'}</span>
        )}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge ${event.price === 0 ? 'badge-green' : 'badge-gold'}`}>{price}</span>
        </div>
        {event.featured && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge badge-gold">⭐ Featured</span>
          </div>
        )}
      </div>
      <div style={{ padding: 20 }}>
        <span className="badge badge-gray" style={{ marginBottom: 10, fontSize: 11 }}>{event.category}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{event.title}</h3>
          {event.isMultiDay && (
            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
              🗓️ {numDays} Days
            </span>
          )}
        </div>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
            <span>📅</span>
            <span>{date}{!event.isMultiDay && event.time ? ` · ${event.time}` : ''}</span>
          </div>
          {event.isMultiDay && event.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
              <span>⏰</span>
              <span>Daily {event.time}{event.endTime ? ` – ${event.endTime}` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
            <span>📍</span><span>{event.location?.venue}, {event.location?.city}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: seatsLeft < 20 ? '#ef4444' : '#10b981', fontSize: 13 }}>
            <span>🎟️</span><span>{seatsLeft} seats left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
