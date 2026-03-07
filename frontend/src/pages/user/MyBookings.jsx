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
    } finally { setCancelling(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>My Bookings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{bookings.length} total</p>
          </div>
          <Link to="/events" className="btn btn-primary btn-sm">Browse events</Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content' }}>
          {['all', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? 'white' : 'var(--text-secondary)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 32, marginBottom: 10 }}>🎟️</p>
            <h3>No bookings found</h3>
            <p>Your bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(booking => {
              const event = booking.event;
              const isUpcoming = event && new Date(event.date) >= new Date();
              const date = event ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

              return (
                <div key={booking._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', opacity: booking.status === 'cancelled' ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{event?.title || 'Deleted event'}</p>
                        <span className={`badge ${booking.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{booking.status}</span>
                        {isUpcoming && booking.status === 'confirmed' && <span className="badge badge-blue">Upcoming</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 10 }}>
                        {[
                          { label: 'Date', value: date },
                          { label: 'City', value: event?.location?.city || '—' },
                          { label: 'Seats', value: `${booking.seats} seat${booking.seats > 1 ? 's' : ''}` },
                          { label: 'Amount', value: booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString()}` },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
                            <p style={{ fontSize: 13, fontWeight: 500 }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                        Ref: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{booking.bookingReference}</span>
                        {' · '}Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      {event && <Link to={`/events/${event._id}`} className="btn btn-ghost btn-sm">View event</Link>}
                      {booking.status === 'confirmed' && isUpcoming && (
                        <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca' }} onClick={() => handleCancel(booking._id)} disabled={cancelling === booking._id}>
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
