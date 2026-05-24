import { NextResponse } from 'next/server';
import https from 'https';
import { URL } from 'url';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

export const maxDuration = 60; // Allow function to run up to 60 seconds on Vercel

const sanitizeEnv = (val: string | undefined) => {
  if (!val) return undefined;
  const clean = val.trim().replace(/[\r\n]+/g, '');
  return clean || undefined;
};

const getGeminiApiKeys = (): string[] => {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return rawKeys
    .split(',')
    .map(k => sanitizeEnv(k))
    .filter((k): k is string => !!k);
};

function httpsPostWithTimeout(
  urlStr: string,
  headers: Record<string, string>,
  bodyStr: string,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: headers
    };

    let isDone = false;

    const timer = setTimeout(() => {
      if (isDone) return;
      isDone = true;
      req.destroy();
      reject(new Error(`HTTPS request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        resolve({
          ok: res.statusCode ? (res.statusCode >= 200 && res.statusCode < 300) : false,
          status: res.statusCode || 500,
          text: data
        });
      });
    });

    req.on('error', (err) => {
      if (isDone) return;
      isDone = true;
      clearTimeout(timer);
      reject(err);
    });

    req.write(bodyStr);
    req.end();
  });
}

function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function POST(request: Request) {
  const startTime = Date.now();
  const getRemainingTime = (maxDurationMs: number) => {
    const elapsed = Date.now() - startTime;
    return Math.max(1000, maxDurationMs - elapsed);
  };

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Extract raw base64 data and mimeType from data URL
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    const systemPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor) AI, a highly experienced crop pathologist and plant disease expert in Bangladesh.
Analyze the provided leaf/plant image.
1. Identify the crop and the disease affecting it.
2. Provide details of the disease cause, symptoms, organic/cultural solutions, chemical remedies (specifying actual brand names available in Bangladesh such as Nativo, Virtako, Amistar Top, Tido, Ridomil Gold, Tilt, automatic dosages), and preventive guidelines.
3. ALWAYS response in Bengali language. Keep the tone warm, helpful, and colloquial.
4. Return ONLY a valid JSON object matching the schema below. No extra text or markdown wrapping outside the JSON.

JSON Schema:
{
  "crop": "আক্রান্ত ফসলের নাম (ইংরেজি নাম)",
  "disease": "শনাক্তকৃত রোগবালাইয়ের নাম (ইংরেজি নাম)",
  "cause": "রোগের বৈজ্ঞানিক কারণ বা জীবাণু",
  "symptoms": "ছবিতে দৃশ্যমান প্রধান লক্ষণসমূহ",
  "treatment_organic": "জৈবিক ও প্রাকৃতিক সমাধানসমূহ (বুলেট পয়েন্টে বিস্তারিত)",
  "treatment_chemical": "বাংলাদেশি ব্র্যান্ডের বালাইনাশক, ঔষধের নাম ও সঠিক প্রয়োগ মাত্রা (বুলেট পয়েন্টে বিস্তারিত)",
  "preventive_measures": "ভবিষ্যতে এই রোগ প্রতিরোধ করার করণীয় পদক্ষেপ (বুলেট পয়েন্টে বিস্তারিত)",
  "confidence": 0.85
}
`;

    const geminiKeys = getGeminiApiKeys();
    if (geminiKeys.length === 0) {
      return NextResponse.json({ error: 'Gemini API keys are not configured' }, { status: 500 });
    }

    const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);

    let geminiSuccess = false;
    let responseText = '';
    let usedKeyIndex = -1;

    // Try each key in randomized order until one succeeds
    for (let i = 0; i < shuffledKeys.length; i++) {
      const activeKey = shuffledKeys[i];
      try {
        const timeLimit = Math.min(25000, getRemainingTime(55000));
        if (timeLimit < 2000) {
          console.warn(`Skipping key ${i} due to insufficient remaining time: ${timeLimit}ms`);
          break;
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
        const res = await httpsPostWithTimeout(
          geminiUrl,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          }),
          timeLimit
        );

        if (res.ok) {
          const data = JSON.parse(res.text);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            responseText = text;
            geminiSuccess = true;
            usedKeyIndex = i;
            break;
          }
        } else {
          console.warn(`Key ${i} returned status ${res.status}: ${res.text}`);
        }
      } catch (err: any) {
        console.error(`Error with Gemini Key ${i}:`, err.message || err);
      }
    }

    if (!geminiSuccess) {
      return NextResponse.json({ error: 'All API keys failed or timed out during classification' }, { status: 500 });
    }

    const cleanedJson = cleanJSONString(responseText);
    const parsedData = JSON.parse(cleanedJson);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
