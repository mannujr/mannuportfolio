import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    // only admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    console.error('GET /api/orders/[id] error', err);
    return NextResponse.json({ message: 'Error fetching order' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    // only admin can update order status/details
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();
    const order = await Order.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    console.error('PUT /api/orders/[id] error', err);
    return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    // only admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const res = await Order.deleteOne({ _id: id });
    return NextResponse.json({ deletedCount: res.deletedCount });
  } catch (err) {
    console.error('DELETE /api/orders/[id] error', err);
    return NextResponse.json({ message: 'Error deleting order' }, { status: 500 });
  }
}
