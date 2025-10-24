import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  try {
    // admin only
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [usersCount, listingsCount, orders, revenueAgg] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({ deletedAt: null }),
      Order.countDocuments({}),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;
    return NextResponse.json({
      usersCount,
      listingsCount,
      ordersCount: orders,
      totalRevenue
    });
  } catch (err) {
    console.error('GET /api/admin/metrics error', err);
    return NextResponse.json({ message: 'Failed to get metrics' }, { status: 500 });
  }
}
