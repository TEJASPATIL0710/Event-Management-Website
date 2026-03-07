import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) p.append('status', statusFilter);
      const { data } = await api.get(`/admin/bookings?${p}`);
      setBookings(data.bookings || []);
      setPagination({ totalPages: data.totalPages, total: data.total });
    } catch { setBookings([]); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const pageRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>Bookings</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {pagination.total} total · Page revenue: <strong style={{ color: 'var(--accent)' }}>₹{pageRevenue.toLocaleString()}</strong>
            </p>
          </div>
          <select className="form-control" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? <div className="spinner" /> : bookings.length === 0 ? (
          <div className="empty-state"><h3>No bookings found</h3></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Reference</th><th>User</th><th>Event</th><th>Seats</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, color: 'var(--accent)', fontWeight: 600 }}>{b.bookingReference}</span>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{b.user?.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.user?.email}</p>
                      </td>
                      <td>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{b.event?.title}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.event?.date ? new Date(b.event.date).toLocaleDateString('en-IN') : '—'}</p>
                      </td>
                      <td style={{ fontSize: 13, textAlign: 'center', fontWeight: 500 }}>{b.seats}</td>
                      <td style={{ fontSize: 13, fontWeight: 700, color: b.totalAmount > 0 ? 'var(--accent)' : 'var(--success)' }}>
                        {b.totalAmount === 0 ? 'Free' : `₹${b.totalAmount.toLocaleString()}`}
                      </td>
                      <td><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>{b.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, background: p === page ? 'var(--accent)' : 'white', color: p === page ? 'white' : 'var(--text-secondary)', borderColor: p === page ? 'var(--accent)' : 'var(--border)' }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
