import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req, context) {
  try {
    const { slug } = await context.params;
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('GET /api/products/[slug] error', err);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    const { slug } = await context.params;
    // require admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();
    let update = { ...body };
    if (body && body.restore) {
      update = { $set: { deletedAt: null } };
    }
    const product = await Product.findOneAndUpdate({ slug }, update, { new: true }).lean();
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('PUT /api/products/[slug] error', err);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const { slug } = await context.params;
    // require admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force');
    if (force) {
      const res = await Product.deleteOne({ slug });
      return NextResponse.json({ hardDeleted: res.deletedCount });
    }
    const updated = await Product.findOneAndUpdate({ slug }, { $set: { deletedAt: new Date() } }, { new: true }).lean();
    if (!updated) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ softDeleted: true, product: updated });
  } catch (err) {
    console.error('DELETE /api/products/[slug] error', err);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
