import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { EventCard } from './Home';

const CATEGORIES = ['All', 'Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: '',
    sort: 'date',
    page: 1
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 9);

      const { data } = await api.get(`/events?${params}`);
      setEvents(data.events || []);
      setPagination({ total: data.total, totalPages: data.totalPages, currentPage: data.currentPage });
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#111827', borderBottom: '1px solid #1e293b', padding: '40px 24px' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 40, marginBottom: 24 }}>Explore Events</h1>

          {/* Search */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <input
              className="form-control"
              style={{ maxWidth: 340 }}
              placeholder="🔍 Search events..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
            <input
              className="form-control"
              style={{ maxWidth: 200 }}
              placeholder="📍 City"
              value={filters.city}
              onChange={e => handleFilterChange('city', e.target.value)}
            />
            <select className="form-control" style={{ maxWidth: 180 }} value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}>
              <option value="date">Sort: Date</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat)}
                style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: 13, fontFamily: 'DM Sans', cursor: 'pointer', transition: 'all 0.2s',
                  background: (filters.category === cat || (cat === 'All' && !filters.category)) ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                  color: (filters.category === cat || (cat === 'All' && !filters.category)) ? '#0a0e1a' : '#94a3b8',
                  border: '1px solid transparent'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            {loading ? 'Loading...' : `${pagination.total} event${pagination.total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => setFilters({ search: '', category: '', city: '', sort: 'date', page: 1 })}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page }))}
                    style={{
                      width: 40, height: 40, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 14, transition: 'all 0.2s',
                      background: page === filters.page ? '#f59e0b' : 'transparent',
                      color: page === filters.page ? '#0a0e1a' : '#94a3b8',
                      borderColor: page === filters.page ? '#f59e0b' : '#334155'
                    }}>
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
