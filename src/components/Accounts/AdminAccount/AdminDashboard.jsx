// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { apiBaseURL, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(
        `${apiBaseURL}/admin/users-overview/?page=${currentPage}&page_size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          toast.error('Admin access required');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch overview');
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error('Error loading admin overview');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFullName = (u) => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    return name || u.username;
  };

  const getGenderDisplay = (sex) => {
    if (!sex) return '—';
    const label = sex === 'male' ? 'Male' : 'Female';
    const color = sex === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
    return (
      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  if (!(user?.is_staff || user?.is_superuser || user?.role === 'system_admin')) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  const admins = data?.users?.filter(u =>
    u.is_staff || u.is_superuser || u.role === 'system_admin'
  ) || [];

  const clients = data?.users?.filter(u =>
    !(u.is_staff || u.is_superuser || u.role === 'system_admin')
  ) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text">
          System Overview
        </h1>
        <p className="text-sm text-slate-500 font-medium">User statistics and management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Total Users</h3>
          <p className="text-4xl font-bold text-slate-800 mt-2">{data?.total_users || 0}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase">Active Users</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{data?.active_users || 0}</p>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* ADMINS SECTION */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-slate-800">Administrators ({admins.length})</h2>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Full Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Username</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Gender</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Date Joined</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-800">{getFullName(u)}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{u.username}</td>
                        <td className="px-6 py-4 text-slate-600">{u.email || '—'}</td>
                        <td className="px-6 py-4">{getGenderDisplay(u.sex)}</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(u.date_joined)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Admin
                          </span>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No administrators found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CLIENTS SECTION */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-slate-800">Clients ({clients.length})</h2>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Full Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Username</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Gender</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Date Joined</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-800">{getFullName(u)}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono">{u.username}</td>
                        <td className="px-6 py-4 text-slate-600">{u.email || '—'}</td>
                        <td className="px-6 py-4">{getGenderDisplay(u.sex)}</td>
                        <td className="px-6 py-4 text-slate-600">{formatDate(u.date_joined)}</td>
                        <td className="px-6 py-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No clients found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">No data available</div>
      )}
    </div>
  );
};

export default AdminDashboard;