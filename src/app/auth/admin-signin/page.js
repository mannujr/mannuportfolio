'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const callbackUrl = search.get('callbackUrl') || '/admin';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password, callbackUrl });
    setLoading(false);
    if (!res || res.error) {
      setError(res?.error || 'Sign in failed');
      return;
    }
    window.location.href = res.url || callbackUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 bg-gray-900 text-white">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-sm text-gray-300 mt-1">Sign in with your admin credentials</p>
        </div>
        <form onSubmit={onSubmit} className="px-8 py-6 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Admin Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded bg-black text-white font-medium disabled:opacity-50">{loading? 'Signing in...' : 'Sign in'}</button>
          <div className="text-xs text-gray-500 text-center">You will be redirected to the Admin Dashboard</div>
        </form>
        <div className="px-8 pb-6 text-sm text-center">
          <span className="text-gray-500">Not an admin?</span>{' '}
          <Link href="/auth/signin" className="text-gray-900 underline">User sign in</Link>
        </div>
      </div>
    </div>
  );
}
