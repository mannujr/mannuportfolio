'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart } = useCart();
  const pathname = usePathname();

  useEffect(()=>{
    // extract slug from params (App Router passes params) or pathname
    const slug = params?.slug || pathname.split('/').pop();
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.product) setProduct(data.product);
        else setError(data?.message || 'Product not found');
      })
      .catch(err => setError('Failed to load product'))
      .finally(()=>setLoading(false));
  },[params, pathname]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!product) return <div className="p-8">No product found</div>;

  const colors = [
    { key: 'primary', value: '#9db6ff' },
    { key: 'alt', value: '#d7e0ff' }
  ];

  const handleAdd = ()=>{
    addToCart({ id: product._id || product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl, options: { size: selectedSize || 'Standard' } });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="w-full border rounded-lg overflow-hidden bg-gray-50">
            <img src={product.imageUrl || '/images/placeholder.png'} alt={product.name} className="w-full h-[560px] object-cover" />
          </div>
        </div>
        <div>
          <div className="uppercase tracking-wide text-xs text-gray-500">New | Limited Edition</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{product.name}</div>
          <div className="mt-1 text-sm text-gray-600">{product.metal || 'Metal'} {product.type ? `• ${product.type}` : ''}</div>
          <div className="mt-4 text-2xl font-bold text-gray-900">${product.price}</div>

          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900">Color</div>
            <div className="mt-3 flex items-center gap-3">
              {colors.map(c => (
                <button key={c.key} className="w-10 h-10 rounded-full border-2 border-gray-300" style={{ backgroundColor: c.value }} aria-label={`color-${c.key}`}></button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-gray-800 leading-relaxed text-[15px]">
            {product.description || 'This exquisite piece blends timeless design with modern craftsmanship.'}
          </div>

          <button className="mt-3 text-sm text-gray-700 underline" onClick={()=>setShowDetails(v=>!v)}>View details</button>
          {showDetails && (
            <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Crafted with care and precision</li>
              <li>Comfort fit and premium finish</li>
              <li>Ships in a branded gift box</li>
            </ul>
          )}

          <div className="mt-8">
            <div className="w-full border rounded">
              <select value={selectedSize} onChange={(e)=>setSelectedSize(e.target.value)} className="w-full px-4 py-4 text-left text-sm">
                <option value="">Select size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <button onClick={handleAdd} className="mt-3 w-full bg-black text-white py-4 rounded text-sm tracking-wide">Add to bag</button>
          </div>

          <div className="mt-8 border rounded-lg p-5 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-lg">●</span>
              <div className="text-sm text-gray-800">
                Get it delivered
                <div className="text-gray-500">Standard shipping in 3–4 business days.</div>
                <div className="text-gray-500">Express shipping in 1–2 business days.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-4 border-t">
              <span className="text-green-600 text-lg">●</span>
              <div className="text-sm text-gray-800">
                Pick Up Select a store
                <div className="text-gray-500">Ready in 2 business hours · Free & Fastest</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded">+125 Points</div>
          <div className="mt-2 text-sm text-gray-700">Earn exclusive benefits. Log in / Join My Princely</div>

          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">↩ Free 30-day returns</div>
            <div className="flex items-center gap-2">🚚 Free standard shipping on orders $115+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
