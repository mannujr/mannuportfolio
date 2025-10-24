 'use client';

 import { useState, useEffect } from 'react';
 import { useSession } from 'next-auth/react';

 export default function ContactMePage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ first: '', last: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(()=>{
    if (session?.user?.email) {
      setForm(prev=> ({ ...prev, email: session.user.email }));
    }
  },[session?.user?.email]);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setSending(true); setStatus('');
    try{
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: `${form.first} ${form.last}`.trim(),
          email: form.email,
          subject: form.subject,
          message: form.message,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');
      setStatus('Message sent! Our team will reply shortly.');
      setForm(prev=> ({ ...prev, subject: '', message: '' }));
    }catch(err){ setStatus(err.message || 'Error'); }
    finally{ setSending(false); }
  };
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Intro + Details */}
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
            <p className="mt-3 text-gray-600">We’d love to hear from you. Whether you have a question about products, orders, or anything else—our team is ready to help.</p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-4">
                <div className="text-sm text-gray-500">Email</div>
                <a href="mailto:mp2653260@gmail.com" className="font-semibold text-blue-600 hover:underline">mp2653260@gmail.com</a>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <div className="text-sm text-gray-500">Phone</div>
                <a href="tel:3584315331" className="font-semibold">3584315331</a>
              </div>
              <div className="bg-white border rounded-xl p-4 sm:col-span-2">
                <div className="text-sm text-gray-500">Studio</div>
                <div className="font-semibold">Katwaria, South Delhi</div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden border bg-white">
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-600">Map Placeholder</div>
            </div>
          </div>

          {/* Right: Static Form (no backend) */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Send a Message</h2>
            <p className="text-sm text-gray-500 mt-1">We typically respond within 1–2 business days.</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className="p-3 border rounded-lg" placeholder="First name" value={form.first} onChange={e=>setForm({...form, first:e.target.value})} required />
                <input className="p-3 border rounded-lg" placeholder="Last name" value={form.last} onChange={e=>setForm({...form, last:e.target.value})} />
              </div>
              <input className="w-full p-3 border rounded-lg" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
              <input className="w-full p-3 border rounded-lg" placeholder="Subject" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} required />
              <textarea className="w-full p-3 border rounded-lg min-h-[140px]" placeholder="Message" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} required />
              <button type="submit" className="w-full py-3 rounded-lg bg-black text-white">Send Message</button>
              <p className="text-xs text-gray-500 text-center">This will open your email app and prefill the message to us.</p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
 }
