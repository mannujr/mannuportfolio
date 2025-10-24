'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';

export default function AdminUsers(){
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/admin-signin?callbackUrl=/admin/users';
      }
    }
  });

  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await fetch('/api/users', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || 'Failed to load users');
        setUsers(data.users || []);
      }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
      finally{ setLoading(false); }
    };
    load();
  },[notify]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user?.role || session.user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const changeRole = async (id, role)=>{
    try{
      const res = await fetch(`/api/users/${id}`, { method:'PUT', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed to update role');
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      notify({ type: 'success', title: 'Role updated', message: `User role set to ${role}` });
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
  };

  const deleteUser = async (id)=>{
    try{
      const res = await fetch(`/api/users/${id}`, { method:'DELETE', credentials:'same-origin' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed to delete user');
      setUsers(prev => prev.filter(u => u._id !== id));
      notify({ type:'success', title:'User deleted', message:'The user has been removed.'});
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <div className="bg-white rounded shadow">
          <ul>
            {users.map(u=> (
              <li key={u._id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <div className="font-semibold">{u.email}</div>
                  <div className="text-sm text-gray-500">Role: {u.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={u.role} 
                    onChange={e=>changeRole(u._id, e.target.value)} 
                    className="p-2 border rounded"
                    disabled={session?.user?.email === u.email}
                    title={session?.user?.email === u.email ? 'You cannot change your own role' : ''}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  {(session?.user?.email && session.user.email === u.email) ? (
                    <button disabled className="px-3 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed" title="You cannot delete your own account">Delete</button>
                  ) : (
                    <button onClick={()=>deleteUser(u._id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
