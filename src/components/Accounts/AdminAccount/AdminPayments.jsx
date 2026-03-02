// src/components/admin/AdminPayments.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit2, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';

const SubscriptionTier = {
  FREE: 'FREE',
  PRO_LITE: 'PRO LITE',
  PREMIUM: 'PREMIUM',
};

const AdminPayments = () => {
  const { token, apiBaseURL } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrices, setEditingPrices] = useState(false);

  const [prices, setPrices] = useState({
    [SubscriptionTier.FREE]: '0',
    [SubscriptionTier.PRO_LITE]: '149',
    [SubscriptionTier.PREMIUM]: '299',
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  const getTierColorClass = (tier) => {
    switch (tier) {
      case SubscriptionTier.PREMIUM: return 'text-indigo-600';
      case SubscriptionTier.PRO_LITE: return 'text-blue-600';
      default: return 'text-slate-600';
    }
  };

  const getTierBadgeClass = (tier) => {
    switch (tier) {
      case SubscriptionTier.PREMIUM: return 'bg-indigo-100 text-indigo-700';
      case SubscriptionTier.PRO_LITE: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // ==================== LOAD PRICES FROM DATABASE ====================
  const loadPrices = async () => {
    try {
      const res = await fetch(`${apiBaseURL}/subscription-plans/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const priceMap = {};
        data.forEach(plan => {
          priceMap[plan.name] = plan.price;
        });
        setPrices(priceMap);
      }
    } catch (err) {
      console.error('Failed to load prices', err);
      toast.error('Could not load current prices from database');
    }
  };

  // ==================== LOAD USERS ====================
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseURL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        let userList = Array.isArray(data) ? data : (data.results || data.users || []);

        // Hide admins
        const clientsOnly = userList.filter(u =>
          u.role === 'user_client' || 
          !(u.is_staff || u.is_superuser || u.role === 'system_admin')
        );

        setUsers(clientsOnly);
      } else {
        toast.error('Failed to load users');
        setUsers([]);
      }
    } catch (err) {
      toast.error('Network error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load everything when token is available
  useEffect(() => {
    if (token) {
      loadUsers();
      loadPrices();
    }
  }, [token]);

  // ==================== UPDATE USER TIER ====================
  const updateUserTier = async (userId, newTier) => {
    try {
      const res = await fetch(`${apiBaseURL}/users/${userId}/update_tier/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: newTier }),
      });

      if (res.ok) {
        await loadUsers();
        toast.success(`Tier changed to ${newTier.replace('_', ' ')}`);
        setEditingUserId(null);
        setSelectedTier(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to update tier');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ==================== SAVE PRICES TO DATABASE ====================
  const savePrices = async () => {
    try {
      const res = await fetch(`${apiBaseURL}/subscription-plans/update-prices/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prices),
      });

      if (res.ok) {
        toast.success('Prices saved');
        setEditingPrices(false);
        await loadPrices();   // refresh display
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save prices');
      }
    } catch (err) {
      toast.error('Network error while saving');
    }
  };

  const handleRefresh = () => {
    loadUsers();
    loadPrices();
    toast.info('Refreshed data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Payment Management</h1>
            <p className="text-slate-500 mt-1">Manage tiers, pricing &amp; user subscriptions</p>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* ==================== PRICING EDITOR (Backend Powered) ==================== */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/60 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Subscription Pricing</h2>
              <p className="text-sm text-slate-500">Changes are saved permanently in the database</p>
            </div>
            <button 
              onClick={() => setEditingPrices(!editingPrices)} 
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all"
            >
              {editingPrices ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editingPrices ? 'Cancel' : 'Edit Prices'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(SubscriptionTier).map((tier) => (
              <div key={tier} className="bg-white border border-slate-100 rounded-2xl p-6">
                <div className={`font-black text-xl ${getTierColorClass(tier)}`}>
                  {tier.replace('_', ' ')}
                </div>
                <div className="mt-6">
                  <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2">Monthly Price (Ksh)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 text-slate-400">Ksh</span>
                    <input
                      type="text"
                      value={prices[tier] || ''}
                      disabled={!editingPrices || tier === SubscriptionTier.FREE}
                      onChange={(e) => setPrices({ ...prices, [tier]: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl text-3xl font-bold focus:outline-none focus:border-emerald-400 disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingPrices && (
            <button 
              onClick={savePrices} 
              className="mt-8 w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Save New Pricing
            </button>
          )}
        </div>

        {/* ==================== USERS TABLE ==================== */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/60 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              Clients &amp; Their Subscriptions ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading clients...</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 hidden md:table-header-group">
                  <tr>
                    <th className="text-left px-8 py-5 font-medium text-slate-500">User</th>
                    <th className="text-left px-8 py-5 font-medium text-slate-500">Email</th>
                    <th className="text-left px-8 py-5 font-medium text-slate-500">Current Tier</th>
                    <th className="text-left px-8 py-5 font-medium text-slate-500 w-64">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 block md:table-row-group">
                  {users.map((user) => {
                    const userId = user.id.toString();
                    const currentTier = user.tier || SubscriptionTier.FREE;
                    const isEditing = editingUserId === userId;

                    return (
                      <tr key={userId} className="hover:bg-slate-50/70 transition block md:table-row border-b md:border-none p-4 md:p-0">
                        <td className="px-8 py-6 block md:table-cell before:content-['User:'] before:font-medium before:text-slate-500 before:mr-2 md:before:hidden">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{user.username || user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 font-mono text-sm block md:table-cell before:content-['Email:'] before:font-medium before:text-slate-500 before:mr-2 md:before:hidden">{user.email}</td>
                        <td className="px-8 py-6 block md:table-cell before:content-['Current_Tier:'] before:font-medium before:text-slate-500 before:mr-2 md:before:hidden">
                          <span className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold tracking-wide capitalize ${getTierBadgeClass(currentTier)}`}>
                            {currentTier.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6 block md:table-cell before:content-['Action:'] before:font-medium before:text-slate-500 before:mr-2 md:before:hidden">
                          {isEditing ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <select 
                                value={selectedTier ?? currentTier} 
                                onChange={(e) => setSelectedTier(e.target.value)} 
                                className="border border-slate-300 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                {Object.values(SubscriptionTier).map((t) => (
                                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => updateUserTier(userId, selectedTier)} 
                                disabled={selectedTier === currentTier} 
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-2xl font-medium flex items-center gap-2 transition-all"
                              >
                                <Save className="w-4 h-4" /> Save
                              </button>
                              <button 
                                onClick={() => { setEditingUserId(null); setSelectedTier(null); }} 
                                className="bg-slate-200 hover:bg-slate-300 px-6 py-2 rounded-2xl"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setEditingUserId(userId); setSelectedTier(currentTier); }} 
                              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              <Edit2 className="w-4 h-4" /> Change Tier
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-500">No clients found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;