import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_BADGE = { upcoming: 'badge-blue', ongoing: 'badge-green', completed: 'badge-gray', cancelled: 'badge-red' };

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 });
  const [deleting, setDeleting] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.status) p.append('status', filters.status);
      if (filters.category) p.append('category', filters.category);
      p.append('page', filters.page);
      const { data } = await api.get(`/admin/events?${p}`);
      setEvents(data.events || []);
      setPagination({ totalPages: data.totalPages, total: data.total });
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>Events</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{pagination.total} total events</p>
          </div>
          <Link to="/admin/events/create" className="btn btn-primary">+ Create event</Link>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <select className="form-control" style={{ maxWidth: 160 }} value={filters.status} onChange={e => set('status', e.target.value)}>
            <option value="">All status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-control" style={{ maxWidth: 180 }} value={filters.category} onChange={e => set('category', e.target.value)}>
            <option value="">All categories</option>
            {['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <div className="spinner" /> : events.length === 0 ? (
          <div className="empty-state">
            <h3>No events found</h3>
            <Link to="/admin/events/create" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Create first event</Link>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Event</th><th>Category</th><th>Date</th><th>Seats</th><th>Price</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id}>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{event.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{event.location?.city}</p>
                      </td>
                      <td><span className="badge badge-gray">{event.category}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {event.isMultiDay && <span className="badge badge-purple" style={{ marginLeft: 6 }}>Multi-day</span>}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <span style={{ color: event.availableSeats < 10 ? 'var(--danger)' : 'var(--text-secondary)' }}>{event.availableSeats}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/{event.totalSeats}</span>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{event.price === 0 ? 'Free' : `₹${event.price.toLocaleString()}`}</td>
                      <td><span className={`badge ${STATUS_BADGE[event.status] || 'badge-gray'}`}>{event.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/events/${event._id}`} className="btn btn-ghost btn-sm">View</Link>
                          <Link to={`/admin/events/edit/${event._id}`} className="btn btn-outline btn-sm">Edit</Link>
                          <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca' }} onClick={() => handleDelete(event._id, event.title)} disabled={deleting === event._id}>
                            {deleting === event._id ? '...' : 'Del'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))} style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, background: p === filters.page ? 'var(--accent)' : 'white', color: p === filters.page ? 'white' : 'var(--text-secondary)', borderColor: p === filters.page ? 'var(--accent)' : 'var(--border)' }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
