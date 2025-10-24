'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminHome(){
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/admin-signin?callbackUrl=/admin';
      }
    }
  });

  const [metrics, setMetrics] = useState({ usersCount: 0, listingsCount: 0, ordersCount: 0, totalRevenue: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all'); // all | publish | listing | new_buyer | sales

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await fetch('/api/admin/metrics', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json();
        if(res.ok){ setMetrics(data); }
      }catch(e){ /* ignore */ }
      finally{ setLoadingMetrics(false); }
    };
    load();
  },[]);

  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await fetch('/api/admin/activity', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json();
        if(res.ok){ setActivity(data.items || []); }
      }catch(e){ /* ignore */ }
    };
    load();
    const id = setInterval(load, 30000);
    return ()=>clearInterval(id);
  },[]);

  if (status === 'loading') {
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

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Top Bar */}
      <div className="bg-black text-white px-6 py-4 text-2xl font-bold">Admin Dashboard</div>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-xl p-5 bg-gradient-to-br from-amber-200 to-amber-100 text-gray-900 shadow">
            <div className="font-semibold text-lg">Super Admin</div>
            <div className="text-sm text-gray-700 mt-1">{session?.user?.email}</div>
          </div>
          <nav className="mt-4 space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded-lg bg-white border hover:shadow">Dashboard</Link>
            <Link href="/admin/products" className="block px-4 py-3 rounded-lg bg-white border hover:shadow">Product Listing</Link>
            <Link href="/admin/orders" className="block px-4 py-3 rounded-lg bg-white border hover:shadow">Customer Orders</Link>
            <Link href="/admin/users" className="block px-4 py-3 rounded-lg bg-white border hover:shadow">User Verification</Link>
            <Link href="/admin/messages" className="block px-4 py-3 rounded-lg bg-white border hover:shadow">User Messages</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-sm text-gray-600">Registered Users</div>
              <div className="text-2xl font-semibold">{loadingMetrics ? '…' : metrics.usersCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-sm text-gray-600">Total Listings</div>
              <div className="text-2xl font-semibold">{loadingMetrics ? '…' : metrics.listingsCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-sm text-gray-600">Orders</div>
              <div className="text-2xl font-semibold">{loadingMetrics ? '…' : metrics.ordersCount}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-semibold">{loadingMetrics ? '…' : `$${metrics.totalRevenue.toLocaleString()}`}</div>
            </div>
          </div>

          {/* Activity + Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">Activity</div>
                <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                  <span className="px-2 py-1 text-xs rounded-full border bg-white">⚙</span>
                  {[
                    {k:'all', label:'All'},
                    {k:'publish', label:'Publish'},
                    {k:'listing', label:'Listing'},
                    {k:'new_buyer', label:'New Buyer'},
                    {k:'sales', label:'Sales'}
                  ].map(chip=> (
                    <button key={chip.k} onClick={()=>setActivityFilter(chip.k)} className={`text-xs px-3 py-1 rounded-full border ${activityFilter===chip.k?'bg-black text-white border-black':'bg-white'}`}>{chip.label}</button>
                  ))}
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-gray-800">
                {activity
                  .filter(it=> activityFilter==='all' || (activityFilter==='publish' && it.type==='listing') || it.type===activityFilter)
                  .map(it=> (
                  <li key={it.id} className="flex items-center gap-3 p-3 rounded-lg border bg-[#fcfbf9]">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 border">
                      <img src="/images/jwellery 1.png" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {it.title}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(it.createdAt).toLocaleString()}</div>
                    </div>
                    {it.amount ? (
                      <div className="text-right font-semibold">${it.amount.toLocaleString()}</div>
                    ) : (
                      <button className="text-sm underline">{it.type==='new_buyer'?'Chat now':'Review'}</button>
                    )}
                  </li>
                ))}
                {activity.length===0 && (
                  <li className="text-gray-500">No activity yet.</li>
                )}
              </ul>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <div className="font-semibold mb-3">Quick Links</div>
              <div className="space-y-2">
                <Link href="/admin/products" className="block px-4 py-2 rounded border hover:bg-gray-50">Manage Products</Link>
                <Link href="/admin/orders" className="block px-4 py-2 rounded border hover:bg-gray-50">Manage Orders</Link>
                <Link href="/admin/users" className="block px-4 py-2 rounded border hover:bg-gray-50">Manage Users</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
