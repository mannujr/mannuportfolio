'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminMessagesPage(){
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/admin-signin?callbackUrl=/admin/messages';
      }
    }
  });

  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if (!session || session.user?.role !== 'admin') return;
    const load = async ()=>{
      try{
        const res = await fetch('/api/messages?threads=1', { credentials:'same-origin', cache:'no-store' });
        const data = await res.json();
        if (res.ok) setThreads(data.threads || []);
      } finally { setLoading(false); }
    };
    load();
    const id = setInterval(load, 30000);
    return ()=>clearInterval(id);
  },[session]);

  useEffect(()=>{
    if (!activeThreadId) { setMessages([]); return; }
    const loadThread = async ()=>{
      const res = await fetch(`/api/messages?threadId=${encodeURIComponent(activeThreadId)}`, { credentials:'same-origin', cache:'no-store' });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    };
    loadThread();
  },[activeThreadId]);

  const sendReply = async ()=>{
    if (!reply.trim() || !activeThreadId) return;
    const res = await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ threadId: activeThreadId, message: reply.trim() })
    });
    const data = await res.json();
    if (res.ok) {
      setReply('');
      setMessages(prev=>[...prev, data.message]);
      // refresh thread list (for unread counts)
      const tRes = await fetch('/api/messages?threads=1', { credentials:'same-origin', cache:'no-store' });
      const tData = await tRes.json();
      if (tRes.ok) setThreads(tData.threads || []);
    }
  };

  if (status==='loading') return <div className="p-8">Loading...</div>;
  if (!session?.user?.role || session.user.role!=='admin') return <div className="p-8 text-red-600">Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 lg:col-span-1">
          <div className="font-semibold mb-3">User Messages</div>
          {loading && <div className="text-gray-500">Loading threads...</div>}
          <ul className="space-y-2">
            {threads.map(t=> (
              <li key={t.threadId}>
                <button onClick={()=>setActiveThreadId(t.threadId)} className={`w-full text-left p-3 rounded-lg border ${activeThreadId===t.threadId?'bg-gray-100':'bg-white'}`}>
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">{t.userEmail}</div>
                    {t.unreadCount>0 && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{t.unreadCount}</span>}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{t.subject || 'General'}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{t.lastMessage?.body}</div>
                </button>
              </li>
            ))}
            {threads.length===0 && !loading && (
              <li className="text-gray-500">No messages yet.</li>
            )}
          </ul>
        </div>

        <div className="bg-white border rounded-xl p-4 lg:col-span-2 flex flex-col">
          {!activeThreadId ? (
            <div className="text-gray-500">Select a thread to view messages.</div>
          ) : (
            <>
              <div className="font-semibold mb-3">Thread</div>
              <div className="flex-1 overflow-auto space-y-3 max-h-[60vh]">
                {messages.map(m=> (
                  <div key={m._id} className={`p-3 rounded-lg border ${m.fromRole==='admin'?'bg-gray-50':'bg-amber-50'}`}>
                    <div className="text-xs text-gray-500 mb-1">{new Date(m.createdAt).toLocaleString()} • {m.fromRole}</div>
                    <div className="text-sm">{m.body}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={reply} onChange={e=>setReply(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a reply..." />
                <button onClick={sendReply} className="px-4 py-2 bg-black text-white rounded">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
