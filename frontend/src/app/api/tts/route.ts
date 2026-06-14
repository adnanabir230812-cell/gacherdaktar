import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow Vercel to run up to 60 seconds if needed

// Helper function to split text into chunks of max 160 characters, keeping sentences intact
function splitTextIntoChunks(text: string, maxLength = 160): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  // Split by common Bengali punctuation marks and endings to keep sentences intact
  const sentences = text.split(/([।,\n?.!])/);

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if ((currentChunk + part).length > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = part;
    } else {
      currentChunk += part;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 0);
}

async function handleTtsRequest(text: string) {
  try {
    // 1. Clean the text slightly (strip markdown, replace asterisks, remove some emojis)
    const cleanedText = text
      .replace(/\*\*/g, '')
      .replace(/[*#_`~]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .trim();

    if (!cleanedText) {
      return NextResponse.json({ error: 'Text is empty after cleaning' }, { status: 400 });
    }

    // 2. Split the text into safe chunks of max 160 characters
    const chunks = splitTextIntoChunks(cleanedText, 160);
    console.log(`[TTS API] Splitted text of length ${cleanedText.length} into ${chunks.length} chunks:`, chunks);

    const buffers: Buffer[] = [];

    // 3. Fetch each chunk from Google Translate TTS API sequentially to avoid rate-limits
    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodedText}`;

      const res = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[TTS API] Google TTS chunk fetch failed with status ${res.status}: ${errText}`);
        continue; // skip failed chunks or handle failure
      }

      const audioBuffer = await res.arrayBuffer();
      buffers.push(Buffer.from(audioBuffer));
    }

    if (buffers.length === 0) {
      return NextResponse.json({ error: 'Failed to generate TTS audio for any chunk' }, { status: 500 });
    }

    // 4. Concatenate MP3 frames directly into a single combined buffer
    const combinedBuffer = Buffer.concat(buffers);
    console.log(`[TTS API] Successfully combined ${buffers.length} chunks into ${combinedBuffer.length} bytes.`);

    return new Response(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err: any) {
    console.error('[TTS API] handleTtsRequest exception:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
