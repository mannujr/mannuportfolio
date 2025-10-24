import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
  try {
    // admin only
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const systemPrompt = body?.system || 'You are an assistant that helps the admin manage products and orders. Answer concisely.';

    if (!process.env.OPENAI_API_KEY) {
      // Fallback simple echo if no key
      const last = messages[messages.length - 1]?.content || '';
      return NextResponse.json({ reply: `AI (dev): ${last}` });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 400
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data?.error?.message || 'Assistant request failed' }, { status: res.status });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('POST /api/assistant error', err);
    return NextResponse.json({ message: 'Assistant error' }, { status: 500 });
  }
}
