import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  try {
    // only admin can list orders
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('GET /api/orders error', err);
    return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { products, customer } = body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ message: 'No products in order' }, { status: 400 });
    }
    const totalAmount = products.reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0);
    await connectDB();
    // attach authenticated user's email if available
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const customerFinal = { ...(customer || {}) };
    if (token?.email && !customerFinal.email) customerFinal.email = token.email;
    const order = await Order.create({ products, totalAmount, customer: customerFinal, status: 'Pending' });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error('POST /api/orders error', err);
    return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
  }
}
