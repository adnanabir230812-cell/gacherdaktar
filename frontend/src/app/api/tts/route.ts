import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow Vercel to run up to 60 seconds if needed

async function handleTtsRequest(text: string) {
  const encodedText = encodeURIComponent(text);
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodedText}`;

  console.log(`[TTS API] Fetching high-quality Bengali TTS from Google: ${googleTtsUrl}`);

  const res = await fetch(googleTtsUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[TTS API] Google TTS failed with status ${res.status}: ${errText}`);
    return new Response(JSON.stringify({ error: `Google TTS failed: ${errText}` }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const audioBuffer = await res.arrayBuffer();

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache'
    }
  });
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    return await handleTtsRequest(text);
  } catch (err: any) {
    console.error('[TTS API] POST Exception occurred:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    return await handleTtsRequest(text);
  } catch (err: any) {
    console.error('[TTS API] GET Exception occurred:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
