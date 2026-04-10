'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editData, setEditData] = useState<{
    email: string;
    full_name: string;
    role: string;
  }>({
    email: '',
    full_name: '',
    role: 'client',
  });
  const [createData, setCreateData] = useState<{
    email: string;
    full_name: string;
    password: string;
    role: string;
  }>({
    email: '',
    full_name: '',
    password: '',
    role: 'client',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Error loading users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role as 'client' | 'admin',
    });
    setIsEditing(false);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating user');
      console.error('Error:', err);
    }
  };

  const handleCreateUser = async () => {
    if (!createData.email || !createData.password || !createData.full_name) {
      setError('Email, password, and name are required');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser]);
      setCreateData({ email: '', full_name: '', password: '', role: 'client' });
      setIsCreating(false);
      setError('');
    } catch (err) {
      setError('Error creating user');
      console.error('Error:', err);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_active: false });
      }
    } catch (err) {
      setError('Error deactivating user');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">User Management</h1>
            <p className="text-slate-400">Manage user roles and permissions</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded text-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="md:col-span-2">
            {isCreating ? (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Create New User</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={createData.email}
                      onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={createData.full_name}
                      onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                    <input
                      type="password"
                      value={createData.password}
                      onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Role</label>
                    <select
                      value={createData.role}
                      onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateUser}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                    >
                      Create User
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Users ({users.length})</h2>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                >
                  + Create User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map(user => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`cursor-pointer hover:bg-slate-700 transition-colors ${
                          selectedUser?.id === user.id ? 'bg-slate-700' : ''
                        }`}
                      >
                        <td className="px-6 py-3 text-sm">{user.email}</td>
                        <td className="px-6 py-3 text-sm">{user.full_name || '-'}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin' 
                              ? 'bg-purple-900 text-purple-100' 
                              : 'bg-blue-900 text-blue-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.is_active
                              ? 'bg-green-900 text-green-100'
                              : 'bg-red-900 text-red-100'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Details */}
          {selectedUser && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">User Details</h2>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Full Name</p>
                    <p className="text-white font-semibold">{selectedUser.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Role</p>
                    <p className="text-white font-semibold capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <p className={`font-semibold ${selectedUser.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Created</p>
                    <p className="text-white text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      Edit User
                    </button>
                    {selectedUser.is_active && (
                      <button
                        onClick={() => handleDeactivateUser(selectedUser.id)}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Role</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      onClick={handleUpdateUser}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
