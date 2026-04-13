import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/useAuth';

const NotificationContext = createContext({ unreadCount: 0, refreshCount: () => {} });

export const NotificationProvider = ({ children }) => {
  const { token, apiBaseURL } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseURL}/admin/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // silently fail — sidebar badge is non-critical
    }
  }, [token, apiBaseURL]);

  // Poll every 60 seconds for new notifications
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 60000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);