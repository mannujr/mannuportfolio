import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req){
  try{
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { threadId, message } = body || {};
    if (!threadId || !message) {
      return NextResponse.json({ message: 'threadId and message are required' }, { status: 400 });
    }

    await connectDB();
    // find thread owner by looking up any message in thread
    const first = await Message.findOne({ threadId }).sort({ createdAt: 1 }).lean();
    if (!first) return NextResponse.json({ message: 'Thread not found' }, { status: 404 });

    const doc = await Message.create({
      threadId,
      fromRole: 'admin',
      userEmail: first.userEmail,
      name: 'Admin',
      subject: first.subject,
      body: message,
      readByAdmin: true,
      readByUser: false,
    });

    return NextResponse.json({ ok: true, message: doc });
  }catch(err){
    console.error('POST /api/messages/reply error', err);
    return NextResponse.json({ message: 'Failed to send reply' }, { status: 500 });
  }
}
