import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.bookings || [])).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 8 }}>My Bookings</h1>
            <p style={{ color: '#94a3b8' }}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/events" className="btn btn-primary">+ Book New Event</Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {['all', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 20px', borderRadius: 100, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, transition: 'all 0.2s', background: filter === f ? '#f59e0b' : 'transparent', color: filter === f ? '#0a0e1a' : '#94a3b8', borderColor: filter === f ? '#f59e0b' : '#334155', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
            <h3>No bookings found</h3>
            <p>Your {filter !== 'all' ? filter : ''} bookings will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(booking => {
              const event = booking.event;
              const isUpcoming = event && new Date(event.date) >= new Date();
              const date = event ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

              return (
                <div key={booking._id} style={{ background: '#1a2235', border: `1px solid ${booking.status === 'cancelled' ? '#334155' : '#1e293b'}`, borderRadius: 16, padding: 24, opacity: booking.status === 'cancelled' ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20 }}>{event?.title || 'Deleted Event'}</h3>
                        <span className={`badge ${booking.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{booking.status}</span>
                        {isUpcoming && booking.status === 'confirmed' && <span className="badge badge-gold">Upcoming</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 12 }}>
                        {[
                          { label: 'Date', value: date },
                          { label: 'Venue', value: event?.location?.city || '—' },
                          { label: 'Seats', value: `${booking.seats} seat${booking.seats > 1 ? 's' : ''}` },
                          { label: 'Amount', value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString()}` },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 2, textTransform: 'uppercase' }}>{label}</p>
                            <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <p style={{ color: '#64748b', fontSize: 12, marginTop: 12 }}>
                        Booking Ref: <span style={{ color: '#94a3b8', fontWeight: 500 }}>{booking.bookingReference}</span>
                        {' · '}Booked {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      {event && <Link to={`/events/${event._id}`} className="btn btn-ghost btn-sm">View Event</Link>}
                      {booking.status === 'confirmed' && isUpcoming && (
                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }} onClick={() => handleCancel(booking._id)} disabled={cancelling === booking._id}>
                          {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
