import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    let { name, type, metal, description, backgroundStyle, angle, lighting, size, variant, dryRun } = body || {};

    // Basic validation & sanitization
    const sanitize = (s)=> (typeof s === 'string' ? s.trim().slice(0, 140) : '');
    name = sanitize(name);
    type = sanitize(type);
    metal = sanitize(metal);
    description = sanitize(description);
    backgroundStyle = sanitize(backgroundStyle) || 'pure white seamless background';
    angle = sanitize(angle) || 'three-quarter angle';
    lighting = sanitize(lighting) || 'softbox high-key lighting with gentle shadows';
    variant = sanitize(variant) || 'studio';
    const model = 'gemini-1.5-flash';
    const now = new Date().toISOString();

    if (!name || !type || !metal) {
      return NextResponse.json({ message: 'name, type, and metal are required' }, { status: 400 });
    }

    // Prompt templates by type
    const typePrompts = {
      ring: 'macro close-up with shallow depth of field on minimal stand',
      necklace: 'centered on bust stand, chain draped naturally',
      earring: 'on minimalist earring stand, symmetric composition',
      bracelet: 'laid flat in gentle curve, clasp visible',
      pendant: 'hanging centered, chain blurred softly',
      anklet: 'subtle curve presentation, delicate highlights',
      brooch: 'front-facing close-up, pin detail visible',
      default: 'balanced composition suitable for online catalog',
    };
    const key = (type || '').toLowerCase();
    const typeDetail = typePrompts[key] || typePrompts.default;

    // Optional size
    const width = Number(size?.w) > 0 && Number(size?.w) <= 2048 ? Number(size.w) : 1024;
    const height = Number(size?.h) > 0 && Number(size?.h) <= 2048 ? Number(size.h) : 768;

    const prompt = [
      `Create a high-quality ${variant} product photo suitable for an e-commerce listing.`,
      `Item: ${name}.`,
      `Category: ${type}.`,
      `Metal: ${metal}.`,
      description ? `Notes: ${description}.` : '',
      `Scene: ${typeDetail}.`,
      `Background: ${backgroundStyle}.`,
      `Camera: ${angle}.`,
      `Lighting: ${lighting}.`,
      `Output: PNG, aspect ${width}x${height}, realistic materials, accurate metal color, clean edges.`
    ].filter(Boolean).join(' ');

    const apiKey = process.env.GEMINI_API_KEY;

    let imageBuffer = null;
    let usedFallback = false;

    // If dry run requested, return prompt only
    if (dryRun) {
      return NextResponse.json({ prompt, model, createdAt: now, width, height, variant, url: '' });
    }

    // Timeout + retries
    const withTimeout = async (promise, ms) => {
      const ctrl = new AbortController();
      const t = setTimeout(()=>ctrl.abort(), ms);
      try { return await promise(ctrl.signal); }
      finally { clearTimeout(t); }
    };

    const callOnce = async (signal)=> {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }]}],
          generationConfig: { responseMimeType: 'image/png' }
        }),
        signal
      });
      const data = await res.json().catch(()=>({}));
      const part = data?.candidates?.[0]?.content?.parts?.find(p=>p.inline_data && p.inline_data.data);
      if (part?.inline_data?.data) {
        return Buffer.from(part.inline_data.data, 'base64');
      }
      throw new Error(data?.error?.message || 'No image data');
    };

    if (apiKey) {
      let attempts = 0;
      const maxAttempts = 2;
      while (!imageBuffer && attempts < maxAttempts) {
        attempts++;
        try {
          imageBuffer = await withTimeout(callOnce, 25000);
        } catch (e) {
          if (attempts >= maxAttempts) {
            usedFallback = true;
          }
        }
      }
    }

    if (!imageBuffer) {
      // Fallback: lightweight placeholder SVG based on details
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>\n  <rect width='100%' height='100%' fill='#f3f4f6'/>\n  <text x='50%' y='42%' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='#111827' font-family='sans-serif'>${(metal||'') + ' ' + (type||'Jewelry')}</text>\n  <text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='#6b7280' font-family='sans-serif'>${(name||'Product')}</text>\n</svg>`;
      imageBuffer = Buffer.from(svg);
      usedFallback = true;
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const isPng = apiKey && imageBuffer && imageBuffer[0]===0x89 && !usedFallback;
    const filename = `gemini-${Date.now()}.${isPng?'png':'svg'}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, imageBuffer);

    const url = `/uploads/${filename}`;
    // Save metadata for debugging/regeneration
    const meta = { url, prompt, model, createdAt: now, width, height, variant, backgroundStyle, angle, lighting, name, type, metal, description, usedFallback };
    try{
      await fs.writeFile(path.join(uploadsDir, `${filename}.json`), JSON.stringify(meta, null, 2));
    }catch{}

    return NextResponse.json(meta);
  } catch (err) {
    console.error('POST /api/ai-image error', err);
    return NextResponse.json({ message: 'AI image generation failed' }, { status: 500 });
  }
}
