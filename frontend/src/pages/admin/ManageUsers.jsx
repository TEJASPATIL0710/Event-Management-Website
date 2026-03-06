import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setPagination({ totalPages: data.totalPages, currentPage: data.currentPage, total: data.total });
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId, name) => {
    if (!window.confirm(`Toggle status for ${name}?`)) return;
    setActionLoading(userId + '_status');
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete user "${name}"?`)) return;
    setActionLoading(userId + '_delete');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setActionLoading(null); }
  };

  const handleMakeAdmin = async (userId, name) => {
    if (!window.confirm(`Promote "${name}" to admin?`)) return;
    setActionLoading(userId + '_admin');
    try {
      const { data } = await api.put(`/admin/users/${userId}/make-admin`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
      toast.success(`${name} is now an admin`);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(null); }
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 4 }}>Manage Users</h1>
            <p style={{ color: '#94a3b8' }}>{pagination.total} registered users</p>
          </div>
          <input className="form-control" style={{ maxWidth: 280 }} placeholder="🔍 Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {loading ? <div className="spinner" /> : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <>
            <div style={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #1e293b' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0e1a', fontSize: 14, flexShrink: 0 }}>
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 500 }}>{user.name}</p>
                              {user._id === currentUser?._id || user._id === currentUser?.id ? <span style={{ fontSize: 10, color: '#f59e0b' }}>YOU</span> : null}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 13 }}>{user.email}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={user.role === 'admin' ? 'badge badge-gold' : 'badge badge-gray'}>{user.role}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={user.isActive ? 'badge badge-green' : 'badge badge-red'}>{user.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 13 }}>
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {user.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(user._id, user.name)} disabled={!!actionLoading}>
                                {actionLoading === user._id + '_status' ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn btn-outline btn-sm" style={{ borderColor: '#a78bfa', color: '#a78bfa' }} onClick={() => handleMakeAdmin(user._id, user.name)} disabled={!!actionLoading}>
                                {actionLoading === user._id + '_admin' ? '...' : 'Make Admin'}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id, user.name)} disabled={!!actionLoading}>
                                {actionLoading === user._id + '_delete' ? '...' : 'Delete'}
                              </button>
                            </div>
                          )}
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
