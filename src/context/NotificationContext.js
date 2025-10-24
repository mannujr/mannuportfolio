'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '@/components/ui/toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }){
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback(({ type = 'info', title = '', message = '', timeout = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2,8);
    const n = { id, type, title, message };
    setNotifications((s) => [n, ...s]);
    if (timeout > 0) {
      setTimeout(() => {
        setNotifications((s) => s.filter(x => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setNotifications((s) => s.filter(x => x.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, remove }}>
      {children}
      <ToastContainer notifications={notifications} onClose={remove} />
    </NotificationContext.Provider>
  );
}

export function useNotification(){
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
