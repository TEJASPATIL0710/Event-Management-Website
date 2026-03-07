import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { EventCard } from './Home';

const CATEGORIES = ['All', 'Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: '', sort: 'date', page: 1
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.search) p.append('search', filters.search);
      if (filters.category) p.append('category', filters.category);
      if (filters.city) p.append('city', filters.city);
      p.append('sort', filters.sort);
      p.append('page', filters.page);
      p.append('limit', 9);
      const { data } = await api.get(`/events?${p}`);
      setEvents(data.events || []);
      setPagination({ total: data.total, totalPages: data.totalPages });
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="page-wrap">
      {/* Header bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Events</h1>

          {/* Search + filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="form-control" style={{ maxWidth: 280 }} placeholder="Search events..." value={filters.search} onChange={e => set('search', e.target.value)} />
            <input className="form-control" style={{ maxWidth: 180 }} placeholder="City" value={filters.city} onChange={e => set('city', e.target.value)} />
            <select className="form-control" style={{ maxWidth: 180 }} value={filters.sort} onChange={e => set('sort', e.target.value)}>
              <option value="date">Sort: Upcoming first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest first</option>
            </select>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
            {CATEGORIES.map(cat => {
              const active = filters.category === cat || (cat === 'All' && !filters.category);
              return (
                <button key={cat} onClick={() => set('category', cat === 'All' ? '' : cat)}
                  style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s', border: '1.5px solid', background: active ? 'var(--accent)' : 'white', color: active ? 'white' : 'var(--text-secondary)', borderColor: active ? 'var(--accent)' : 'var(--border)' }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${pagination.total} event${pagination.total !== 1 ? 's' : ''}`}
          </p>
          {(filters.search || filters.category || filters.city) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ search: '', category: '', city: '', sort: 'date', page: 1 })}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? <div className="spinner" /> : events.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map(e => <EventCard key={e._id} event={e} />)}
            </div>

            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                    style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, background: p === filters.page ? 'var(--accent)' : 'white', color: p === filters.page ? 'white' : 'var(--text-secondary)', borderColor: p === filters.page ? 'var(--accent)' : 'var(--border)' }}>
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
