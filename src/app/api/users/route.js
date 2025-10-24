import connectDB from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  try {
    // only admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
  } catch (err) {
    console.error('GET /api/users error', err);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
