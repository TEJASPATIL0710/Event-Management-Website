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
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Platform overview</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Total users', value: stats?.totalUsers || 0 },
            { label: 'Total events', value: stats?.totalEvents || 0 },
            { label: 'Bookings', value: stats?.totalBookings || 0 },
            { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}` },
            { label: 'Upcoming', value: stats?.upcomingEvents || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Quick actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { label: 'Create event', to: '/admin/events/create', primary: true },
              { label: 'Manage events', to: '/admin/events' },
              { label: 'Manage users', to: '/admin/users' },
              { label: 'View bookings', to: '/admin/bookings' },
            ].map(({ label, to, primary }) => (
              <Link key={label} to={to} className={`btn ${primary ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'center', padding: '11px' }}>{label}</Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Category breakdown */}
          {stats?.categoryStats?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Events by category</h2>
              {stats.categoryStats.map(({ _id, count }) => (
                <div key={_id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>{_id}</span>
                  <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 4, width: `${Math.min(100, (count / (stats.totalEvents || 1)) * 100)}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 20, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent bookings */}
          {stats?.recentBookings?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Recent bookings</h2>
                <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View all</Link>
              </div>
              {stats.recentBookings.map((b, i) => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < stats.recentBookings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{b.user?.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.event?.title}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>₹{b.totalAmount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
