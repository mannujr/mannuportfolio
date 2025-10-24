import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req){
  try{
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ email: token.email }).lean();
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    const { email, name = '', phone = '', address = '', role } = user;
    return NextResponse.json({ email, name, phone, address, role });
  }catch(err){
    console.error('GET /api/me error', err);
    return NextResponse.json({ message: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req){
  try{
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const sanitize = s=> typeof s === 'string' ? s.trim().slice(0, 140) : '';
    const update = {
      ...(body.name !== undefined ? { name: sanitize(body.name) } : {}),
      ...(body.phone !== undefined ? { phone: sanitize(body.phone) } : {}),
      ...(body.address !== undefined ? { address: sanitize(body.address) } : {}),
    };
    await connectDB();
    const doc = await User.findOneAndUpdate({ email: token.email }, update, { new: true }).lean();
    if (!doc) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    const { email, name = '', phone = '', address = '', role } = doc;
    return NextResponse.json({ email, name, phone, address, role });
  }catch(err){
    console.error('PUT /api/me error', err);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
