'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [displayName, setDisplayName] = useState('');

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      try{
        const res = await fetch('/api/me', { credentials:'same-origin', cache:'no-store' });
        const data = await res.json();
        if (mounted && res.ok) setDisplayName(data.name || '');
      }catch{}
    };
    if (session) load(); else setDisplayName('');
    return ()=>{ mounted=false; };
  },[session]);
  const { getCartItemsCount } = useCart();

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Contact Me', href: '/contact-me' },
  ];

  return (
    <nav className="sticky top-0 z-50 lg:bottom-5"> 
      <div className="max-w-7xl bg-white lg:bg-transparent mx-auto lg:top-[810px] sm:px-6 lg:px-8 border-2 border-zinc-100 backdrop-blur-3xl lg:rounded-4xl relative z-50">
        <div className="flex items-center justify-between h-20 p-2">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-bold text-gray-800 hover:text-zinc-600 transition-colors duration-300"
          >
            Princely
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-white hover:bg-zinc-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-zinc-800 transition-colors" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-zinc-800"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{displayName || 'Profile'}</span>
                </Link>
                <button
                  onClick={async () => {
                    const target = session?.user?.role==='admin' ? '/auth/admin-signin' : '/auth/signin';
                    await signOut({ redirect: false, callbackUrl: target });
                    if (typeof window !== 'undefined') window.location.href = target;
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-zinc-800"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-2 text-gray-600 hover:text-zinc-800"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-sm">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all duration-300"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="relative w-6 h-6">
              <span
                className={`absolute block w-full h-0.5 bg-current transform transition duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 top-3' : 'top-1'
                }`}
              />
              <span
                className={`absolute block w-full h-0.5 bg-current transform transition duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : 'opacity-100 top-3'
                }`}
              />
              <span
                className={`absolute block w-full h-0.5 bg-current transform transition duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 top-3' : 'top-5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 animate-fadeIn">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-semibold text-gray-800 hover:text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Auth Links */}
          {session ? (
            <>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold text-gray-800 hover:text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-all duration-300"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  const target = session?.user?.role==='admin' ? '/auth/admin-signin' : '/auth/signin';
                  await signOut({ redirect: false, callbackUrl: target });
                  setIsOpen(false);
                  if (typeof window !== 'undefined') window.location.href = target;
                }}
                className="text-2xl font-semibold text-gray-800 hover:text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-all duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setIsOpen(false)}
              className="text-2xl font-semibold text-gray-800 hover:text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-all duration-300"
            >
              Sign In
            </Link>
          )}
          
          {/* Mobile Cart Link */}
          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="text-2xl font-semibold text-gray-800 hover:text-white hover:bg-indigo-600 px-6 py-3 rounded-md transition-all duration-300 flex items-center"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Cart {getCartItemsCount() > 0 && `(${getCartItemsCount()})`}
          </Link>
        </div>
      )}
    </nav>
  );
}