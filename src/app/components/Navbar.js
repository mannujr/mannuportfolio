'use client';

import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact Me', href: '/contact-me' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-3xl font-bold text-gray-800 hover:text-indigo-600 transition-colors duration-300">
              Digitiser
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600  hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-800 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'rotate-45 top-2.5' : 'top-1'
                  }`}
                ></span>
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-0' : 'opacity-100 top-2.5'
                  }`}
                ></span>
                <span
                  className={`absolute block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isOpen ? '-rotate-45 top-2.5' : 'top-4'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:bg-indigo-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
