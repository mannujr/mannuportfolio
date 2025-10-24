'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';

export default function AdminOrders(){
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/admin-signin?callbackUrl=/admin/orders';
    }
  });

  const deleteOrder = async (id) => {
    try{
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Error');
      setOrders(prev => prev.filter(o => o._id !== id));
      notify({ type: 'success', title: 'Order deleted', message: `Order #${id} removed` });
    }catch(err){ console.error(err); notify({ type: 'error', title: 'Error', message: err.message || 'Error deleting order' }); }
  }
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      setError('Access denied');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', {
          credentials: 'same-origin',
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  const { notify } = useNotification();

  const updateStatus = async (id, status) => {
    try{
      const res = await fetch(`/api/orders/${id}`, { method: 'PUT', credentials: 'same-origin', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Error');
      setOrders(prev => prev.map(o => o._id === id ? data.order : o));
      notify({ type: 'success', title: 'Order updated', message: `Status updated to ${status}` });
    }catch(err){ console.error(err); notify({ type: 'error', title: 'Error', message: err.message || 'Error updating order' }); }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Orders</h2>
        <div className="space-y-4">
          {orders.map(o=> (
            <div key={o._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm text-gray-500">{o.customer?.name} • {o.customer?.email}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <select value={o.status} onChange={(e)=>updateStatus(o._id, e.target.value)} className="p-2 border rounded">
                    {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={()=>deleteOrder(o._id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {o.products.map(p=> (
                    <div key={p.productId || p.name} className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-500">Qty: {p.quantity} • ${p.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold">Total: ${o.totalAmount}</div>
                  <div className="text-sm text-gray-500 mt-2">Address: {o.customer?.address}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
