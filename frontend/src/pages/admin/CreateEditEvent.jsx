import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'];

const defaultForm = {
  title: '', description: '', category: 'Conference', status: 'upcoming',
  date: '', endDate: '', time: '', endTime: '', isMultiDay: false,
  location: { venue: '', address: '', city: '', state: '', country: 'India' },
  price: 0, totalSeats: 100, image: '', tags: '', featured: false
};

const Section = ({ title, children }) => (
  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 16 }}>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>{title}</h2>
    {children}
  </div>
);

export default function CreateEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`).then(({ data }) => {
        const e = data.event;
        setForm({
          title: e.title || '', description: e.description || '',
          category: e.category || 'Conference', status: e.status || 'upcoming',
          date: e.date ? e.date.split('T')[0] : '',
          endDate: e.endDate ? e.endDate.split('T')[0] : '',
          time: e.time || '', endTime: e.endTime || '',
          isMultiDay: e.isMultiDay || false,
          location: { venue: e.location?.venue || '', address: e.location?.address || '', city: e.location?.city || '', state: e.location?.state || '', country: e.location?.country || 'India' },
          price: e.price || 0, totalSeats: e.totalSeats || 100,
          image: e.image || '', tags: e.tags?.join(', ') || '', featured: e.featured || false
        });
      }).catch(() => { toast.error('Event not found'); navigate('/admin/events'); })
      .finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'isMultiDay' && !checked) updated.endDate = '';
      return updated;
    });
  }, []);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
  }, []);

  const toggleMultiDay = () => {
    setForm(prev => ({ ...prev, isMultiDay: !prev.isMultiDay, endDate: prev.isMultiDay ? '' : prev.endDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.isMultiDay && form.endDate && new Date(form.endDate) <= new Date(form.date)) {
      toast.error('End date must be after start date'); return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form, price: Number(form.price), totalSeats: Number(form.totalSeats),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        endDate: form.isMultiDay && form.endDate ? form.endDate : null
      };
      if (isEdit) { await api.put(`/admin/events/${id}`, payload); toast.success('Event updated!'); }
      else { await api.post('/admin/events', payload); toast.success('Event created!'); }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally { setLoading(false); }
  };

  const numDays = form.isMultiDay && form.date && form.endDate
    ? Math.ceil((new Date(form.endDate) - new Date(form.date)) / 86400000) + 1 : 1;

  if (fetching) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px', maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>← Back</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <Section title="Basic Information">
            <div className="form-group">
              <label>Event title *</label>
              <input className="form-control" name="title" required placeholder="e.g. Tech Summit 2025" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" name="description" required rows={4} placeholder="Describe the event..." value={form.description} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input className="form-control" name="image" type="url" placeholder="https://..." value={form.image} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input className="form-control" name="tags" placeholder="technology, AI, networking" value={form.tags} onChange={handleChange} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', userSelect: 'none' }}>
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }} />
              Mark as featured event
            </label>
          </Section>

          {/* Date & Time */}
          <Section title="Date & Time">
            {/* Multi-day toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>Multi-day event</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enable for events spanning 2+ days</p>
              </div>
              <button type="button" onClick={toggleMultiDay}
                style={{ position: 'relative', width: 42, height: 22, borderRadius: 11, background: form.isMultiDay ? 'var(--accent)' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.isMultiDay ? 22 : 3, width: 16, height: 16, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: form.isMultiDay ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>{form.isMultiDay ? 'Start date *' : 'Date *'}</label>
                <input className="form-control" name="date" type="date" required value={form.date} onChange={handleChange} />
              </div>
              {form.isMultiDay && (
                <div className="form-group">
                  <label>End date *</label>
                  <input className="form-control" name="endDate" type="date" required min={form.date || ''} value={form.endDate} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label>{form.isMultiDay ? 'Daily start time *' : 'Start time *'}</label>
                <input className="form-control" name="time" type="time" required value={form.time} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{form.isMultiDay ? 'Daily end time' : 'End time'}</label>
                <input className="form-control" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
              </div>
            </div>

            {form.isMultiDay && numDays > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 13, color: 'var(--accent)' }}>
                <span>📅</span>
                <span style={{ fontWeight: 600 }}>{numDays}-day event</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </Section>

          {/* Location */}
          <Section title="Location">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>Venue name *</label>
                <input className="form-control" name="venue" required placeholder="e.g. Bombay Exhibition Centre" value={form.location.venue} onChange={handleLocationChange} />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input className="form-control" name="city" required placeholder="e.g. Mumbai" value={form.location.city} onChange={handleLocationChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Full address *</label>
              <input className="form-control" name="address" required placeholder="Street, locality..." value={form.location.address} onChange={handleLocationChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>State</label>
                <input className="form-control" name="state" placeholder="Maharashtra" value={form.location.state} onChange={handleLocationChange} />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input className="form-control" name="country" value={form.location.country} onChange={handleLocationChange} />
              </div>
            </div>
          </Section>

          {/* Tickets */}
          <Section title="Tickets & Pricing">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>Price (₹) — 0 for free</label>
                <input className="form-control" name="price" type="number" min="0" value={form.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total seats *</label>
                <input className="form-control" name="totalSeats" type="number" min="1" required value={form.totalSeats} onChange={handleChange} />
              </div>
            </div>
          </Section>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/events')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update event' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
