'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = (pathname || '/').split('/').filter(Boolean);
  const items = parts.map((p, i) => ({
    name: decodeURIComponent(p).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }));
  const isHome = items.length === 0;
  return (
    <div className={`w-full ${isHome ? 'hidden' : 'block'} bg-white/70 backdrop-blur border-b` }>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <nav className="flex items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          {items.map((item, idx) => (
            <span key={item.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              {idx === items.length - 1 ? (
                <span className="text-gray-900 font-medium truncate max-w-[40ch]">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-gray-900 truncate max-w-[32ch]">{item.name}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
