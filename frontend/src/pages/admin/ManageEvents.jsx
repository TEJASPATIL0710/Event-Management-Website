import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1 });
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 });
  const [deleting, setDeleting] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page);
      const { data } = await api.get(`/admin/events?${params}`);
      setEvents(data.events || []);
      setPagination({ totalPages: data.totalPages, currentPage: data.currentPage, total: data.total });
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const statusColors = { upcoming: 'badge-gold', ongoing: 'badge-green', completed: 'badge-blue', cancelled: 'badge-red' };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 4 }}>Manage Events</h1>
            <p style={{ color: '#94a3b8' }}>{pagination.total || 0} total events</p>
          </div>
          <Link to="/admin/events/create" className="btn btn-primary">+ Create Event</Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <select className="form-control" style={{ maxWidth: 160 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-control" style={{ maxWidth: 180 }} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
            <option value="">All Categories</option>
            {['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <div className="spinner" /> : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
            <h3>No events found</h3>
            <Link to="/admin/events/create" className="btn btn-primary" style={{ marginTop: 20 }}>Create First Event</Link>
          </div>
        ) : (
          <>
            <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      {['Event', 'Category', 'Date', 'Seats', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontWeight: 500, marginBottom: 2 }}>{event.title}</p>
                          <p style={{ color: '#64748b', fontSize: 12 }}>📍 {event.location?.city}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}><span className="badge badge-gray">{event.category}</span></td>
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 13 }}>
                          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          <span style={{ color: event.availableSeats < 10 ? '#ef4444' : '#94a3b8' }}>{event.availableSeats}</span>
                          <span style={{ color: '#475569' }}>/{event.totalSeats}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f59e0b' }}>
                          {event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge ${statusColors[event.status] || 'badge-gray'}`}>{event.status}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/events/${event._id}`} className="btn btn-ghost btn-sm">View</Link>
                            <Link to={`/admin/events/edit/${event._id}`} className="btn btn-outline btn-sm">Edit</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id, event.title)} disabled={deleting === event._id}>
                              {deleting === event._id ? '...' : 'Del'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, background: page === filters.page ? '#f59e0b' : 'transparent', color: page === filters.page ? '#0a0e1a' : '#94a3b8', borderColor: page === filters.page ? '#f59e0b' : '#334155' }}>
                    {page}
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
