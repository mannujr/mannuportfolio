import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req){
  try{
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const [latestProducts, latestOrders, latestUsers] = await Promise.all([
      Product.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(10).lean(),
      Order.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      User.find({}).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const items = [];
    for (const p of latestProducts){
      items.push({
        id: `prod-${p._id}`,
        type: 'listing',
        title: `${p.metal || ''} ${p.name}`.trim(),
        meta: p.type || 'Listing',
        amount: p.price || null,
        createdAt: p.createdAt
      });
    }
    for (const o of latestOrders){
      items.push({
        id: `order-${o._id}`,
        type: 'sales',
        title: `${o.customer?.name || o.customer?.email || 'Customer'} purchased ${o.products?.length || 1} item(s)` ,
        meta: 'Order',
        amount: o.totalAmount || null,
        createdAt: o.createdAt
      });
    }
    for (const u of latestUsers){
      items.push({
        id: `user-${u._id}`,
        type: 'new_buyer',
        title: `${u.email} just joined our store.`,
        meta: 'User',
        amount: null,
        createdAt: u.createdAt
      });
    }

    items.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ items });
  }catch(err){
    console.error('GET /api/admin/activity error', err);
    return NextResponse.json({ message: 'Failed to load activity' }, { status: 500 });
  }
}
