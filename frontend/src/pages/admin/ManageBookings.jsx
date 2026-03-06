import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/admin/bookings?${params}`);
      setBookings(data.bookings || []);
      setPagination({ totalPages: data.totalPages, currentPage: data.currentPage, total: data.total });
    } catch { setBookings([]); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 4 }}>Bookings</h1>
            <p style={{ color: '#94a3b8' }}>{pagination.total} total bookings · Page revenue: <span style={{ color: '#f59e0b', fontWeight: 600 }}>₹{totalRevenue.toLocaleString()}</span></p>
          </div>
          <select className="form-control" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <div className="empty-state"><h3>No bookings found</h3></div>
        ) : (
          <>
            <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      {['Reference', 'User', 'Event', 'Seats', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #1e293b' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px' }}>
                          <code style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{booking.bookingReference}</code>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{booking.user?.name}</p>
                          <p style={{ color: '#64748b', fontSize: 12 }}>{booking.user?.email}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: 500, fontSize: 14 }}>{booking.event?.title}</p>
                          <p style={{ color: '#64748b', fontSize: 12 }}>📅 {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-IN') : '—'}</p>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500 }}>{booking.seats}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: booking.totalAmount > 0 ? '#f59e0b' : '#10b981' }}>
                          {booking.totalAmount === 0 ? 'Free' : `₹${booking.totalAmount.toLocaleString()}`}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={booking.status === 'confirmed' ? 'badge badge-green' : booking.status === 'cancelled' ? 'badge badge-red' : 'badge badge-gold'}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 13 }}>
                          {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, background: p === page ? '#f59e0b' : 'transparent', color: p === page ? '#0a0e1a' : '#94a3b8', borderColor: p === page ? '#f59e0b' : '#334155' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
