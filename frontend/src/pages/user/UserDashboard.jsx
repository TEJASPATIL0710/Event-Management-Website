import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.bookings || [])).finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const upcoming = confirmed.filter(b => b.event && new Date(b.event.date) >= new Date());
  const past = confirmed.filter(b => b.event && new Date(b.event.date) < new Date());
  const totalSpent = confirmed.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Welcome header */}
        <div style={{ background: 'linear-gradient(135deg, #1a2235, #1f2a40)', border: '1px solid #1e293b', borderRadius: 20, padding: '32px 36px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 28, color: '#0a0e1a', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, marginBottom: 4 }}>Hey, {user?.name?.split(' ')[0]}! 👋</h1>
              <p style={{ color: '#94a3b8' }}>{user?.email} · Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Bookings', value: confirmed.length, icon: '🎟️', color: '#f59e0b' },
            { label: 'Upcoming Events', value: upcoming.length, icon: '📅', color: '#10b981' },
            { label: 'Past Events', value: past.length, icon: '✅', color: '#3b82f6' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰', color: '#a78bfa' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 700, color, marginBottom: 4 }}>{value}</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <Link to="/events" className="btn btn-primary">🔍 Browse Events</Link>
          <Link to="/my-bookings" className="btn btn-outline">📋 My Bookings</Link>
        </div>

        {/* Upcoming events */}
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Upcoming Events</h2>
        {loading ? <div className="spinner" /> : upcoming.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
            <h3>No upcoming events</h3>
            <p>Browse events and book your next experience!</p>
            <Link to="/events" className="btn btn-primary" style={{ marginTop: 20 }}>Explore Events</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.map(booking => (
              <BookingRow key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingRow({ booking }) {
  const event = booking.event;
  if (!event) return null;
  const date = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>{event.title}</h3>
          <span className={`badge ${booking.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{booking.status}</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>📅 {date} · 📍 {event.location?.city} · 🎟️ {booking.seats} seat{booking.seats > 1 ? 's' : ''}</p>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Ref: {booking.bookingReference}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#f59e0b', fontWeight: 700 }}>{booking.totalAmount === 0 ? 'FREE' : `₹${booking.totalAmount.toLocaleString()}`}</p>
        <Link to={`/events/${event._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>View Event</Link>
      </div>
    </div>
  );
}
