'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/context/NotificationContext';

export default function AdminProducts(){
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/auth/admin-signin?callbackUrl=/admin/products';
    }
  });
  
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', type: '', metal: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('active'); // 'active' | 'deleted'
  const [useAiImage, setUseAiImage] = useState(true);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const restoreProduct = async (slug)=>{
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restore: true })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed to restore');
      setProducts(prev=>prev.filter(p=>p.slug !== slug));
      notify({ type: 'success', title: 'Restored', message: `${slug} restored` });
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
  };

  const deleteAllProducts = async ()=>{
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      if (typeof window !== 'undefined'){
        const ok = window.confirm('Delete ALL products permanently?');
        if (!ok) return;
      }
      setLoading(true);
      const res = await fetch('/api/products/delete-all', { method:'DELETE', credentials:'same-origin' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Delete all failed');
      notify({ type:'success', title:'Deleted all', message:`Removed ${data.deletedCount || 0} products` });
      const qs = view === 'deleted' ? '?onlyDeleted=1' : '';
      const listRes = await fetch(`/api/products${qs}`, { credentials:'same-origin', cache:'no-store' });
      const listData = await listRes.json();
      if (listRes.ok) setProducts(listData.products || []);
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
    finally{ setLoading(false); }
  };

  const hardDeleteProduct = async (slug)=>{
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}?force=1`, { method: 'DELETE', credentials:'same-origin' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed');
      setProducts(prev=>prev.filter(p=>p.slug !== slug));
      notify({ type:'success', title:'Deleted permanently', message: `${slug} removed`});
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
  };

  const seedProducts = async ()=>{
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      setLoading(true);
      const res = await fetch('/api/products/seed', { method:'POST', credentials:'same-origin' });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Seeding failed');
      notify({ type:'success', title:'Seeded', message:`Inserted ${data.inserted} products` });
      // refresh
      const qs = view === 'deleted' ? '?onlyDeleted=1' : '';
      const listRes = await fetch(`/api/products${qs}`, { credentials:'same-origin', cache:'no-store' });
      const listData = await listRes.json();
      if (listRes.ok) setProducts(listData.products || []);
    }catch(err){ console.error(err); notify({ type:'error', title:'Error', message: err.message }); }
    finally{ setLoading(false); }
  };

  useEffect(() => {
    if (!session) return;

    if (session.user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const qs = view === 'deleted' ? '?onlyDeleted=1' : '';
        const res = await fetch(`/api/products${qs}` , {
          credentials: 'same-origin',
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [session, view]);

  // Poll for updates every 20s to keep admin view in sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const qs = view === 'deleted' ? '?onlyDeleted=1' : '';
        const res = await fetch(`/api/products${qs}`, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setProducts(data.products || []);
      } catch {}
    }, 20000);
    return () => clearInterval(interval);
  }, [view]);

  const { notify } = useNotification();

  const handleCreate = async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.message || 'Image upload failed');
        finalImageUrl = upData.url;
      }
      // If AI image is enabled and no local file, generate based on details
      if (!imageFile && useAiImage) {
        const aiRes = await fetch('/api/ai-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, type: form.type, metal: form.metal, description: form.description })
        });
        const aiData = await aiRes.json();
        if (!aiRes.ok) throw new Error(aiData.message || 'AI image generation failed');
        finalImageUrl = aiData.url;
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, imageUrl: finalImageUrl, price: Number(form.price), inStock: true })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed');
      setProducts(prev=>[data.product, ...prev]);
      setForm({ name: '', description: '', price: '', imageUrl: '', type: '', metal: '' });
      setImageFile(null);
      notify({ type: 'success', title: 'Product added', message: `${data.product.name} was added.` });
    }catch(err){
      console.error(err);
      notify({ type: 'error', title: 'Error', message: err.message || 'Error creating product' });
    }finally{ setLoading(false); }
  }

  const deleteProduct = async (slug)=>{
    try{
      if (!session) throw new Error('Unauthorized - Please sign in');
      if (session.user?.role !== 'admin') throw new Error('Forbidden');
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message || 'Failed to delete');
      setProducts(prev=>prev.filter(p=> (p.slug || p._id) !== slug));
      notify({ type: 'success', title: 'Product deleted', message: `Deleted ${slug}` });
    }catch(err){
      console.error(err);
      notify({ type: 'error', title: 'Error', message: err.message || 'Error deleting product' });
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex items-center gap-2">
            <button onClick={()=>setView('active')} className={`px-3 py-1.5 rounded ${view==='active'?'bg-black text-white':'bg-white border'}`}>Active</button>
            <button onClick={()=>setView('deleted')} className={`px-3 py-1.5 rounded ${view==='deleted'?'bg-black text-white':'bg-white border'}`}>Deleted</button>
            <button onClick={seedProducts} disabled={loading} className="px-3 py-1.5 rounded bg-emerald-600 text-white">Seed 1</button>
            <button onClick={deleteAllProducts} disabled={loading} className="px-3 py-1.5 rounded bg-red-700 text-white">Delete All</button>
          </div>
        </div>

        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="p-2 border" required />
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="p-2 border">
            <option value="">Select Type</option>
            <option value="Necklace">Necklace</option>
            <option value="Ring">Ring</option>
            <option value="Bracelet">Bracelet</option>
            <option value="Earring">Earring</option>
            <option value="Locket">Locket</option>
            <option value="Pendant">Pendant</option>
            <option value="Anklet">Anklet</option>
            <option value="Brooch">Brooch</option>
          </select>
          <select value={form.metal} onChange={e=>setForm({...form, metal:e.target.value})} className="p-2 border">
            <option value="">Select Metal</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Platinum">Platinum</option>
            <option value="White Gold">White Gold</option>
            <option value="Rose Gold">Rose Gold</option>
            <option value="Sterling Silver">Sterling Silver</option>
            <option value="Palladium">Palladium</option>
            <option value="Titanium">Titanium</option>
            <option value="Tungsten">Tungsten</option>
            <option value="Stainless Steel">Stainless Steel</option>
            <option value="Copper">Copper</option>
            <option value="Brass">Brass</option>
          </select>
          <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="p-2 border" min="0" max="10000000" step="0.01" required />
          <div className="flex items-center gap-3 p-2">
            <input id="use-ai" type="checkbox" checked={useAiImage} onChange={e=>setUseAiImage(e.target.checked)} />
            <label htmlFor="use-ai" className="text-sm">Use AI image (Gemini) based on details</label>
          </div>
          <input placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} className={`p-2 border ${useAiImage?'bg-gray-100 cursor-not-allowed':''}`} disabled={useAiImage} />
          <input type="file" accept="image/*" onChange={(e)=> setImageFile(e.target.files?.[0] || null)} className="p-2 border" />
          {(imageFile || form.imageUrl) && (
            <div className="col-span-full flex items-center gap-3 mt-1">
              <div className="w-20 h-20 rounded border overflow-hidden bg-gray-50">
                {/* preview chosen file or URL */}
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
                ) : (
                  <img src={form.imageUrl} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-xs text-gray-500">Preview</div>
            </div>
          )}
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="p-2 border col-span-full" />
          <div className="col-span-full flex justify-end">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading? 'Adding...':'Add Product'}</button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(p=> (
            <div key={p._id || p.slug} className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <div className="w-20 h-20 rounded border overflow-hidden bg-gray-50 shrink-0">
                <img src={p.imageUrl || '/images/placeholder.png'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.type} • {p.metal}</p>
                <p className="mt-1 font-bold">${p.price}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.slug && view==='active' && (
                  <button onClick={()=>deleteProduct(p.slug)} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded">Delete</button>
                )}
                {p.slug && view==='deleted' && (
                  <>
                    <button onClick={()=>restoreProduct(p.slug)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded">Restore</button>
                    <button onClick={()=>hardDeleteProduct(p.slug)} className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded">Delete Permanently</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
