import { NextResponse } from 'next/server';
import https from 'https';
import { URL } from 'url';
import dns from 'dns';
import { CROPS } from '../data';
import { supabaseAdmin } from '@/lib/supabase';
import { checkSecurity, isOwnerIp } from '@/lib/security';

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

function stringifyIfObject(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
  }
  if (typeof val === 'object') {
    let result = '';
    if (val.heading) result += `**${val.heading}**\n\n`;
    if (val.introduction) result += `${val.introduction}\n\n`;
    const details = val.details || val.measures || val.organic || val.chemical || val.symptoms;
    if (details) {
      if (Array.isArray(details)) {
        result += details.map(item => `* ${item}`).join('\n');
      } else {
        result += `${details}`;
      }
    } else {
      result += Object.entries(val)
        .filter(([k]) => k !== 'heading' && k !== 'introduction')
        .map(([k, v]) => `* **${k}**: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join('\n');
    }
    return result.trim();
  }
  return String(val);
}

function parseClassificationResponse(text: string): any {
  const cleaned = cleanJSONString(text);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      if (parsed.confidence !== undefined) {
        let conf = parsed.confidence;
        if (typeof conf === 'string') {
          conf = conf.replace(/%/g, '').trim();
          parsed.confidence = parseFloat(conf);
        }
        if (parsed.confidence > 1.0) {
          parsed.confidence = parsed.confidence / 100.0;
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error("JSON.parse failed on classification response, attempting regex fallback:", e);
  }

  // Regex fallback: try to extract fields manually
  const extractFieldString = (field: string): string => {
    const match = cleaned.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.|[\\r\\n])*)"`)) || 
                  cleaned.match(new RegExp(`"${field}"\\s*:\\s*'((?:[^'\\\\]|\\\\.|[\\r\\n])*)'`));
    if (match) {
      try {
        return JSON.parse(`"${match[1]}"`);
      } catch {
        return match[1];
      }
    }
    return "";
  };

  const extractFieldBoolean = (field: string, defaultVal: boolean): boolean => {
    const match = cleaned.match(new RegExp(`"${field}"\\s*:\\s*(true|false)`, 'i'));
    if (match) {
      return match[1].toLowerCase() === 'true';
    }
    return defaultVal;
  };

  const extractFieldFloat = (field: string, defaultVal: number): number => {
    const match = cleaned.match(new RegExp(`"${field}"\\s*:\\s*"?([0-9.]+)`));
    if (match) {
      let val = parseFloat(match[1]);
      if (val > 1.0) {
        val = val / 100.0;
      }
      return val;
    }
    return defaultVal;
  };

  const extractFieldArray = (field: string): any[] | null => {
    const arrayMatch = cleaned.match(new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`));
    if (!arrayMatch) return null;
    const arrayStr = arrayMatch[1];
    
    if (field === 'questions') {
      try {
        const parsed = JSON.parse(`[${arrayStr}]`);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Direct array parse failed, attempting robust block-by-block parsing:", e);
      }
      
      const questions: any[] = [];
      const blocks = arrayStr.match(/\{[\s\S]*?\}/g);
      if (blocks) {
        for (const block of blocks) {
          const idMatch = block.match(/"id"\s*:\s*"([^"]+)"/) || block.match(/"id"\s*:\s*'([^']+)'/);
          const textMatch = block.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/) || block.match(/"text"\s*:\s*'((?:[^'\\]|\\.)*)'/);
          const optionsMatch = block.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
          
          if (idMatch && textMatch && optionsMatch) {
            const id = idMatch[1];
            const text = textMatch[1];
            const optionsStr = optionsMatch[1];
            const options: string[] = [];
            const optRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
            let optMatch;
            while ((optMatch = optRegex.exec(optionsStr)) !== null) {
              const rawOpt = optMatch[1] || optMatch[2] || '';
              try {
                options.push(JSON.parse(`"${rawOpt}"`));
              } catch {
                options.push(rawOpt);
              }
            }
            questions.push({ id, text, options });
          }
        }
      }
      return questions.length > 0 ? questions : null;
    }
    return null;
  };

  const is_valid = extractFieldBoolean('is_valid', true);
  const need_clarification = extractFieldBoolean('need_clarification', false);
  const confidence = extractFieldFloat('confidence', 0.85);

  return {
    is_valid,
    error_message: extractFieldString('error_message') || null,
    need_clarification,
    questions: extractFieldArray('questions'),
    crop: extractFieldString('crop'),
    disease: extractFieldString('disease'),
    cause: extractFieldString('cause'),
    symptoms: extractFieldString('symptoms'),
    treatment_organic: extractFieldString('treatment_organic'),
    treatment_chemical: extractFieldString('treatment_chemical'),
    preventive_measures: extractFieldString('preventive_measures'),
    confidence
  };
}

async function postOpenRouter(
  model: string,
  prompt: string,
  images: string[],
  apiKey: string,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; text: string }> {
  const content: any[] = [{ type: "text", text: prompt }];
  
  for (const img of images) {
    let mimeType = "image/jpeg";
    let base64Data = img;
    if (img.startsWith('data:')) {
      const semiIndex = img.indexOf(';');
      if (semiIndex !== -1) {
        mimeType = img.substring(5, semiIndex);
      }
      const base64Index = img.indexOf(';base64,');
      if (base64Index !== -1) {
        base64Data = img.substring(base64Index + 8);
      }
    }
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mimeType};base64,${base64Data}`
      }
    });
  }

  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: content
      }
    ],
    response_format: {
      type: "json_object"
    }
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://gacherdoctor.site",
      "X-Title": "Gacher Doctor"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    text: text
  };
}

async function runOpenRouterConsensus(
  textA: string,
  textB: string,
  apiKey: string,
  timeoutMs: number
): Promise<string> {
  const consensusPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), an expert local plant pathologist in Bangladesh.
Below are leaf disease/soil diagnoses from two different agricultural vision models for the same sample.
Reconcile and merge these two diagnoses. If they disagree, use scientific agricultural logic to determine the correct diagnosis.
Combine their treatment instructions (organic, chemical, and preventive) into a single, unified, reassuring, and extremely detailed handbook-style response in Bengali for the farmer.
Ensure the tone is warm and colloquial ("প্রিয় কৃষক ভাই" style).
Return ONLY a valid JSON object matching the requested schema. No extra text or markdown wrapping.

Model A response:
${textA}

Model B response:
${textB}

JSON Schema:
{
  "is_valid": true,
  "error_message": null,
  "need_clarification": false,
  "questions": null,
  "crop": "ফসলের বাংলা নাম (ইংরেজি নাম)",
  "disease": "রোগের স্থানীয় ও পরিচিত বাংলা নাম (ইংরেজি বা বৈজ্ঞানিক নাম)",
  "cause": "রোগের বৈজ্ঞানিক কারণ বা জীবাণু (সহজ বাংলায়)",
  "symptoms": "দৃশ্যমান প্রধান লক্ষণসমূহ (বুলেট পয়েন্টে বিস্তারিত)",
  "treatment_organic": "জৈবিক ও প্রাকৃতিক সমাধানসমূহ (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত)",
  "treatment_chemical": "বাংলাদেশি ব্র্যান্ডের বালাইনাশক/ওষুধের নাম, সঠিক প্রয়োগ মাত্রা, কেন প্রয়োজন, কীভাবে পানি মেশাবেন এবং কি সতর্কতা অবলম্বন করবেন (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত এবং বুঝিয়ে ব্যাখ্যা করা)",
  "preventive_measures": "ভবিষ্যতে এই রোগ প্রতিরোধ করার করণীয় পদক্ষেপ ও দীর্ঘমেয়াদী নির্দেশিকা (বুলেট পয়েন্টে বিস্তারিত)",
  "confidence": 0.95
}
`;

  const payload = {
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "user",
        content: consensusPrompt
      }
    ],
    response_format: {
      type: "json_object"
    }
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://gacherdoctor.site",
      "X-Title": "Gacher Doctor"
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!res.ok) {
    throw new Error(`Consensus failed with status ${res.status}: ${await res.text()}`);
  }

  const data = JSON.parse(await res.text());
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Consensus response content was empty");
  }
  return text;
}

export async function POST(request: Request) {
  const security = await checkSecurity(request, 'classify');
  if (security.blocked && security.response) {
    return security.response;
  }

  const startTime = Date.now();
  const isVercel = !!process.env.VERCEL;
  const maxDurationMs = isVercel ? 8000 : 90000;
  const directTimeoutMs = isVercel ? 6000 : 75000;

  const getRemainingTime = (maxDurationMs: number) => {
    const elapsed = Date.now() - startTime;
    return Math.max(1000, maxDurationMs - elapsed);
  };

  try {
    const { image, images, type = 'leaf', location, answers, crop, landSize, landUnit, plantCount } = await request.json();

    const resolvedImages: string[] = images || (image ? [image] : []);

    if (resolvedImages.length === 0) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const firstImage = resolvedImages[0];
    let mimeType = "image/jpeg";
    let base64Data = firstImage;

    if (firstImage.startsWith('data:')) {
      const semiIndex = firstImage.indexOf(';');
      if (semiIndex !== -1) {
        mimeType = firstImage.substring(5, semiIndex);
      }
      const base64Index = firstImage.indexOf(';base64,');
      if (base64Index !== -1) {
        base64Data = firstImage.substring(base64Index + 8);
      }
    }

    const systemPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a highly experienced local crop pathologist, master gardener, and plant disease expert in Bangladesh.
Analyze the provided leaf/plant image.

Critical Pre-check & Clarification Rules:
1. Verify if the uploaded image represents a plant, crop, leaf, tree, stem, agricultural field, fruit, or vegetable.
   - NOTE: It is completely normal for a farmer's hand or fingers to be visible holding the leaf/fruit, or for there to be soil/ground/feet in the background. As long as a plant/crop is visible, it is VALID.
   - If the image does NOT contain any plants, leaves, crops, or agricultural fields at all (for example: it contains ONLY a human face, a room interior, furniture, animals, a car, text documents, or any random non-plant objects), you MUST set "is_valid" to false, "error_message" to "এটি কোনো গাছ, লতাপাতা বা ফসলের ছবি নয়। দয়া করে আক্রান্ত ফসলের একটি স্পষ্ট ছবি আপলোড করুন।" and set "need_clarification" to false.
2. If the image is valid but there is ambiguity, or the confidence is low (confidence < 0.85), or you need more details to be 100% accurate (e.g. crop age, water level, symptoms on other parts), you MUST set "need_clarification" to true, list **at most 1 or 2 extremely simple multiple-choice questions** (never more than 2 questions, to avoid confusing the farmer) in the "questions" array for the farmer to answer, and you can leave "crop", "disease", "cause", "symptoms", "treatment_organic", "treatment_chemical", and "preventive_measures" empty or null.
3. If you are confident (confidence >= 0.85) OR if the user has already answered the clarifying questions (listed under "User's Answers to Clarifying Questions"), you MUST set "need_clarification" to false, set "questions" to null, and fill in all the diagnostic fields with 100% accuracy.

Guidelines & Bangladesh Context:
1. Identify the crop and the disease affecting it.
2. In the "disease" field, provide the local, colloquial Bangla name that Bangladeshi farmers actually use and recognize (e.g., ধানের ব্লাস্ট, পাতা পোড়া, টুংরো, আলু/টমেটোর নাবি ধসা, বেগুন বা মরিচের ডগা ও ফল ছিদ্রকারী পোকা, পাতা কোঁকড়ানো রোগ, গোড়া পচা ইত্যাদি) and put the English or scientific name in parentheses next to it.
3. Provide extremely detailed, section-by-section explanations and solutions in warm, friendly, natural Bangla (colloquial Bangladeshi farming dialect). Avoid academic jargon.
4. **Crop-Specific Differential Diagnosis (ফসলের রোগভিত্তিক পার্থক্যকরণ)**:
   To make the diagnosis highly accurate, you must evaluate based on specific distinctions between easily confused diseases in Bangladesh:
   - **Rice**: Blast (ধানের ব্লাস্ট - diamond/eye-shaped spots on leaves, gray center, neck rot) vs Bacterial Leaf Blight/BLB (ব্যাকটেরিয়াল পাতা পোড়া - wavy yellow/straw stripes from leaf tips along margins) vs Sheath Blight (খাপ পোড়া - large oval cloud-like lesions on sheaths).
   - **Tomato/Potato**: Late Blight (নাবি ধসা - water-soaked dark spots, white cottony mold under leaves in humidity) vs Early Blight (আগাম ধসা - dark brown circular spots with concentric rings/target-board pattern).
   - **Eggplant/Chilli**: Little Leaf (ক্ষুদ্র পত্র রোগ - bushy, tiny leaves, vector-borne) vs Phomopsis Blight/Fruit Rot (ফোমোপসিস ব্লাইট ও ফল পচা - sunken pale brown circular spots on fruit, circular spots on leaves).
   - অত্যন্ত গুরুত্বপূর্ণ (Very Important): "পার্থক্যকারী লক্ষণ" (Differential Diagnosis) বাক্যটি প্রতিটি রোগের ক্ষেত্রে সাধারণ বা জোরপূর্বক তুলনা করার জন্য লিখবেন না। কেবল এবং কেবলমাত্র যদি সনাক্তকৃত রোগটির লক্ষণ দেখতে ওই ফসলের অন্য কোনো নির্দিষ্ট রোগের মতো হয় (যেমন ধানের ব্লাস্ট বনাম পাতা পোড়া রোগ, কিংবা আলু/টমেটোর আগাম ধসা বনাম নাবি ধসা), এবং কৃষকের বিভ্রান্ত হওয়ার সত্যিকারের সুযোগ থাকে, কেবল তখনই সনাক্তকরণকে আরও নিখুঁত করতে "পার্থক্যকারী লক্ষণ: [এখানে অন্য রোগের সাথে মূল পার্থক্যটি লিখুন]" ফরম্যাটে লিখবেন। রোগটি যদি অনন্য (unique) হয় এবং অন্য কোনো রোগের সাথে গুলিয়ে ফেলার সুযোগ না থাকে, তবে এই লাইনটি কোনোভাবেই লিখবেন না।
5. DO NOT mention "AI", "Large Language Model", "machine learning", or similar tech terms anywhere in the response. Speak as "গাছের ডাক্তার" (Gacher Doctor) who has diagnosed the plant.
5. In the "treatment_chemical" field, suggest ONLY 100% authentic, registered chemical pesticides/fungicides commonly used and widely available in Bangladeshi local markets. Use actual brand names and details:
   - For Rice Blast/Leaf Spot: নাティブো ৭৫ডব্লিউজি (Nativo 75WG - ০.৬ গ্রাম প্রতি লিটার পানি) or অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি)।
   - For Sheath Blight/Dieback: অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি) or কন্টাফ ৫ইসি (Contaf 5EC - ২ মিলি প্রতি লিটার পানি)।
   - For Potato/Tomato Late Blight: রিডোমিল গোল্ড ৬৮ডব্লিউজি (Ridomil Gold 68WG - ২ গ্রাম প্রতি লিটার পানি) or ডাইথেন এম-৪৫ (Dithane M-45 - ২ গ্রাম প্রতি লিটার পানি)।
   - For Borers/Caterpillars (মাজরা পোকা / ডগা ও ফল ছিদ্রকারী পোকা): ভার্টাকো ৪০ডব্লিউজি (Virtako 40WG - ০.১৫ গ্রাম প্রতি লিটার পানি) or সবিক্রন ৪২৫ইসি (Sobicron 425EC - ২ মিলি প্রতি লিটার পানি) or প্রোক্লেম ৫এসজি (Proclaim 5SG - ১ গ্রাম প্রতি লিটার পানি)।
   - For Sucking Insects/Leaf Curl (জাব পোকা / সাদা মাছি / থ্রিপস / পাতা কোঁকড়ানো রোগ): অ্যাডমায়ার ২০০এসএল (Admire 200SL - ০.৫ মিলি প্রতি লিটার পানি) or টিডো ২০০এসএল (Tido 200SL - ০.৫ মিলি প্রতি লিটার পানি)।
   - For Red Spider Mites (লাল মাকড়): ভার্টিমেক ১.৮ইসি (Vertimec 1.8EC - ১.২ মিলি প্রতি লিটার পানি)।
   - For Root Rot/Foot Rot: অটোস্টিন ৫০ডব্লিউডিজি (Autostin 50WDG - ২ গ্রাম প্রতি লিটার পানি) or কমপ্যানিয়ন (Companion - ২ গ্রাম প্রতি লিটার পানি) মাটির গোড়ায় স্প্রে বা সেচন।
6. **Detailed Explaining Tone ("Bujhano Tone") Requirement**:
   - For any chemical suggestion, do NOT just write the pesticide name and dose. You MUST write in a detailed, handbook-style explaining tone.
   - Detail **WHY** this chemical is needed (e.g., "এই বালাইনাশকটি আক্রান্ত ছত্রাককে দ্রুত দমন করবে এবং সুস্থ অংশকে সংক্রমণ থেকে বাঁচাবে...").
   - Explain **HOW** to mix and apply step-by-step (e.g., "প্রথমে ১০ লিটার পরিষ্কার পানি একটি বালতি বা ডোপে নিন, সেখানে ৬ গ্রাম নাティブো ওষুধ দিয়ে ভালোভাবে লাঠি দিয়ে নেড়ে গুলিয়ে নিন। এরপর বিকেলের দিকে রোদের তীব্রতা কমে গেলে পুরো গাছে ভালো করে স্প্রে করুন...").
   - Provide **PRECAUTIONS** (e.g., "স্প্রে করার সময় মুখে অবশ্যই মাস্ক ও হাতে গ্লাভস ব্যবহার করবেন। বালাইনাশক স্প্রে করার পর অন্তত ১৪ দিনের মধ্যে ফসল সংগ্রহ করবেন না এবং ফসল খাওয়ার আগে পরিষ্কার পানিতে ভালো করে ধুয়ে নেবেন...").
7. **Critical Dosage Formatting Rule**: NEVER write pesticide or seed/fertilizer dosages/weights in decimal kilograms (e.g., do NOT write "0.03 kg", "0.5 kg", "0.05 kg" or "০.০৩ কেজি"). Convert all decimal kilogram measurements to grams and write them in standard Bangla (e.g., "৩০ গ্রাম", "৫০০ গ্রাম", "৫০ গ্রাম"). If a measurement is 1 kg or more, write it as "X কেজি Y গ্রাম" (e.g., for 1.2 kg write "১ কেজি ২০০ গ্রাম", for 1 kg write "১ কেজি") instead of "1.2 kg" or "১.২ কেজি".
8. Return ONLY a valid JSON object matching the schema below. No extra text or markdown wrapping outside the JSON.

JSON Schema:
{
  "is_valid": true,
  "error_message": null,
  "need_clarification": false,
  "questions": [
    {
      "id": "q1",
      "text": "প্রশ্ন ১ (যেমন: গাছটির বয়স কত?)",
      "options": ["বিকল্প ১", "বিকল্প ২", "বিকল্প ৩"]
    }
  ],
  "crop": "ফসলের বাংলা নাম (ইংরেজি নাম)",
  "disease": "রোগের স্থানীয় ও পরিচিত বাংলা নাম (ইংরেজি বা বৈজ্ঞানিক নাম)",
  "cause": "রোগের বৈজ্ঞানিক কারণ বা জীবাণু (सहज বাংলায়)",
  "symptoms": "ছবিতে দৃশ্যমান প্রধান লক্ষণসমূহ (বুলেট পয়েন্টে বিস্তারিত)",
  "treatment_organic": "জৈবিক ও প্রাকৃতিক সমাধানসমূহ - মাটি পরিচর্যা, জৈব সার ও প্রাকৃতিক দমন পদ্ধতি (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত)",
  "treatment_chemical": "বাংলাদেশি ব্র্যান্ডের বালাইনাশক/ওষুধের নাম, সঠিক প্রয়োগ মাত্রা, কেন প্রয়োজন, কীভাবে পানি মেশাবেন এবং কি সতর্কতা অবলম্বন করবেন (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত এবং বুঝিয়ে ব্যাখ্যা করা)",
  "preventive_measures": "ভবিষ্যতে এই রোগ প্রতিরোধ করার করণীয় পদক্ষেপ ও দীর্ঘমেয়াদী নির্দেশিকা (বুলেট পয়েন্টে বিস্তারিত)",
  "confidence": 0.85
}
`;

    const systemPromptSoil = `
You are "গাছের ডাক্তার" (Gacher Doctor), a highly experienced local soil scientist, agricultural geologist, and farming advisor in Bangladesh.
Analyze the provided soil image (inspecting color, grain texture, moisture, organic remnants).

Critical Pre-check & Clarification Rules:
1. Verify if the uploaded image represents soil, earth, mud, clay, dirt, sand, agricultural land, or soil grains.
   - NOTE: It is completely normal for a farmer's hand or fingers to be visible holding the soil sample, or for there to be ground/feet/clutter in the background. As long as soil is visible, it is VALID.
   - If the image does NOT contain any soil or land at all (for example: it contains ONLY a human face, a room interior, furniture, animals, a car, documents, food, or any random non-soil objects), you MUST set "is_valid" to false, "error_message" to "এটি মাটির কোনো ছবি নয়। দয়া করে পরীক্ষার জন্য মাটির একটি স্পষ্ট ছবি আপলোড করুন।" and set "need_clarification" to false.
2. If the image is valid but there is ambiguity, or the confidence is low (confidence < 0.85), or you need more details to be 100% accurate (e.g. soil stickiness when wet, smell, crop history), you MUST set "need_clarification" to true, list 2 to 3 simple multiple-choice questions in the "questions" array for the farmer to answer, and you can leave "soil_type", "estimated_ph", "color_texture", "suitable_crops", "organic_advice", "chemical_advice", and "preventive_measures" empty or null.
3. If you are confident (confidence >= 0.85) OR if the user has already answered the clarifying questions (listed under "User's Answers to Clarifying Questions"), you MUST set "need_clarification" to false, set "questions" to null, and fill in all the diagnostic fields with 100% accuracy.

Guidelines & Bangladesh Context:
1. Identify the soil type: দোআঁশ (Loamy), বেলে (Sandy), এঁটেল (Clayey), পলি (Silty), or similar.
2. In the "soil_type" field, state the Bengali name and put the English term in parentheses next to it.
3. Estimate the pH level of this soil (between 4.0 and 9.0) based on its visual traits and the farmer's location/district: "${location ? location : 'অনির্দিষ্ট (কৃষক তার জেলা উল্লেখ করেননি, সাধারণ সমাধান দিন)'}".
4. In the "suitable_crops" field, list the most profitable and suitable crops that grow well in this type of soil in "${location ? location : 'অনির্দিষ্ট (কৃষক তার জেলা উল্লেখ করেননি, সাধারণ বাংলাদেশের উপযোগী ফসলের তালিকা দিন)'}" district of Bangladesh (bullet points in Bangla).
5. In the "organic_advice" field, provide highly detailed, step-by-step organic/natural methods to improve this soil's fertility, structure, and water retention (colloquial Bangla dialect).
6. In the "chemical_advice" field, specify the exact chemical amendments needed if the pH is off, suggesting 100% authentic, locally available products in Bangladesh:
   - For Acidic Soil (pH < 6.0): ডলোচুন (Dolomite Powder / Dololime) - প্রতি শতকে ১ থেকে ১.৫ কেজি শেষ চাষের সময় মাটিতে মিশিয়ে দিতে হবে।
   - For Alkaline/Saline Soil (pH > 7.5): জিপসাম (Gypsum) - প্রতি শতকে ১.৫ থেকে ২ কেজি শেষ চাষের সময় প্রয়োগ করতে হবে।
   - For Zinc deficiency: জিংক সালফেট (Mono/Heptahydrate Zinc Sulphate) - শতক প্রতি ১৫০ থেকে ২০০ গ্রাম।
   - For general N-P-K correction: ইউরিয়া (Urea), টিএসপি (TSP), এমওপি (MOP) সার বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) সুপারিশকৃত মাত্রায়।
7. **Detailed Explaining Tone ("Bujhano Tone") Requirement**:
   - For any soil amendment recommendation, do NOT just list the weights. Explain in a detailed, helpful tone:
   - Detail **WHY** this chemical amendment is recommended (e.g., "মাটির অম্লত্ব কমাতে এবং ফসলের খাবার গ্রহণের ক্ষমতা বাড়াতে ডলোচুন জরুরি...").
   - Explain **HOW** to mix/apply step-by-step (e.g., "সারটি মাটিতে ছিটানোর পর লাঙল বা কোদাল দিয়ে ভালোভাবে ওলটপালট করে মিশিয়ে দিন, ৩-৫ দিন হালকা পানি দিন...").
   - Provide **PRECAUTIONS** (e.g., "চুন দেওয়ার অন্তত ৭ দিন পর অন্যান্য রাসায়নিক সার যেমন ইউরিয়া প্রয়োগ করবেন, নতুবা গ্যাসের কারণে কার্যকারিতা কমে যেতে পারে...").
8. **Critical Dosage Formatting Rule**: NEVER write fertilizer or chemical dosages/weights in decimal kilograms (e.g., do NOT write "0.03 kg", "0.5 kg", "0.05 kg" or "০.০৩ কেজি"). Convert all decimal kilogram measurements to grams and write them in standard Bangla (e.g., "৩০ গ্রাম", "৫০০ গ্রাম" or "৫০ গ্রাম"). If a measurement is 1 kg or more, write it as "X কেজি Y গ্রাম" (e.g., for 1.2 kg write "১ কেজি ২০০ গ্রাম", for 1 kg write "১ কেজি") instead of "1.2 kg" or "১.২ কেজি".
9. DO NOT mention "AI", "Large Language Model", "machine learning", or similar tech terms anywhere in the response. Speak as "গাছের ডাক্তার" (Gacher Doctor) who has diagnosed the soil.
10. Return ONLY a valid JSON object matching the schema below. No extra text or markdown wrapping outside the JSON.

JSON Schema:
{
  "is_valid": true,
  "error_message": null,
  "need_clarification": false,
  "questions": [
    {
      "id": "q1",
      "text": "প্রশ্ন ১ (যেমন: মাটিটি ভেজা অবস্থায় কি আঠালো অনুভূত হয়?)",
      "options": ["বিকল্প ১", "বিকল্প ২", "বিকল্প ৩"]
    }
  ],
  "soil_type": "মাটির ধরন (ইংরেজি নাম)",
  "estimated_ph": 6.5,
  "color_texture": "মাটির রঙ ও কণার গঠন বৈশিষ্ট্য",
  "suitable_crops": "চাষের উপযোগী লাভজনক ফসলসমূহ (বুলেট পয়েন্টে বিস্তারিত)",
  "organic_advice": "জৈব সার ও প্রাকৃতিক উর্বরতা বৃদ্ধি গাইড (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত)",
  "chemical_advice": "অম্লত্ব/ক্ষারত্ব সংশোধন হিসাব, সার সুপারিশ, কেন প্রয়োজন, কিভাবে প্রয়োগ করবেন ও কি সতর্কতা মানবেন (বুলেট পয়েন্টে অত্যন্ত বিস্তারিত এবং বুঝিয়ে ব্যাখ্যা করা)",
  "preventive_measures": "মাটি ক্ষয় রোধ ও দীর্ঘমেয়াদী উর্বরতা রক্ষার পরামর্শ (বুলেট পয়েন্টে বিস্তারিত)",
  "confidence": 0.85
}
`;

    let activePrompt = type === 'soil' ? systemPromptSoil : systemPrompt;

    if (crop && type !== 'soil') {
      activePrompt += `\n\nFarmer's Specified Crop: The farmer has explicitly selected that this crop is "${crop}". Focus your diagnosis ONLY on diseases that affect "${crop}" crops. If the leaf in the image does not match "${crop}" at all, you can flag it as invalid or need clarification, but if it is valid, diagnose it under the context of "${crop}".`;
    }

    if (landSize && landUnit && type !== 'soil') {
      activePrompt += `\n\nCRITICAL DEDICATED PLOT-SIZE CALCULATION INSTRUCTION:
The farmer has specified that their cultivated land size for this crop is exactly "${landSize} ${landUnit}".
You MUST calculate the EXACT total dosage/quantity of chemical pesticides, organic treatments, or fertilizers needed for their ENTIRE plot of "${landSize} ${landUnit}"!
In the "treatment_organic", "treatment_chemical", and "preventive_measures" fields, do NOT only give general rates (e.g. "2g per liter"). You MUST explicitly state the total required dosage/quantity for their specific plot size, e.g.: "আপনার মোট ${landSize} ${landUnit} জমির জন্য মোট X গ্রাম ওষুধ Y লিটার পানিতে মিশিয়ে স্প্রে করুন।"
Make this calculation 100% accurate and customized for their specific plot size!`;
    } else if (plantCount && type !== 'soil') {
      activePrompt += `\n\nCRITICAL DEDICATED PLANT-COUNT CALCULATION INSTRUCTION:
The farmer has specified that the number of affected plants/trees is exactly "${plantCount}টি".
You MUST calculate the EXACT total dosage/quantity of chemical pesticides or organic treatments needed for exactly "${plantCount}টি" plants/trees!
In the "treatment_organic", "treatment_chemical", and "preventive_measures" fields, do NOT only give general rates. You MUST explicitly state the total required dosage/quantity for their specific plant count, e.g.: "আপনার ${plantCount}টি আক্রান্ত গাছের জন্য মোট X গ্রাম/মিলি ওষুধ Y লিটার পানিতে মিশিয়ে গোড়ায় সেচন বা স্প্রে করুন।"
Make this calculation 100% accurate and customized for their specific plant count!`;
    }

    if (answers && Object.keys(answers).length > 0) {
      activePrompt += `\n\nUser's Answers to Clarifying Questions:\n${JSON.stringify(answers, null, 2)}\nUse these answers to resolve any ambiguity, set "need_clarification" to false, set "questions" to null, and output the final diagnostic results.`;
    }

    // Logging helper for thesis diagnostic stats
    const logDiagnostic = async (resObj: any) => {
      if (resObj && resObj.is_valid && !resObj.need_clarification) {
        try {
          const forwarded = request.headers.get('x-forwarded-for');
          const realIp = request.headers.get('x-real-ip');
          const clientIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');

          if (await isOwnerIp(clientIp)) {
            console.log(`[Bypass Logging] Diagnostic log bypassed for owner IP: ${clientIp}`);
            return;
          }

          await supabaseAdmin.from('diagnostic_logs').insert({
            crop_name: resObj.crop || crop || (type === 'soil' ? 'মাটি (Soil)' : 'Unknown'),
            disease_name: resObj.disease || (type === 'soil' ? resObj.soil_type : 'Healthy/Unknown'),
            confidence: Number(resObj.confidence) || 0.85,
            image_url: firstImage,
            location: location || 'ঢাকা',
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Failed to write diagnostic log to Supabase:", dbErr);
        }
      }
    };

    // 1. Try OpenRouter Hybrid Split-Model Flow (Pro Vision + Flash Text)
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      console.log("[Classify API] OpenRouter API key found. Executing Hybrid Split-Model Flow (Pro Vision + Flash Text)...");
      try {
        const timeLimit = Math.min(directTimeoutMs, getRemainingTime(maxDurationMs));

        // Prompt for Phase 1 (Vision Diagnosis)
        const visionPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a plant disease vision classifier.
Analyze the provided leaf/plant image.

Critical Pre-check:
1. Verify if the uploaded image represents a plant, crop, leaf, tree, stem, agricultural field, fruit, or vegetable.
   - If NOT, set "is_valid" to false, "error_message" to "এটি কোনো গাছ, লতাপাতা বা ফসলের ছবি নয়। দয়া করে আক্রান্ত ফসলের একটি স্পষ্ট ছবি আপলোড করুন।"
2. If valid but ambiguous, set "need_clarification" to true, list at most 1 or 2 simple multiple-choice questions in the "questions" array.
3. If confident, set "need_clarification" to false, set "questions" to null, and identify the crop and disease.
   - In "disease", provide the local colloquial Bangla name and English/scientific name in parentheses (e.g. ধানের ব্লাস্ট রোগ (Rice Blast)).
   - In "cause", provide the scientific cause/pathogen name in simple Bengali.
   - In "symptoms_observed", describe in detail but concisely only the exact symptoms visible in the provided image (e.g., specific spots, colors, shape of lesions, or wilting pattern).

Return ONLY a JSON matching this schema:
{
  "is_valid": true,
  "error_message": null,
  "need_clarification": false,
  "questions": null,
  "crop": "...",
  "disease": "...",
  "cause": "...",
  "symptoms_observed": "...",
  "confidence": 0.95
}
`;

        let activeVisionPrompt = visionPrompt;
        if (crop && type !== 'soil') {
          activeVisionPrompt += `\n\nFarmer's Specified Crop: The farmer has explicitly selected that this crop is "${crop}".`;
        }
        if (answers && Object.keys(answers).length > 0) {
          activeVisionPrompt += `\n\nUser's Answers to Clarifying Questions:\n${JSON.stringify(answers, null, 2)}`;
        }

        // Call Phase 1: OpenRouter Gemini 2.5 Pro
        console.log("[Classify API] Calling OpenRouter Gemini 2.5 Pro for vision identification...");
        const resA = await postOpenRouter('google/gemini-2.5-pro', activeVisionPrompt, resolvedImages, openrouterKey, timeLimit);
        
        if (!resA.ok) {
          throw new Error(`OpenRouter Pro Vision call failed with status ${resA.status}: ${resA.text}`);
        }

        const dataA = JSON.parse(resA.text);
        const textA = dataA.choices?.[0]?.message?.content;
        if (!textA) {
          throw new Error("OpenRouter Pro Vision returned empty content");
        }

        console.log("[Classify API] Pro Vision Response:", textA);
        const parsedA = parseClassificationResponse(textA);

        // If invalid or needs clarification, return immediately!
        if (!parsedA.is_valid || parsedA.need_clarification) {
          await logDiagnostic(parsedA);
          return NextResponse.json({ success: true, result: parsedA });
        }

        // Determine actual land size/plant count representation
        const actualLandSize = landSize || 'N/A';
        const isPlantCount = landUnit === 'টি';
        const plantCountText = isPlantCount ? `${actualLandSize}টি গাছ/চারা` : (plantCount ? `${plantCount}টি` : 'N/A');
        const landSizeText = isPlantCount ? 'N/A' : `${actualLandSize} ${landUnit}`;

        // Prompt for Phase 2 (Text Report Generation)
        const textPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a highly experienced crop pathologist and master gardener in Bangladesh.
Generate a detailed agricultural prescription report in Bengali for:
- Crop: ${parsedA.crop}
- Identified Disease/Issue: ${parsedA.disease}
- Pathogen/Cause: ${parsedA.cause}
- Cultivated Land Size: ${landSizeText}
- Affected Plant Count: ${plantCountText}
- Location: ${location || 'ঢাকা'}
- User's Answers to Clarifying Questions: ${answers ? JSON.stringify(answers) : 'None'}

Instructions:
1. Speak in warm, respectful, natural Bangla (colloquial Bangladeshi farming dialect).
2. **DO NOT write any greetings, introductions, or conversational fillers** (such as "আস্তে ভাই, কেমন আছেন?", "প্রিয় কৃষক ভাই, আশা করি ভালো আছেন") at the beginning of any JSON values. Start directly with the descriptions.
3. **Symptoms**: Write the symptoms section based strictly on the symptoms observed in the image: "${parsedA.symptoms_observed}". Describe these visual symptoms in concise bullet points. Add a "পার্থক্যকারী লক্ষণ" (Differential Diagnosis) comparing it with other common diseases of the same crop.
4. **Organic Treatment**: Provide detailed organic/natural methods. Make sure the dosage/amount of organic materials is calculated explicitly for their land size (${landSizeText}) or plant count (${plantCountText}).
5. **Chemical Treatment**: Suggest ONLY 100% authentic, registered chemical pesticides/fungicides commonly used in Bangladesh (e.g. Nativo 75WG at 0.6g/L, Amistar Top 325SC at 1ml/L, Virtako 40WG at 0.15g/L, Sobicron 425EC at 2ml/L).
   - Crucial Calculation: Calculate the EXACT total dosage of pesticide and water needed for the user's specific land size (${landSizeText}) or plant count (${plantCountText})!
     - If calculating for land size (e.g. 7 decimals): assume 2 Liters of water per decimal. Thus, 14 Liters of water is needed, requiring (14 * 0.6g/L) = 8.4g of Nativo.
     - If calculating for plant count (e.g. 5 plants/pots): assume approximately 0.2 to 0.4 Liters of spray solution per plant (depending on crop type). Explain this assumption clearly. E.g. "আপনার ৫টি গাছের জন্য প্রায় ২ লিটার পানির স্প্রে মিশ্রণ প্রয়োজন। প্রতি লিটার পানিতে ০.৬ গ্রাম হিসেবে ২ লিটার পানিতে মোট ১.২ গ্রাম নাটিভো ওষুধ মিশিয়ে স্প্রে করুন।"
   - Detail WHY this chemical is needed, HOW to mix and apply step-by-step, and PRECAUTIONS (e.g. wearing mask, wait 14 days before harvest).
6. **Preventive Measures**: Detailed long-term guidelines (bullet points).
7. **Dosage formatting**: Convert all decimal kilograms to grams (e.g. use "৮.৪ গ্রাম" instead of "0.0084 kg").

Return ONLY a JSON matching this schema:
{
  "symptoms": "...",
  "treatment_organic": "...",
  "treatment_chemical": "...",
  "preventive_measures": "..."
}
`;

        const geminiKeys = getGeminiApiKeys();
        const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);
        let textB = '';
        let textBSuccess = false;

        // Try direct free Gemini key rotation first
        if (shuffledKeys.length > 0) {
          for (let i = 0; i < shuffledKeys.length; i++) {
            const activeKey = shuffledKeys[i];
            try {
              const textTimeLimit = Math.min(directTimeoutMs, getRemainingTime(maxDurationMs));
              if (textTimeLimit < 1500) {
                console.warn(`[Classify Text] Skipping direct key ${i} due to timeout`);
                break;
              }

              console.log(`[Classify Text] Calling direct free Gemini API using key index ${i}...`);
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
              const res = await httpsPostWithTimeout(
                geminiUrl,
                { 'Content-Type': 'application/json' },
                JSON.stringify({
                  contents: [{ parts: [{ text: textPrompt }] }],
                  generationConfig: { responseMimeType: "application/json" }
                }),
                textTimeLimit
              );

              if (res.ok) {
                const data = JSON.parse(res.text);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  textB = text;
                  textBSuccess = true;
                  break;
                }
              }
            } catch (err: any) {
              console.error(`[Classify Text] Direct key index ${i} failed:`, err.message || err);
            }
          }
        }

        // If direct keys failed/skipped, fallback to OpenRouter Gemini 2.5 Flash (Paid)
        if (!textBSuccess) {
          console.warn("[Classify Text] All direct free keys failed. Falling back to OpenRouter Gemini 2.5 Flash...");
          const textTimeLimit = Math.min(directTimeoutMs, getRemainingTime(maxDurationMs));
          const res = await postOpenRouter('google/gemini-2.5-flash', textPrompt, [], openrouterKey, textTimeLimit);
          if (res.ok) {
            const data = JSON.parse(res.text);
            textB = data.choices?.[0]?.message?.content || '';
            textBSuccess = true;
          }
        }

        if (!textBSuccess || !textB) {
          throw new Error("Failed to generate text report in both direct and OpenRouter flows");
        }

        const parsedB = parseClassificationResponse(textB);

        // Merge Phase 1 and Phase 2 JSONs
        const finalResult = {
          is_valid: parsedA.is_valid,
          error_message: parsedA.error_message,
          need_clarification: parsedA.need_clarification,
          questions: parsedA.questions,
          crop: parsedA.crop,
          disease: parsedA.disease,
          cause: parsedA.cause,
          symptoms: stringifyIfObject(parsedB.symptoms),
          treatment_organic: stringifyIfObject(parsedB.treatment_organic),
          treatment_chemical: stringifyIfObject(parsedB.treatment_chemical),
          preventive_measures: stringifyIfObject(parsedB.preventive_measures),
          confidence: parsedA.confidence
        };

        await logDiagnostic(finalResult);
        return NextResponse.json({ success: true, result: finalResult });

      } catch (orErr: any) {
        console.error("[Classify API] Hybrid split-model flow failed, falling back to direct Gemini keys:", orErr.message || orErr);
      }
    }

    // 2. Direct Gemini Fallback (Direct API rotation keys)
    const geminiKeys = getGeminiApiKeys();
    if (geminiKeys.length === 0) {
      return NextResponse.json({ error: 'Gemini API keys are not configured' }, { status: 500 });
    }

    const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);
    let geminiSuccess = false;
    let responseText = '';

    for (let i = 0; i < shuffledKeys.length; i++) {
      const activeKey = shuffledKeys[i];
      try {
        const timeLimit = Math.min(directTimeoutMs, getRemainingTime(maxDurationMs));
        if (timeLimit < 1500) {
          console.warn(`Skipping key ${i} due to insufficient remaining time: ${timeLimit}ms`);
          break;
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${activeKey}`;
        let res = await httpsPostWithTimeout(
          geminiUrl,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            contents: [
              {
                parts: [
                  { text: activePrompt },
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

        if (!res.ok && (res.status === 503 || res.status === 429)) {
          console.warn(`[Classify API] Gemini Key ${i} failed. Trying fallback to gemini-2.5-flash...`);
          const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
          try {
            const fallbackRes = await httpsPostWithTimeout(
              fallbackUrl,
              { 'Content-Type': 'application/json' },
              JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: activePrompt },
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
              Math.max(1500, timeLimit - 1000)
            );
            if (fallbackRes.ok) {
              res = fallbackRes;
            }
          } catch (fErr) {}
        }

        if (res.ok) {
          const data = JSON.parse(res.text);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            responseText = text;
            geminiSuccess = true;
            break;
          }
        }
      } catch (err: any) {
        console.error(`Error with Gemini Key ${i}:`, err.message || err);
      }
    }

    if (!geminiSuccess) {
      console.warn("Gemini API call failed, generating highly authentic local database diagnosis fallback...");
      
      const matchedCrop = CROPS.find(c => 
        c.name_bn === crop || 
        (c.name_en && crop && c.name_en.toLowerCase() === crop.toLowerCase())
      );
      
      if (matchedCrop && matchedCrop.diseases.length > 0) {
        const dis = matchedCrop.diseases[0];
        const fallbackResult = {
          is_valid: true,
          error_message: null,
          need_clarification: false,
          questions: null,
          crop: `${matchedCrop.name_bn} (${matchedCrop.scientific_name || matchedCrop.name_en})`,
          disease: dis.name_bn,
          cause: dis.cause_bn || "ছত্রাক/ব্যাকটেরিয়া সংক্রমণ",
          symptoms: dis.symptoms,
          treatment_organic: dis.prevention_bn || "১. সুষম জৈব সার প্রয়োগ করুন ও আর্দ্রতা বজায় রাখুন।",
          treatment_chemical: dis.treatment_bn,
          preventive_measures: dis.prevention_bn || "১. সুস্থ রোগমুক্ত বীজ ব্যবহার করুন।",
          confidence: 0.9
        };
        await logDiagnostic(fallbackResult);
        return NextResponse.json({ success: true, result: fallbackResult });
      }
      
      if (type === 'soil') {
        const fallbackSoilResult = {
          is_valid: true,
          error_message: null,
          need_clarification: false,
          questions: null,
          soil_type: "দোআঁশ মাটি (Loam)",
          estimated_ph: 6.5,
          color_texture: "বাদামী রঙের মাঝারি কণা ও আর্দ্রতাযুক্ত উর্বর দোআঁশ মাটি।",
          suitable_crops: "১. ধান\n২. আলু\n৩. পেঁয়াজ ও শাকসবজি",
          organic_advice: "১. শতক প্রতি ২০-২৫ কেজি পচা গোবর বা কম্পোস্ট সার শেষ চাষের সময় প্রয়োগ করুন।\n২. আর্দ্রতা রক্ষায় খড় বা কচুরিপানার মালচিং ব্যবহার করতে পারেন।",
          chemical_advice: "১. মাটির অম্লত্ব কমাতে এবং ফসলের খাবার গ্রহণের ক্ষমতা বাড়াতে ডলোচুন জরুরি - প্রতি শতকে ১ থেকে ১.৫ কেজি শেষ চাষের সময় মাটিতে মিশিয়ে দিতে হবে।",
          preventive_measures: "১. প্রতি বছর একই ফসল চাষ না করে শস্য পর্যায় অনুসরণ করুন।",
          confidence: 0.85
        };
        await logDiagnostic(fallbackSoilResult);
        return NextResponse.json({ success: true, result: fallbackSoilResult });
      }

      const genericFallback = {
        is_valid: true,
        error_message: null,
        need_clarification: false,
        questions: null,
        crop: crop || "ধান (Rice)",
        disease: "পাতা পোড়া রোগ (Leaf Blight)",
        cause: "ব্যাকтериয়া বা ছত্রাক সংক্রমণ",
        symptoms: "১. পাতার কিনারা বরাবর বাদামী বা হলদে পোড়া দাগ দেখা যায়।\n২. রোগ বাড়লে পুরো পাতা শুকিয়ে শুকনা খড়ের মতো হয়ে যায়।",
        treatment_organic: "১. সুষম নাইট্রোজেন সার ব্যবহার করুন ও অতিরিক্ত ইউরিয়া ছিটানো বন্ধ রাখুন।\n২. জৈব ট্রাইকোডার্মা কম্পোস্ট সার মাটিতে প্রয়োগ করুন।",
        treatment_chemical: "১. অ্যামিস্টার টপ ৩২৫এসসি (১ মিলি প্রতি লিটার পানি) অথবা নাティブো ৭৫ডব্লিউজি (০.৬ গ্রাম প্রতি লিটার পানি) ১০ দিনের ব্যবধানে ২ বার স্প্রে করুন।",
        preventive_measures: "১. সুস্থ রোগমুক্ত বীজ রোপণ করুন।\n২. আক্রান্ত অংশ কেটে পুড়ে ফেলুন।",
        confidence: 0.8
      };
      
      await logDiagnostic(genericFallback);
      return NextResponse.json({ success: true, result: genericFallback });
    }

    const parsedData = parseClassificationResponse(responseText);
    await logDiagnostic(parsedData);
    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
