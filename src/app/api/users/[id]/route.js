import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const body = await req.json();
    await connectDB();
    const allowed = {};
    // Prevent admin from changing their own role to non-admin
    if (token.sub && token.sub.toString() === id.toString() && body.role && body.role !== 'admin') {
      return NextResponse.json({ message: 'You cannot change your own role to non-admin.' }, { status: 400 });
    }
    if (body.role && ['admin', 'user'].includes(body.role)) allowed.role = body.role;
    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }
    const user = await User.findByIdAndUpdate(id, allowed, { new: true }).select('-password').lean();
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error('PUT /api/users/[id] error', err);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    // Prevent admin from deleting themselves
    if (token.sub && token.sub.toString() === id.toString()) {
      return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
    }
    await connectDB();
    const res = await User.deleteOne({ _id: id });
    return NextResponse.json({ deletedCount: res.deletedCount });
  } catch (err) {
    console.error('DELETE /api/users/[id] error', err);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
