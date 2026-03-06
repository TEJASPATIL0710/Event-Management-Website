import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh', background: '#0a0e1a' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="badge badge-gold" style={{ marginBottom: 12 }}>⚡ Admin Panel</div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 8 }}>Dashboard</h1>
          <p style={{ color: '#94a3b8' }}>Overview of your EventSphere platform</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#3b82f6', link: '/admin/users' },
            { label: 'Total Events', value: stats?.totalEvents || 0, icon: '🎪', color: '#f59e0b', link: '/admin/events' },
            { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '🎟️', color: '#10b981', link: '/admin/bookings' },
            { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: '💰', color: '#a78bfa', link: '/admin/bookings' },
            { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: '📅', color: '#f472b6', link: '/admin/events' },
          ].map(({ label, value, icon, color, link }) => (
            <Link key={label} to={link} style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: '24px 20px', display: 'block', transition: 'all 0.2s', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <p style={{ fontFamily: 'Playfair Display', fontSize: 30, fontWeight: 700, color, marginBottom: 4 }}>{value}</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>{label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
          <ActionCard title="Create New Event" desc="Add a new event to the platform" icon="➕" link="/admin/events/create" color="#f59e0b" />
          <ActionCard title="Manage Events" desc="Edit, delete, or update events" icon="📝" link="/admin/events" color="#3b82f6" />
          <ActionCard title="Manage Users" desc="View and manage user accounts" icon="👥" link="/admin/users" color="#10b981" />
          <ActionCard title="View Bookings" desc="See all bookings and reservations" icon="🎟️" link="/admin/bookings" color="#a78bfa" />
        </div>

        {/* Category breakdown */}
        {stats?.categoryStats?.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 20 }}>Events by Category</h2>
            <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
              {stats.categoryStats.map(({ _id, count }) => (
                <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ width: 100, fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>{_id}</span>
                  <div style={{ flex: 1, background: '#0a0e1a', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: 4, width: `${Math.min(100, (count / (stats.totalEvents || 1)) * 100)}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {stats?.recentBookings?.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24 }}>Recent Bookings</h2>
              <Link to="/admin/bookings" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
              {stats.recentBookings.map((booking, i) => (
                <div key={booking._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < stats.recentBookings.length - 1 ? '1px solid #1e293b' : 'none', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 2 }}>{booking.user?.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: 13 }}>{booking.event?.title}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#f59e0b', fontWeight: 600 }}>₹{booking.totalAmount?.toLocaleString()}</p>
                    <p style={{ color: '#64748b', fontSize: 12 }}>{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, link, color }) {
  return (
    <Link to={link} style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{title}</p>
        <p style={{ color: '#64748b', fontSize: 13 }}>{desc}</p>
      </div>
    </Link>
  );
}
