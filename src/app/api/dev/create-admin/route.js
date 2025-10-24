import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Development-only endpoint to create an admin user.
// Protect: only allowed when NODE_ENV !== 'production'.
export async function POST(req) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      // If user exists, upgrade role to admin
      existing.role = 'admin';
      await existing.save();
      return NextResponse.json({ message: 'User updated to admin', user: { email: existing.email, role: existing.role } }, { status: 200 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashed, role: 'admin' });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json({ message: 'Admin user created', user: userWithoutPassword }, { status: 201 });
  } catch (err) {
    console.error('create-admin error:', err);
    return NextResponse.json({ message: 'Error creating admin' }, { status: 500 });
  }
}
