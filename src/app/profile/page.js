'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);


  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({ name:'', phone:'', address:'' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [initialProfile, setInitialProfile] = useState({ name:'', phone:'', address:'' });
  const [editMode, setEditMode] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [threadMessages, setThreadMessages] = useState([]);
  const [reply, setReply] = useState('');

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      try{
        const res = await fetch('/api/my/orders', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load orders');
        if (mounted) setOrders(data.orders || []);
      }catch(e){ if(mounted) setError(e.message); }
      finally{ if(mounted) setLoadingOrders(false); }
    };
    if (status==='authenticated') load();
    return ()=>{ mounted=false; };
  },[status]);

  useEffect(()=>{
    let mounted = true;
    const loadMe = async ()=>{
      try{
        const res = await fetch('/api/me', { credentials:'same-origin', cache:'no-store' });
        const data = await res.json();
        if (res.ok && mounted) {
          const next = { name: data.name || '', phone: data.phone || '', address: data.address || '' };
          setProfile(next);
          setInitialProfile(next);
        }
      }catch{}
    };
    if (status==='authenticated') loadMe();
    return ()=>{ mounted=false; };
  },[status]);

  const saveProfile = async ()=>{
    setSaveStatus('');
    // basic validation
    if (profile.name.length > 140 || profile.phone.length > 30 || profile.address.length > 300) {
      setSaveStatus('Please keep inputs within allowed lengths.');
      return;
    }
    setSavingProfile(true);
    try{
      const res = await fetch('/api/me', { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body: JSON.stringify(profile) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      // refresh from server to confirm
      const me = await fetch('/api/me', { credentials:'same-origin', cache:'no-store' });
      const meData = await me.json();
      if (me.ok) {
        const next = { name: meData.name || '', phone: meData.phone || '', address: meData.address || '' };
        setProfile(next);
        setInitialProfile(next);
        setEditMode(false);
      }
      setSaveStatus('Saved');
    }catch(err){ setSaveStatus(err.message || 'Failed to save'); }
    finally{ setSavingProfile(false); }
  };

  useEffect(()=>{
    let mounted = true;
    const loadMsgs = async ()=>{
      try{
        const res = await fetch('/api/messages', { credentials:'same-origin', cache:'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load messages');
        if (mounted) setMyMessages(data.messages || []);
      }catch(e){ /* ignore */ }
      finally{ if(mounted) setLoadingMsgs(false); }
    };
    if (status==='authenticated') loadMsgs();
    return ()=>{ mounted=false; };
  },[status]);

  const groupedThreads = useMemo(()=>{
    const map = new Map();
    for (const m of myMessages) {
      const t = m.threadId || 'general';
      if (!map.has(t)) map.set(t, { threadId:t, subject:m.subject||'General', lastAt:0, unread:0, messages:[] });
      const entry = map.get(t);
      entry.messages.push(m);
      entry.lastAt = Math.max(entry.lastAt, new Date(m.createdAt).getTime());
      if (m.fromRole==='admin' && m.readByUser===false) entry.unread++;
    }
    return Array.from(map.values()).sort((a,b)=> b.lastAt - a.lastAt);
  },[myMessages]);

  const openThread = async (threadId)=>{
    setActiveThreadId(threadId);
    const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`, { credentials:'same-origin', cache:'no-store' });
    const data = await res.json();
    if (res.ok) setThreadMessages(data.messages || []);
  };

  const sendReply = async ()=>{
    if (!reply.trim() || !activeThreadId) return;
    // Reuse user POST /api/messages with same threadId
    const res = await fetch('/api/messages', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin',
      body: JSON.stringify({ threadId: activeThreadId, name: session?.user?.name || '', email: session?.user?.email || '', subject: groupedThreads.find(t=>t.threadId===activeThreadId)?.subject || 'General', message: reply.trim() })
    });
    const data = await res.json();
    if (res.ok) {
      setReply('');
      setThreadMessages(prev=>[...prev, data.message]);
      // refresh flat messages to update unread counts
      const list = await fetch('/api/messages', { credentials:'same-origin', cache:'no-store' });
      const listData = await list.json();
      if (list.ok) setMyMessages(listData.messages || []);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="flex items-center gap-2">
              {session?.user?.role==='admin' && (
                <Link href="/admin" className="px-3 py-2 rounded bg-black text-white text-sm">Go to Dashboard</Link>
              )}
              {!editMode ? (
                <button onClick={()=>{ setProfile(initialProfile); setEditMode(true); setSaveStatus(''); }} className="px-3 py-2 rounded border text-sm">Edit</button>
              ) : (
                <>
                  <button onClick={()=>{ setProfile(initialProfile); setEditMode(false); setSaveStatus(''); }} className="px-3 py-2 rounded border text-sm">Cancel</button>
                  <button onClick={saveProfile} disabled={savingProfile || (profile.name===initialProfile.name && profile.phone===initialProfile.phone && profile.address===initialProfile.address)} className="px-3 py-2 rounded bg-black text-white text-sm disabled:opacity-50">{savingProfile?'Saving...':'Save'}</button>
                </>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              {!editMode ? (
                <p className="mt-1 text-gray-900 min-h-6">{profile.name || '—'}</p>
              ) : (
                <input className="mt-1 p-2 border rounded w-full" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} placeholder="Your name" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              {!editMode ? (
                <p className="mt-1 text-gray-900 min-h-6">{profile.phone || '—'}</p>
              ) : (
                <input className="mt-1 p-2 border rounded w-full" value={profile.phone} onChange={e=>setProfile({...profile, phone:e.target.value})} placeholder="Phone number" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              {!editMode ? (
                <p className="mt-1 text-gray-900 whitespace-pre-line min-h-6">{profile.address || '—'}</p>
              ) : (
                <textarea className="mt-1 p-2 border rounded w-full" value={profile.address} onChange={e=>setProfile({...profile, address:e.target.value})} placeholder="Address" />
              )}
            </div>
            <div className="pt-1 text-sm">
              <span className={`${saveStatus==='Saved'?'text-emerald-600':'text-red-600'}`}>{saveStatus && saveStatus}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order History</h2>
            {!loadingOrders && <span className="text-sm text-gray-500">{orders.length} order(s)</span>}
          </div>
          {loadingOrders && <div className="text-gray-500">Loading orders...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loadingOrders && orders.length === 0 && !error && (
            <div className="text-gray-600">You have no orders yet.</div>
          )}
          <div className="space-y-3">
            {orders.map(o=> (
              <div key={o._id} className="border rounded-lg p-4 flex items-start gap-4">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                  <img src={(o.products?.[0]?.imageUrl) || '/images/placeholder.png'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Order #{o._id}</div>
                  <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()} • {o.products?.length || 0} item(s)</div>
                  <div className="mt-1 text-sm text-gray-600 truncate">{o.products?.map(p=>p.name).join(', ')}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${o.totalAmount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            {!loadingMsgs && <span className="text-sm text-gray-500">{groupedThreads.reduce((s,t)=>s+(t.unread||0),0)} unread</span>}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <ul className="space-y-2">
                {groupedThreads.map(t=> (
                  <li key={t.threadId}>
                    <button onClick={()=>openThread(t.threadId)} className={`w-full text-left p-3 rounded border ${activeThreadId===t.threadId?'bg-gray-100':'bg-white'}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm truncate">{t.subject}</div>
                        {t.unread>0 && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{t.unread}</span>}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(t.lastAt).toLocaleString()}</div>
                    </button>
                  </li>
                ))}
                {groupedThreads.length===0 && (
                  <li className="text-gray-500">No messages yet.</li>
                )}
              </ul>
            </div>
            <div className="lg:col-span-2 flex flex-col">
              {!activeThreadId ? (
                <div className="text-gray-500">Select a thread to view messages.</div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto space-y-3 max-h-[50vh]">
                    {threadMessages.map(m=> (
                      <div key={m._id} className={`p-3 rounded border ${m.fromRole==='admin'?'bg-gray-50':'bg-amber-50'}`}>
                        <div className="text-xs text-gray-500 mb-1">{new Date(m.createdAt).toLocaleString()} • {m.fromRole}</div>
                        <div className="text-sm">{m.body}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input value={reply} onChange={e=>setReply(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." />
                    <button onClick={sendReply} className="px-4 py-2 bg-black text-white rounded">Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}