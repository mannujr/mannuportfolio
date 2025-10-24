import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const metal = searchParams.get('metal');
    const maxPrice = searchParams.get('maxPrice');
    const query = searchParams.get('q');
    const includeDeleted = searchParams.get('includeDeleted');
    const onlyDeleted = searchParams.get('onlyDeleted');

    await connectDB();
    
    let filter = {};
    
    if (type) filter.type = type;
    if (metal) filter.metal = metal;
    if (maxPrice) filter.price = { $lte: parseFloat(maxPrice) };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Soft delete filtering
    if (onlyDeleted) {
      filter.deletedAt = { $ne: null };
    } else if (!includeDeleted) {
      filter.deletedAt = null;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get unique types and metals for filters
    const types = await Product.distinct('type');
    const metals = await Product.distinct('metal');

    // counts for types and metals
    const typeCountsAgg = await Product.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const metalCountsAgg = await Product.aggregate([
      { $match: filter },
      { $group: { _id: '$metal', count: { $sum: 1 } } }
    ]);
    const countsByType = Object.fromEntries(typeCountsAgg.filter(i=>i._id).map(i=>[i._id, i.count]));
    const countsByMetal = Object.fromEntries(metalCountsAgg.filter(i=>i._id).map(i=>[i._id, i.count]));

    return NextResponse.json({ 
      products,
      filters: {
        types: types.filter(Boolean),
        metals: metals.filter(Boolean),
        countsByType,
        countsByMetal
      }
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json(
      { message: 'Error fetching products', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // require admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { name, slug: providedSlug, description, price, imageUrl, type, metal, inStock } = body;
    if (!name || typeof price === 'undefined') {
      return NextResponse.json({ message: 'Missing required fields: name and price are required' }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0 || numericPrice > 10000000) {
      return NextResponse.json({ message: 'Price must be a number between 0 and 10000000' }, { status: 400 });
    }

    await connectDB();

    const slugify = (str) =>
      str
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    let baseSlug = providedSlug && providedSlug.trim() ? providedSlug.trim() : slugify(name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    // ensure uniqueness
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const product = await Product.create({ name, slug: uniqueSlug, description, price: numericPrice, imageUrl, type, metal, inStock });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error('POST /api/products error', err);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}
