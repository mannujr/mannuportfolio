import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req){
  try{
    const body = await req.json();
    const { name='', email='', subject='', message='' } = body || {};
    if (!email || !message) {
      return NextResponse.json({ message: 'Email and message are required' }, { status: 400 });
    }
    await connectDB();
    const threadId = (body.threadId) || `${(email||'').toLowerCase()}::${(subject||'general').toLowerCase()}`;
    const doc = await Message.create({
      threadId,
      fromRole: 'user',
      userEmail: email,
      name,
      subject,
      body: message,
      readByAdmin: false,
      readByUser: true,
    });
    return NextResponse.json({ ok: true, threadId, message: doc });
  }catch(err){
    console.error('POST /api/messages error', err);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}

export async function GET(req){
  try{
    const { searchParams } = new URL(req.url);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    await connectDB();

    const threadId = searchParams.get('threadId');
    const threadsFlag = searchParams.get('threads');

    if (threadId) {
      // Admin or the user who owns the thread can read messages
      const msgs = await Message.find({ threadId }).sort({ createdAt: 1 }).lean();
      if (!msgs.length) return NextResponse.json({ messages: [] });
      const ownerEmail = msgs[0].userEmail;
      if (!token || (token.role !== 'admin' && token.email !== ownerEmail)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      // mark read for the viewer
      if (token.role === 'admin') {
        await Message.updateMany({ threadId, fromRole: 'user', readByAdmin: false }, { $set: { readByAdmin: true } });
      } else {
        await Message.updateMany({ threadId, fromRole: 'admin', readByUser: false }, { $set: { readByUser: true } });
      }
      return NextResponse.json({ messages: msgs });
    }

    if (threadsFlag) {
      // Admin list threads summary
      if (!token || token.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const threads = await Message.aggregate([
        { $sort: { createdAt: -1 } },
        { $group: {
          _id: '$threadId',
          lastMessage: { $first: '$$ROOT' },
          userEmail: { $first: '$userEmail' },
          subject: { $first: '$subject' },
          unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$fromRole','user'] }, { $eq: ['$readByAdmin', false] }] }, 1, 0] } }
        }},
        { $project: { _id: 0, threadId: '$_id', lastMessage: 1, userEmail: 1, subject: 1, unreadCount: 1 } },
        { $limit: 50 }
      ]);
      return NextResponse.json({ threads });
    }

    // User list own messages summary
    if (!token || !token.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const myMsgs = await Message.find({ userEmail: token.email }).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ messages: myMsgs });
  }catch(err){
    console.error('GET /api/messages error', err);
    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}
