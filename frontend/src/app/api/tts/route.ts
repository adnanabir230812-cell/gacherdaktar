import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow Vercel to run up to 60 seconds if needed

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const mimoKey = process.env.MIMO_API_KEY;
    if (!mimoKey) {
      return NextResponse.json({ error: 'MIMO_API_KEY is not configured' }, { status: 500 });
    }

    const mimoBaseUrl = (process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1').trim().replace(/\/$/, '');
    const mimoUrl = `${mimoBaseUrl}/chat/completions`;

    console.log(`[TTS API] Sending request to MiMo TTS URL: ${mimoUrl}`);

    const res = await fetch(mimoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mimoKey.trim()}`
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-tts',
        messages: [
          {
            role: 'user',
            content: 'Please speak the following Bengali text clearly.'
          },
          {
            role: 'assistant',
            content: text
          }
        ],
        audio: {
          format: 'mp3',
          voice: 'mimo_default'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[TTS API] MiMo speech failed with status ${res.status}: ${errText}`);
      return NextResponse.json({ error: `MiMo TTS failed: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    const audioDataB64 = data.choices?.[0]?.message?.audio?.data;

    if (!audioDataB64) {
      console.error('[TTS API] Audio data block not found in MiMo response:', JSON.stringify(data).substring(0, 500));
      return NextResponse.json({ error: 'Audio data not returned by MiMo' }, { status: 500 });
    }

    const audioBuffer = Buffer.from(audioDataB64, 'base64');

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (err: any) {
    console.error('[TTS API] Exception occurred:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
