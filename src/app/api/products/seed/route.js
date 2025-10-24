import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const TYPES = ['Necklace','Ring','Bracelet','Earring','Locket','Pendant','Anklet','Brooch'];
const METALS = ['Gold','Silver','Platinum','White Gold','Rose Gold','Sterling Silver','Palladium','Titanium','Tungsten','Stainless Steel','Copper','Brass'];

function slugify(str){
  return str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
}

export async function POST(req){
  try{
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    const count = 1;
    const docs = [];
    const ADJ = ['Elegant','Classic','Modern','Royal','Signature','Vintage','Eternal','Gleaming','Radiant','Handcrafted'];
    for (let i=0;i<count;i++){
      const type = TYPES[Math.floor(Math.random()*TYPES.length)];
      const metal = METALS[Math.floor(Math.random()*METALS.length)];
      const adjective = ADJ[Math.floor(Math.random()*ADJ.length)];
      const name = `${adjective} ${metal} ${type}`;
      const baseSlug = slugify(name);
      let uniqueSlug = baseSlug;
      let n = 1;
      while (docs.find(d=>d.slug===uniqueSlug) || await Product.findOne({ slug: uniqueSlug })){
        uniqueSlug = `${baseSlug}-${n++}`;
      }
      const price = Math.round((Math.random() * 9999999 + 1) * 100) / 100;
      const imageUrl = '/images/placeholder.png';
      const description = `Discover the ${name}, crafted in premium ${metal.toLowerCase()} with timeless ${type.toLowerCase()} design.`;
      docs.push({ name, slug: uniqueSlug, description, price, imageUrl, type, metal, inStock: true, deletedAt: null });
    }

    await Product.insertMany(docs);
    return NextResponse.json({ inserted: docs.length, sample: docs[0] });
  }catch(err){
    console.error('POST /api/products/seed error', err);
    return NextResponse.json({ message: 'Seeding failed' }, { status: 500 });
  }
}
