'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Contact Me', href: '/contact-me' },
  ];

  return (
   
    <nav className="sticky top-0 z-50 lg:bottom-5 "> 
      
      
      {/* 2. Give the internal container a relative position and z-index */}
      <div className="max-w-7xl bg-white lg:bg-transparent mx-auto lg:top-[810px] sm:px-6 lg:px-8 border-2 border-zinc-100 backdrop-blur-3xl lg:rounded-4xl relative z-50">
        <div className="flex items-center justify-between h-20 p-2">
          {/* --- Logo --- */}
          <Link
            href="/"
            className="text-3xl font-bold text-gray-800 hover:text-zinc-600 transition-colors duration-300"
          >
            Princely
          </Link>

          {/* --- Desktop Menu --- */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-white hover:bg-zinc-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* --- Mobile Hamburger --- */}
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

      {/* --- Fullscreen Overlay --- */}
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
        </div>
      )}
    </nav>
  );
}