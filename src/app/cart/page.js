'use client';

import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const router = useRouter();

  const { data: session } = useSession();
  const { notify } = useNotification();

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!cart.length) {
      notify({ type: 'error', title: 'Empty Cart', message: 'Please add items to your cart before checkout.' });
      return;
    }

    if (!customer.name || !customer.email || !customer.address) {
      setError('Please fill name, email and address');
      notify({ type: 'error', title: 'Missing Information', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cart,
          customer: {
            ...customer,
            // Use session data if available
            name: session?.user?.name || customer.name,
            email: session?.user?.email || customer.email
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create order');

      clearCart();
      router.push('/');
    } catch (err) {
      console.error('Checkout error', err);
      setError(err.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link
          href="/products"
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.id} className="p-6 flex items-center">
                <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">
                        Quantity
                      </label>
                      <select
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between text-lg font-medium">
              <p>Subtotal</p>
              <p>${getCartTotal().toFixed(2)}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Shipping and taxes will be calculated at checkout.
            </p>
          </div>

          <div className="px-6 py-4 bg-gray-50">
            {!checkoutOpen ? (
              <button onClick={() => setCheckoutOpen(true)} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600">{error}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Full name" value={customer.name} onChange={(e)=>setCustomer({...customer, name: e.target.value})} className="p-2 border rounded" required />
                  <input placeholder="Email" value={customer.email} onChange={(e)=>setCustomer({...customer, email: e.target.value})} className="p-2 border rounded" required />
                  <input placeholder="Phone" value={customer.phone} onChange={(e)=>setCustomer({...customer, phone: e.target.value})} className="p-2 border rounded" />
                  <input placeholder="Address" value={customer.address} onChange={(e)=>setCustomer({...customer, address: e.target.value})} className="p-2 border rounded" required />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">{loading ? 'Processing...' : 'Place Order'}</button>
                  <button type="button" onClick={()=>setCheckoutOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}