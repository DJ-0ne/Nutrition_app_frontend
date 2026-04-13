import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/useAuth';
import { useNotifications } from '../../../context/NotificationsContext';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  RefreshCw,
  Activity,
  AlertCircle,
  User,
  Clock,
} from 'lucide-react';

const CATEGORY_CONFIG = {
  medical_condition: {
    label:  'Medical Condition',
    icon:   <AlertCircle className="w-5 h-5" />,
    color:  'text-red-600',
    bg:     'bg-red-50',
    border: 'border-red-200',
    badge:  'bg-red-100 text-red-700',
  },
  other_condition: {
    label:  'Custom Condition',
    icon:   <Activity className="w-5 h-5" />,
    color:  'text-amber-600',
    bg:     'bg-amber-50',
    border: 'border-amber-200',
    badge:  'bg-amber-100 text-amber-700',
  },
  default: {
    label:  'Alert',
    icon:   <User className="w-5 h-5" />,
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    badge:  'bg-blue-100 text-blue-700',
  },
};

const getConfig = (notification) =>
  CATEGORY_CONFIG[notification.category] || CATEGORY_CONFIG.default;

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const FILTERS = [
  { key: 'all',               label: 'All' },
  { key: 'unread',            label: 'Unread' },
  { key: 'medical_condition', label: 'Medical' },
  { key: 'other_condition',   label: 'Custom' },
];

const AdminNotifications = () => {
  const { token, apiBaseURL }            = useAuth();
  const { setUnreadCount }               = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setLocalUnread]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseURL}/admin/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotifications(data.notifications || []);
      setLocalUnread(data.unread_count || 0);
      // Clear the sidebar dot when user visits this page
      setUnreadCount(0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [token, apiBaseURL, setUnreadCount]);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch(`${apiBaseURL}/admin/notifications/`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setLocalUnread(0);
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${apiBaseURL}/admin/notifications/${id}/`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setLocalUnread(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const deleteOne = async (id) => {
    try {
      await fetch(`${apiBaseURL}/admin/notifications/${id}/`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (removed && !removed.is_read) {
        setLocalUnread(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.is_read;
    return n.category === filter;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text flex items-center gap-3">
            <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">Health condition alerts from users</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-fit flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === f.key
                ? 'bg-white text-indigo-700 shadow'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellOff className="w-14 h-14 text-slate-300 mb-4" />
          <p className="text-xl font-semibold text-slate-500">No notifications</p>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'unread' ? 'All caught up!' : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notification => {
            const config = getConfig(notification);
            return (
              <div
                key={notification.id}
                className={`relative bg-white rounded-2xl border-2 shadow-sm transition-all ${
                  notification.is_read
                    ? 'border-slate-100 opacity-80'
                    : `${config.border} shadow-md`
                }`}
              >
                <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
                  {/* Icon with unread indicator (fixed for mobile) */}
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${config.bg} ${config.color} relative`}>
                    {config.icon}
                    {!notification.is_read && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.created_at)}
                      </span>
                      {notification.is_read && notification.read_at && (
                        <span className="text-xs text-slate-400">
                          · Read {formatDate(notification.read_at)}
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-slate-800 text-sm">{notification.title}</p>
                    <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-2 truncate">{notification.email}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={() => markOneRead(notification.id)}
                        title="Mark as read"
                        className="p-3 rounded-xl hover:bg-indigo-50 text-indigo-500 transition"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(notification.id)}
                      title="Dismiss"
                      className="p-3 rounded-xl hover:bg-red-50 text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;