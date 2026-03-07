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
  const totalSpent = confirmed.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Hello, {user?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</p>
          </div>
          <Link to="/events" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Browse events</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
          {[
            { label: 'Total bookings', value: confirmed.length },
            { label: 'Upcoming events', value: upcoming.length },
            { label: 'Past events', value: confirmed.length - upcoming.length },
            { label: 'Total spent', value: totalSpent === 0 ? 'Free!' : `₹${totalSpent.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming bookings */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Upcoming events</h2>
          <Link to="/my-bookings" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        {loading ? <div className="spinner" /> : upcoming.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 32, marginBottom: 10 }}>📅</p>
            <h3>No upcoming events</h3>
            <p>Browse events and book your next experience</p>
            <Link to="/events" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Explore events</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(b => <BookingRow key={b._id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingRow({ booking }) {
  const e = booking.event;
  if (!e) return null;
  const date = new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontWeight: 600, fontSize: 15 }}>{e.title}</p>
          <span className="badge badge-green">{booking.status}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {date} · {e.location?.city} · {booking.seats} seat{booking.seats > 1 ? 's' : ''} · Ref: {booking.bookingReference}
        </p>
      </div>
      <div style={{ display: 'flex', align: 'center', gap: 10 }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>{booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString()}`}</p>
        <Link to={`/events/${e._id}`} className="btn btn-ghost btn-sm">View</Link>
      </div>
    </div>
  );
}
