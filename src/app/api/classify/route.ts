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

function parseClassificationResponse(text: string): any {
  const cleaned = cleanJSONString(text);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
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
    const match = cleaned.match(new RegExp(`"${field}"\\s*:\\s*([0-9.]+)`));
    return match ? parseFloat(match[1]) : defaultVal;
  };

  const extractFieldArray = (field: string): any[] | null => {
    const match = cleaned.match(new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)\\]`));
    if (!match) return null;
    const arrayStr = match[1];
    
    if (field === 'questions') {
      try {
        return JSON.parse(`[${arrayStr}]`);
      } catch {
        const questions: any[] = [];
        const objRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"text"\s*:\s*"([^"]+)"\s*,\s*"options"\s*:\s*\[([^\]]*)\]\s*\}/g;
        let m;
        while ((m = objRegex.exec(arrayStr)) !== null) {
          const id = m[1];
          const text = m[2];
          const optionsStr = m[3];
          const options: string[] = [];
          const optRegex = /"([^"]+)"|'([^']+)'/g;
          let optMatch;
          while ((optMatch = optRegex.exec(optionsStr)) !== null) {
            options.push(optMatch[1] || optMatch[2]);
          }
          questions.push({ id, text, options });
        }
        return questions.length > 0 ? questions : null;
      }
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

export async function POST(request: Request) {
  const startTime = Date.now();
  const getRemainingTime = (maxDurationMs: number) => {
    const elapsed = Date.now() - startTime;
    return Math.max(1000, maxDurationMs - elapsed);
  };

  try {
    const { image, type = 'leaf', location = 'ঢাকা', answers, crop } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Extract raw base64 data and mimeType from data URL securely without regex ReDoS risk
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.startsWith('data:')) {
      const semiIndex = image.indexOf(';');
      if (semiIndex !== -1) {
        mimeType = image.substring(5, semiIndex);
      }
      const base64Index = image.indexOf(';base64,');
      if (base64Index !== -1) {
        base64Data = image.substring(base64Index + 8);
      }
    }

    const systemPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a highly experienced local crop pathologist, master gardener, and plant disease expert in Bangladesh.
Analyze the provided leaf/plant image.

Critical Pre-check & Clarification Rules:
1. Verify if the uploaded image represents a plant, crop, leaf, tree, stem, agricultural field, fruit, or vegetable.
   - NOTE: It is completely normal for a farmer's hand or fingers to be visible holding the leaf/fruit, or for there to be soil/ground/feet in the background. As long as a plant/crop is visible, it is VALID.
   - If the image does NOT contain any plants, leaves, crops, or agricultural fields at all (for example: it contains ONLY a human face, a room interior, furniture, animals, a car, text documents, or any random non-plant objects), you MUST set "is_valid" to false, "error_message" to "এটি কোনো গাছ, লতাপাতা বা ফসলের ছবি নয়। দয়া করে আক্রান্ত ফসলের একটি স্পষ্ট ছবি আপলোড করুন।" and set "need_clarification" to false.
2. If the image is valid but there is ambiguity, or the confidence is low (confidence < 0.85), or you need more details to be 100% accurate (e.g. crop age, water level, symptoms on other parts), you MUST set "need_clarification" to true, list 2 to 3 simple multiple-choice questions in the "questions" array for the farmer to answer, and you can leave "crop", "disease", "cause", "symptoms", "treatment_organic", "treatment_chemical", and "preventive_measures" empty or null.
3. If you are confident (confidence >= 0.85) OR if the user has already answered the clarifying questions (listed under "User's Answers to Clarifying Questions"), you MUST set "need_clarification" to false, set "questions" to null, and fill in all the diagnostic fields with 100% accuracy.

Guidelines & Bangladesh Context:
1. Identify the crop and the disease affecting it.
2. In the "disease" field, provide the local, colloquial Bangla name that Bangladeshi farmers actually use and recognize (e.g., ধানের ব্লাস্ট, পাতা পোড়া, টুংরো, আলু/টমেটোর নাবি ধসা, বেগুন বা মরিচের ডগা ও ফল ছিদ্রকারী পোকা, পাতা কোঁকড়ানো রোগ, গোড়া পচা ইত্যাদি) and put the English or scientific name in parentheses next to it.
3. Provide extremely detailed, section-by-section explanations and solutions in warm, friendly, natural Bangla (colloquial Bangladeshi farming dialect). Avoid academic jargon.
4. DO NOT mention "AI", "Large Language Model", "machine learning", or similar tech terms anywhere in the response. Speak as "গাছের ডাক্তার" (Gacher Doctor) who has diagnosed the plant.
5. In the "treatment_chemical" field, suggest ONLY 100% authentic, registered chemical pesticides/fungicides commonly used and widely available in Bangladeshi local markets. Use actual brand names and details:
   - For Rice Blast/Leaf Spot: নাটিভো ৭৫ডব্লিউজি (Nativo 75WG - ০.৬ গ্রাম প্রতি লিটার পানি) or অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি)।
   - For Sheath Blight/Dieback: অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি) or কন্টাফ ৫ইসি (Contaf 5EC - ২ মিলি প্রতি লিটার পানি)।
   - For Potato/Tomato Late Blight: রিডোমিল গোল্ড ৬৮ডব্লিউজি (Ridomil Gold 68WG - ২ গ্রাম প্রতি লিটার পানি) or ডাইথেন এম-৪৫ (Dithane M-45 - ২ গ্রাম প্রতি লিটার পানি)।
   - For Borers/Caterpillars (মাজরা পোকা / ডগা ও ফল ছিদ্রকারী পোকা): ভার্টাকো ৪০ডব্লিউজি (Virtako 40WG - ০.১৫ গ্রাম প্রতি লিটার পানি) or সবিক্রন ৪২৫ইসি (Sobicron 425EC - ২ মিলি প্রতি লিটার পানি) or প্রোক্লেম ৫এসজি (Proclaim 5SG - ১ গ্রাম প্রতি লিটার পানি)।
   - For Sucking Insects/Leaf Curl (জাব পোকা / সাদা মাছি / থ্রিপস / পাতা কোঁকড়ানো রোগ): অ্যাডমায়ার ২০০এসএল (Admire 200SL - ০.৫ মিলি প্রতি লিটার পানি) or টিডো ২০০এসএল (Tido 200SL - ০.৫ মিলি প্রতি লিটার পানি)।
   - For Red Spider Mites (লাল মাকড়): ভার্টিমেক ১.৮ইসি (Vertimec 1.8EC - ১.২ মিলি প্রতি লিটার পানি)।
   - For Root Rot/Foot Rot: অটোস্টিন ৫০ডব্লিউডিজি (Autostin 50WDG - ২ গ্রাম প্রতি লিটার পানি) or কমপ্যানিয়ন (Companion - ২ গ্রাম প্রতি লিটার পানি) মাটির গোড়ায় স্প্রে বা সেচন।
6. **Detailed Explaining Tone ("Bujhano Tone") Requirement**:
   - For any chemical suggestion, do NOT just write the pesticide name and dose. You MUST write in a detailed, handbook-style explaining tone.
   - Detail **WHY** this chemical is needed (e.g., "এই বালাইনাশকটি আক্রান্ত ছত্রাককে দ্রুত দমন করবে এবং সুস্থ অংশকে সংক্রমণ থেকে বাঁচাবে...").
   - Explain **HOW** to mix and apply step-by-step (e.g., "প্রথমে ১০ লিটার পরিষ্কার পানি একটি বালতি বা ডোপে নিন, সেখানে ৬ গ্রাম নাটিভো ওষুধ দিয়ে ভালোভাবে লাঠি দিয়ে নেড়ে গুলিয়ে নিন। এরপর বিকেলের দিকে রোদের তীব্রতা কমে গেলে পুরো গাছে ভালো করে স্প্রে করুন...").
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
  "cause": "রোগের বৈজ্ঞানিক কারণ বা জীবাণু (সহজ বাংলায়)",
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
3. Estimate the pH level of this soil (between 4.0 and 9.0) based on its visual traits and the farmer's location/district: "${location}".
4. In the "suitable_crops" field, list the most profitable and suitable crops that grow well in this type of soil in "${location}" district of Bangladesh (bullet points in Bangla).
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

    if (answers && Object.keys(answers).length > 0) {
      activePrompt += `\n\nUser's Answers to Clarifying Questions:\n${JSON.stringify(answers, null, 2)}\nUse these answers to resolve any ambiguity, set "need_clarification" to false, set "questions" to null, and output the final diagnostic results.`;
    }

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

    const parsedData = parseClassificationResponse(responseText);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
