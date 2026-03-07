import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function formatDate(event) {
  const s = new Date(event.date);
  const fmt = (d, o) => d.toLocaleDateString('en-IN', o);
  if (event.isMultiDay && event.endDate) {
    const e = new Date(event.endDate);
    return `${fmt(s, { weekday: 'short', day: 'numeric', month: 'long' })} – ${fmt(e, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  return fmt(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => setEvent(data.event)).catch(() => navigate('/events')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    setBookingLoading(true);
    try {
      const { data } = await api.post('/bookings', { eventId: id, seats, attendeeInfo: { name: attendeeName, phone } });
      setBookingSuccess(data.booking);
      setEvent(prev => ({ ...prev, availableSeats: prev.availableSeats - seats }));
      toast.success('Booking confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!event) return null;

  const isPast = new Date(event.isMultiDay && event.endDate ? event.endDate : event.date) < new Date();
  const isSoldOut = event.availableSeats === 0;
  const numDays = event.isMultiDay && event.endDate ? Math.ceil((new Date(event.endDate) - new Date(event.date)) / 86400000) + 1 : 1;
  const totalAmount = event.price * seats;

  return (
    <div className="page-wrap">
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
        <div className="container">
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <Link to="/events" style={{ color: 'var(--accent)' }}>Events</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            {event.title}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36, alignItems: 'start' }}>

          {/* Left: event info */}
          <div>
            {/* Image */}
            <div style={{ height: 280, background: '#f1f0ee', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {event.image
                ? <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 64, opacity: 0.3 }}>📅</span>}
              <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
                <span className="badge badge-gray">{event.category}</span>
                {event.isMultiDay && <span className="badge badge-purple">{numDays}-Day Event</span>}
                {event.featured && <span className="badge badge-yellow">Featured</span>}
              </div>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>{event.title}</h1>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28, padding: '20px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              {[
                { label: event.isMultiDay ? `Dates (${numDays} days)` : 'Date', value: formatDate(event) },
                ...(event.isMultiDay ? [{ label: 'Daily Timings', value: `${event.time}${event.endTime ? ` – ${event.endTime}` : ''}` }] : [{ label: 'Time', value: `${event.time}${event.endTime ? ` – ${event.endTime}` : ''}` }]),
                { label: 'Venue', value: `${event.location.venue}` },
                { label: 'City', value: `${event.location.city}${event.location.state ? `, ${event.location.state}` : ''}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>About this event</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 14 }}>{event.description}</p>
            </div>

            {/* Address */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Location</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {event.location.venue}<br />
                {event.location.address}<br />
                {event.location.city}{event.location.state ? `, ${event.location.state}` : ''}, {event.location.country}
              </p>
            </div>
          </div>

          {/* Right: booking card */}
          <div style={{ position: 'sticky', top: 80 }}>
            {bookingSuccess ? (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✅</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>Booking Confirmed</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>Reference number</p>
                <p style={{ fontFamily: 'monospace', background: 'var(--bg)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 20, display: 'inline-block' }}>{bookingSuccess.bookingReference}</p>
                <Link to="/my-bookings" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>View my bookings</Link>
              </div>
            ) : (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
                      {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                    </p>
                    {event.price > 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>per ticket</p>}
                  </div>
                  <span className={`badge ${event.availableSeats > 20 ? 'badge-green' : event.availableSeats > 0 ? 'badge-yellow' : 'badge-red'}`}>
                    {isSoldOut ? 'Sold out' : `${event.availableSeats} left`}
                  </span>
                </div>

                {!isPast && !isSoldOut && event.status !== 'cancelled' ? (
                  <>
                    <div className="form-group">
                      <label>Number of seats</label>
                      <select className="form-control" value={seats} onChange={e => setSeats(Number(e.target.value))}>
                        {Array.from({ length: Math.min(10, event.availableSeats) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Your name</label>
                      <input className="form-control" value={attendeeName} onChange={e => setAttendeeName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>Phone number</label>
                      <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                    </div>

                    {event.price > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 14 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{seats} × ₹{event.price.toLocaleString()}</span>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>₹{totalAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {user ? (
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={handleBook} disabled={bookingLoading}>
                        {bookingLoading ? 'Processing...' : event.price === 0 ? 'Register for free' : 'Book now'}
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '12px' }}>Sign in to book</Link>
                    )}

                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>Free cancellation for upcoming events</p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 28, marginBottom: 8 }}>{isSoldOut ? '😔' : isPast ? '🏁' : '❌'}</p>
                    <p style={{ fontWeight: 500 }}>{isSoldOut ? 'Sold out' : isPast ? 'Event ended' : 'Event cancelled'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
