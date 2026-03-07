import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 10 });
      if (search) p.append('search', search);
      const { data } = await api.get(`/admin/users?${p}`);
      setUsers(data.users || []);
      setPagination({ totalPages: data.totalPages, total: data.total });
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId, name) => {
    if (!window.confirm(`Toggle status for ${name}?`)) return;
    setActionLoading(userId + '_s');
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    setActionLoading(userId + '_d');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const handleMakeAdmin = async (userId, name) => {
    if (!window.confirm(`Promote "${name}" to admin?`)) return;
    setActionLoading(userId + '_a');
    try {
      await api.put(`/admin/users/${userId}/make-admin`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: 'admin' } : u));
      toast.success(`${name} promoted to admin`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="page-wrap">
      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>Users</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{pagination.total} registered users</p>
          </div>
          <input className="form-control" style={{ maxWidth: 260 }} placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {loading ? <div className="spinner" /> : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: user.role === 'admin' ? 'var(--accent)' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: user.role === 'admin' ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name} {(user._id === currentUser?._id || user._id === currentUser?.id) && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>(you)</span>}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${user.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{user.role}</span></td>
                      <td><span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(user._id, user.name)} disabled={!!actionLoading}>
                              {actionLoading === user._id + '_s' ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleMakeAdmin(user._id, user.name)} disabled={!!actionLoading}>
                              {actionLoading === user._id + '_a' ? '...' : 'Make admin'}
                            </button>
                            <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca' }} onClick={() => handleDelete(user._id, user.name)} disabled={!!actionLoading}>
                              {actionLoading === user._id + '_d' ? '...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </td>
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
