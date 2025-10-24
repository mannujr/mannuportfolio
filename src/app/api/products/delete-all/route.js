import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function DELETE(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const res = await Product.deleteMany({});
    return NextResponse.json({ deletedCount: res.deletedCount || 0 });
  } catch (err) {
    console.error('DELETE /api/products/delete-all error', err);
    return NextResponse.json({ message: 'Failed to delete all products' }, { status: 500 });
  }
}
