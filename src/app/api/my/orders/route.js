import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const orders = await Order.find({ 'customer.email': token.email })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error('GET /api/my/orders error', err);
    return NextResponse.json({ message: 'Error fetching your orders' }, { status: 500 });
  }
}
