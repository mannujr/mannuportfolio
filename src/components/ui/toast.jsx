'use client';

import React from 'react';

export default function ToastContainer({ notifications = [], onClose = () => {} }){
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {notifications.map(n => (
        <div key={n.id} className={`max-w-sm w-full px-4 py-3 rounded shadow-md text-sm flex items-start gap-3 border ${n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className="flex-1">
            {n.title && <div className="font-semibold">{n.title}</div>}
            {n.message && <div className="mt-1 text-xs opacity-90">{n.message}</div>}
          </div>
          <button onClick={()=>onClose(n.id)} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
        </div>
      ))}
    </div>
  );
}
