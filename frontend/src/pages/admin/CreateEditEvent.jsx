import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATEGORIES = ['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other'];

const defaultForm = {
  title: '', description: '', category: 'Conference',
  date: '', endDate: '', time: '', endTime: '',
  isMultiDay: false,
  location: { venue: '', address: '', city: '', state: '', country: 'India' },
  price: 0, totalSeats: 100,
  image: '', tags: '', featured: false, status: 'upcoming'
};

// Outside component to prevent remount on re-render
const Section = ({ title, children }) => (
  <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: 28, marginBottom: 20 }}>
    <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #1e293b' }}>{title}</h2>
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
          title: e.title || '',
          description: e.description || '',
          category: e.category || 'Conference',
          date: e.date ? e.date.split('T')[0] : '',
          endDate: e.endDate ? e.endDate.split('T')[0] : '',
          time: e.time || '',
          endTime: e.endTime || '',
          isMultiDay: e.isMultiDay || false,
          location: {
            venue: e.location?.venue || '',
            address: e.location?.address || '',
            city: e.location?.city || '',
            state: e.location?.state || '',
            country: e.location?.country || 'India'
          },
          price: e.price || 0,
          totalSeats: e.totalSeats || 100,
          image: e.image || '',
          tags: e.tags?.join(', ') || '',
          featured: e.featured || false,
          status: e.status || 'upcoming'
        });
      }).catch(() => {
        toast.error('Event not found');
        navigate('/admin/events');
      }).finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // If toggling multi-day OFF, clear endDate
      if (name === 'isMultiDay' && !checked) {
        updated.endDate = '';
      }
      return updated;
    });
  }, []);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate end date is after start date for multi-day
    if (form.isMultiDay && form.endDate) {
      if (new Date(form.endDate) <= new Date(form.date)) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        endDate: form.isMultiDay && form.endDate ? form.endDate : null
      };
      if (isEdit) {
        await api.put(`/admin/events/${id}`, payload);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/admin/events', payload);
        toast.success('Event created successfully!');
      }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  // Calculate number of days for preview
  const numDays = form.isMultiDay && form.date && form.endDate
    ? Math.ceil((new Date(form.endDate) - new Date(form.date)) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  if (fetching) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: 840 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 8 }}>
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {isEdit ? `Editing event ID: ${id}` : 'Fill in the details to publish a new event'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="form-group">
              <label>Event Title *</label>
              <input className="form-control" name="title" required placeholder="e.g. Tech Summit 2025" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" name="description" required rows={5} placeholder="Describe the event in detail..." value={form.description} onChange={handleChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <input className="form-control" name="tags" placeholder="technology, AI, innovation" value={form.tags} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} style={{ width: 16, height: 16, accentColor: '#f59e0b', cursor: 'pointer' }} />
                <label htmlFor="featured" style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 14 }}>⭐ Mark as Featured</label>
              </div>
            </div>
          </Section>

          {/* Date & Time */}
          <Section title="Date & Time">

            {/* Multi-day toggle */}
            <div style={{ background: form.isMultiDay ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.isMultiDay ? 'rgba(245,158,11,0.3)' : '#1e293b'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 500, marginBottom: 2 }}>📅 Multi-Day Event</p>
                <p style={{ color: '#64748b', fontSize: 13 }}>Enable if the event spans more than one day (e.g. 3-day festival, 2-day conference)</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, isMultiDay: !prev.isMultiDay, endDate: prev.isMultiDay ? '' : prev.endDate }))}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div style={{ position: 'relative', width: 44, height: 24, flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, background: form.isMultiDay ? '#f59e0b' : '#334155', borderRadius: 12, transition: 'background 0.25s' }} />
                  <div style={{ position: 'absolute', top: 3, left: form.isMultiDay ? 23 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: form.isMultiDay ? '#f59e0b' : '#64748b', fontFamily: 'DM Sans' }}>
                  {form.isMultiDay ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Date fields */}
            <div style={{ display: 'grid', gridTemplateColumns: form.isMultiDay ? '1fr 1fr' : '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>{form.isMultiDay ? 'Start Date *' : 'Date *'}</label>
                <input className="form-control" name="date" type="date" required value={form.date} onChange={handleChange} />
              </div>

              {form.isMultiDay && (
                <div className="form-group">
                  <label>End Date *</label>
                  <input className="form-control" name="endDate" type="date" required={form.isMultiDay} min={form.date || ''} value={form.endDate} onChange={handleChange} />
                </div>
              )}

              {!form.isMultiDay && (
                <>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input className="form-control" name="time" type="time" required value={form.time} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input className="form-control" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>

            {/* Multi-day time row */}
            {form.isMultiDay && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Daily Start Time *</label>
                  <input className="form-control" name="time" type="time" required value={form.time} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Daily End Time</label>
                  <input className="form-control" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Duration preview badge */}
            {form.isMultiDay && numDays > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 14px' }}>
                <span style={{ fontSize: 16 }}>🗓️</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{numDays}-Day Event</span>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>
                  {new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </Section>

          {/* Location */}
          <Section title="Location">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Venue Name *</label>
                <input className="form-control" name="venue" required placeholder="e.g. Bombay Exhibition Centre" value={form.location.venue} onChange={handleLocationChange} />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input className="form-control" name="city" required placeholder="e.g. Mumbai" value={form.location.city} onChange={handleLocationChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Full Address *</label>
              <input className="form-control" name="address" required placeholder="Street, locality..." value={form.location.address} onChange={handleLocationChange} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

          {/* Tickets & Pricing */}
          <Section title="Tickets & Pricing">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Price (₹) — Set 0 for Free</label>
                <input className="form-control" name="price" type="number" min="0" value={form.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total Seats *</label>
                <input className="form-control" name="totalSeats" type="number" min="1" required value={form.totalSeats} onChange={handleChange} />
              </div>
            </div>
            {form.isMultiDay && (
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                💡 Ticket price covers the full {numDays > 1 ? `${numDays}-day` : 'multi-day'} event. Seats are per-person for the entire duration.
              </p>
            )}
          </Section>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/events')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
