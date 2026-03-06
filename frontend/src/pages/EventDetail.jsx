import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ seats: 1, attendeeInfo: { name: user?.name || '', phone: '', specialRequirements: '' } });
  const [booking_loading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => setEvent(data.event))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async () => {
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    setBookingLoading(true);
    try {
      const { data } = await api.post('/bookings', { eventId: id, ...booking });
      setBookingSuccess(data.booking);
      toast.success('🎉 Booking confirmed!');
      setEvent(prev => ({ ...prev, availableSeats: prev.availableSeats - booking.seats }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!event) return null;

  const date = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isPast = new Date(event.isMultiDay && event.endDate ? event.endDate : event.date) < new Date();
  const isSoldOut = event.availableSeats === 0;

  // Format date display
  const numDays = event.isMultiDay && event.endDate
    ? Math.ceil((new Date(event.endDate) - new Date(event.date)) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  const dateDisplay = event.isMultiDay && event.endDate
    ? (() => {
        const s = new Date(event.date);
        const e2 = new Date(event.endDate);
        const fmt = (d, o) => d.toLocaleDateString('en-IN', o);
        return `${fmt(s, { weekday: 'short', day: 'numeric', month: 'long' })} – ${fmt(e2, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}`;
      })()
    : new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{ height: 300, background: 'linear-gradient(135deg, #1a2235, #111827)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
        {event.image
          ? <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, position: 'absolute' }} />
          : <span style={{ fontSize: 80, position: 'relative', zIndex: 1 }}>🎪</span>}
        <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 2, display: 'flex', gap: 8 }}>
          <span className="badge badge-gold" style={{ marginBottom: 8 }}>{event.category}</span>
          {event.isMultiDay && (
            <span style={{ background: 'rgba(99,102,241,0.85)', color: 'white', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
              🗓️ {numDays}-Day Event
            </span>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 24 }}>{event.title}</h1>

            {/* Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                {
                  icon: '📅',
                  label: event.isMultiDay ? `Date (${numDays} Days)` : 'Date & Time',
                  value: event.isMultiDay
                    ? dateDisplay
                    : `${dateDisplay} · ${event.time}`
                },
                ...(event.isMultiDay ? [{ icon: '⏰', label: 'Daily Timings', value: `${event.time}${event.endTime ? ` – ${event.endTime}` : ''}` }] : []),
                { icon: '📍', label: 'Venue', value: `${event.location.venue}, ${event.location.city}` },
                { icon: '🎟️', label: 'Price', value: event.price === 0 ? 'Free Entry' : `₹${event.price.toLocaleString()} per seat` },
                { icon: '💺', label: 'Availability', value: `${event.availableSeats} / ${event.totalSeats} seats left` },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{icon} {label}</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 16 }}>About this Event</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
            </div>

            {/* Location */}
            <div>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 16 }}>Location</h2>
              <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 10, padding: 20 }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{event.location.venue}</p>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>{event.location.address}</p>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>{event.location.city}{event.location.state ? `, ${event.location.state}` : ''}, {event.location.country}</p>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div style={{ position: 'sticky', top: 90 }}>
            {bookingSuccess ? (
              <div style={{ background: '#1a2235', border: '1px solid #10b981', borderRadius: 16, padding: 28, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 8 }}>Booking Confirmed!</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>Your reference: <strong style={{ color: '#f59e0b' }}>{bookingSuccess.bookingReference}</strong></p>
                <Link to="/my-bookings" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>View My Bookings</Link>
              </div>
            ) : (
              <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 4 }}>Reserve Your Spot</h3>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>{event.price === 0 ? 'Free event!' : `₹${event.price.toLocaleString()} per ticket`}</p>

                {!isPast && !isSoldOut && event.status !== 'cancelled' ? (
                  <>
                    <div className="form-group">
                      <label>Number of Seats</label>
                      <select className="form-control" value={booking.seats} onChange={e => setBooking(b => ({ ...b, seats: Number(e.target.value) }))}>
                        {Array.from({ length: Math.min(10, event.availableSeats) }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Your Name</label>
                      <input className="form-control" value={booking.attendeeInfo.name} onChange={e => setBooking(b => ({ ...b, attendeeInfo: { ...b.attendeeInfo, name: e.target.value } }))} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input className="form-control" placeholder="+91 ..." value={booking.attendeeInfo.phone} onChange={e => setBooking(b => ({ ...b, attendeeInfo: { ...b.attendeeInfo, phone: e.target.value } }))} />
                    </div>

                    <div style={{ padding: '12px 0', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', margin: '16px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Total Amount</span>
                      <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 20 }}>
                        {event.price === 0 ? 'FREE' : `₹${(event.price * booking.seats).toLocaleString()}`}
                      </span>
                    </div>

                    {user ? (
                      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px' }} onClick={handleBook} disabled={booking_loading}>
                        {booking_loading ? 'Processing...' : '🎟️ Book Now'}
                      </button>
                    ) : (
                      <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Sign In to Book</Link>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{isSoldOut ? '😔' : isPast ? '📅' : '❌'}</div>
                    <p style={{ color: '#94a3b8' }}>{isSoldOut ? 'Sold Out' : isPast ? 'Event has ended' : 'Event Cancelled'}</p>
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
