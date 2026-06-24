import { NextResponse } from 'next/server';
import { CROPS, KNOWLEDGE_SNIPPETS } from '../data';
import https from 'https';
import { URL } from 'url';
import dns from 'dns';
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

function httpsPostWithTimeout(urlStr: string, headers: Record<string, string>, bodyStr: string, timeoutMs: number): Promise<{ ok: boolean; status: number; text: string }> {
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

async function postWithTimeout(urlStr: string, headers: Record<string, string>, bodyStr: string, timeoutMs: number): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await fetch(urlStr, {
      method: 'POST',
      headers: headers,
      body: bodyStr,
      signal: AbortSignal.timeout(timeoutMs)
    });
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      text: text
    };
  } catch (err: any) {
    throw err;
  }
}

function retrieveLocalContext(query: string) {
  const contextParts: string[] = [];
  const sources: string[] = [];

  // Find crop mentions in query
  const crop = CROPS.find(c => 
    query.includes(c.name_bn) || 
    (c.name_en && query.toLowerCase().includes(c.name_en.toLowerCase()))
  );

  if (crop) {
    contextParts.push(
      `ফসল: ${crop.name_bn} (${crop.scientific_name}). ` +
      `শ্রেণী: ${crop.category}. পানির চাহিদা: ${crop.water_requirement}. ` +
      `গড় ফলন: ${crop.yield_avg} টন/হেক্টর. গড় লাভ: ${crop.profit_avg} টাকা/বিঘা.`
    );
    sources.push("গাছের ডাক্তার তথ্যশালা");

    // Add fertilizers
    crop.fertilizers.forEach(f => {
      contextParts.push(
        `${crop.name_bn} সারের সুপারিশ (${f.season} মৌসুম - ${f.source_org}): ` +
        `ইউরিয়া: ${f.urea} কেজি/বিঘা, টিএসপি: ${f.tsp} কেজি/বিঘা, ` +
        `এমওপি: ${f.mop} কেজি/বিঘা, জিপসাম: ${f.gypsum} কেজি/বিgha, দস্তা: ${f.zinc} কেজি/বিঘা.`
      );
      sources.push(`${f.source_org} নির্দেশিকা`);
    });

    // Add diseases if matched
    let matchedCount = 0;
    crop.diseases.forEach(d => {
      const match = d.name_bn.split(' ').some(w => w.length > 2 && query.includes(w)) || 
                    d.symptoms.split(' ').some(w => w.length > 2 && query.includes(w));
      if (match) {
        contextParts.push(
          `রোগবালাই: ${d.name_bn}. লক্ষণ: ${d.symptoms}. কারণ: ${d.cause_bn}. ` +
          `প্রতিকার ও সমাধান: ${d.treatment_bn}. প্রতিরোধমূলক ব্যবস্থা: ${d.prevention_bn}.`
        );
        sources.push(`${d.source_org} রোগ গাইড`);
        matchedCount++;
      }
    });

    // If no specific diseases matched, or if it is a general crop disease query,
    // inject all diseases of this crop into context so the LLM can answer completely.
    const isGeneralDiseaseQuery = query.includes('রোগ') || query.includes('পোকা') || query.includes('সমস্যা') || 
                                  query.includes('লক্ষণ') || query.includes('কী কী') || query.includes('কীভাবে') || 
                                  query.includes('তালিকা') || query.includes('চিকিৎসা') || query.includes('প্রতিকার');
    if (matchedCount === 0 || isGeneralDiseaseQuery) {
      crop.diseases.forEach(d => {
        const alreadyAdded = contextParts.some(p => p.includes(`রোগবালাই: ${d.name_bn}`));
        if (!alreadyAdded) {
          contextParts.push(
            `রোগবালাই: ${d.name_bn}. লক্ষণ: ${d.symptoms}. কারণ: ${d.cause_bn}. ` +
            `প্রতিকার ও সমাধান: ${d.treatment_bn}. প্রতিরোধমূলক ব্যবস্থা: ${d.prevention_bn}.`
          );
          sources.push(`${d.source_org} রোগ গাইড`);
        }
      });
    }
  }

  // Keywords search in general snippets
  const words = query.split(/\s+/).filter(w => w.length > 2);
  const matchedSnippets = KNOWLEDGE_SNIPPETS.map(snippet => {
    let score = 0;
    words.forEach(word => {
      if (snippet.includes(word)) score++;
    });
    return { score, snippet };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.snippet);

  matchedSnippets.slice(0, 2).forEach(snippet => {
    contextParts.push(snippet);
    sources.push("BRRI চাষ পদ্ধতি নির্দেশিকা");
  });

  return {
    context: contextParts.join('\n\n'),
    sources: Array.from(new Set(sources))
  };
}

function cleanJSONString(str: string): string {
  // Strip markdown code block wraps like ```json ... ```
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function parseLLMResponse(text: string, dbSources: string[] = []): any {
  const cleaned = cleanJSONString(text);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      parsed.sources = Array.from(new Set([...(parsed.sources || []), ...dbSources]));
      return parsed;
    }
  } catch (e) {
    console.error("JSON.parse failed on LLM response, attempting regex fallback:", e);
  }

  // Regex fallback: try to extract answer_bn, sources, confidence, follow_up_questions
  const answerMatch = cleaned.match(/"answer_bn"\s*:\s*"((?:[^"\\]|\\.|[\r\n])*)"/) || 
                      cleaned.match(/"answer_bn"\s*:\s*'((?:[^'\\]|\\.|[\r\n])*)'/);
  
  let answer_bn = "";
  if (answerMatch) {
    try {
      answer_bn = JSON.parse(`"${answerMatch[1]}"`);
    } catch {
      answer_bn = answerMatch[1];
    }
  } else {
    // If no answer_bn field matches, use the whole cleaned text as the answer!
    answer_bn = cleaned
      .replace(/^[{\s]*/, '')
      .replace(/[}\s]*$/, '')
      .replace(/"answer_bn"\s*:\s*/, '')
      .trim();
  }

  // Extract sources
  const sourcesMatch = cleaned.match(/"sources"\s*:\s*\[([^\]]*)\]/);
  const sources: string[] = [...dbSources];
  if (sourcesMatch) {
    const srcStr = sourcesMatch[1];
    const srcRegex = /"([^"]+)"|'([^']+)'/g;
    let m;
    while ((m = srcRegex.exec(srcStr)) !== null) {
      sources.push(m[1] || m[2]);
    }
  }

  // Extract follow_up_questions
  const followUpMatch = cleaned.match(/"follow_up_questions"\s*:\s*\[([^\]]*)\]/);
  const follow_up_questions: string[] = [];
  if (followUpMatch) {
    const qStr = followUpMatch[1];
    const qRegex = /"([^"]+)"|'([^']+)'/g;
    let m;
    while ((m = qRegex.exec(qStr)) !== null) {
      follow_up_questions.push(m[1] || m[2]);
    }
  }

  // Extract confidence
  const confidenceMatch = cleaned.match(/"confidence"\s*:\s*([0-9.]+)/);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.9;

  return {
    answer_bn: answer_bn || text,
    sources: Array.from(new Set(sources)),
    confidence,
    follow_up_questions,
    action_suggestions: []
  };
}

export async function POST(request: Request) {
  const security = await checkSecurity(request, 'chat');
  if (security.blocked && security.response) {
    return security.response;
  }

  const startTime = Date.now();
  const getRemainingTime = (maxDurationMs: number) => {
    const elapsed = Date.now() - startTime;
    return Math.max(1000, maxDurationMs - elapsed);
  };

  try {
    const { query, history = [], district, season = "বোরো", image } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Security Check: Restrict user query length to prevent DoS/overflow attacks
    if (query.length > 2000) {
      return NextResponse.json(
        { error: 'আপনার প্রশ্নটি অনেক দীর্ঘ। দয়া করে ২০০০ অক্ষরের মধ্যে আপনার প্রশ্নটি সংক্ষেপ করুন।' },
        { status: 400 }
      );
    }

    const { context, sources: dbSources } = retrieveLocalContext(query);

    const systemPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a friendly, respectful, and highly experienced crop physician, master gardener, and agricultural expert in Bangladesh. 
Your goal is to help local farmers solve crop cultivation, fertilizer, pest, disease, and weather problems.

IMPORTANT: Do NOT refer to yourself as an AI, chatbot, or assistant. Speak as a wise, caring agricultural doctor or expert who is explaining things in a friendly, handbook-style, educational tone. Address the farmer with warmth and respect as "প্রিয় কৃষক ভাই".

CRITICAL TONE RULES:
1. ALWAYS address the farmer as "প্রিয় কৃষক ভাই" (e.g. at the beginning of the reply or naturally in the opening paragraph) in every single response. Ensure that you write using the highly respectful, humble, and polite pronoun "আপনি" (apni) and its corresponding verb inflections when speaking to the farmer (e.g., "করবেন", "বলুন", "আপনার" instead of "করবে", "বলো", "তোমার"). Keep a humble, respectful, human-like, and highly conversational tone.
2. If the user's query is very short, incomplete, or ambiguous (e.g. "আলুর রোগ", "কী ওষুধ দেব?"), do NOT give a generic or random dump of answers. Instead, ask exactly 1 or 2 warm, highly dedicated clarifying questions first (such as asking for crop age, specific symptoms on leaves/fruit, or water levels) to understand their exact scenario before giving the perfect, dedicated prescription!

RULES & BANGLADESH CONTEXT:
1. ALWAYS write in natural, conversational, and clear Bangla. Speak like a friendly crop doctor advising a farmer. Keep your response concise but extremely helpful, structured, and informative.
2. Ground your advice primarily in the provided Context if it contains relevant details. If the Context does NOT contain specific information, use your own extensive, expert agricultural knowledge (specifically aligning with BRRI, BARI, and standard Bangladeshi agricultural guidelines) to give a quick, accurate, and helpful response.
3. Suggest ONLY 100% authentic, registered chemical pesticides/fungicides/soil amendments commonly used and widely available in Bangladeshi local markets. Use actual brand names and details:
   - For Rice Blast/Leaf Spot: নাティブো ৭৫ডব্লিউজি (Nativo 75WG - ০.৬ গ্রাম প্রতি লিটার পানি) or অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি)।
   - For Sheath Blight/Dieback: অ্যামিস্টার টপ ৩২৫এসসি (Amistar Top 325SC - ১ মিলি প্রতি লিটার পানি) or কন্টাফ ৫ইসি (Contaf 5EC - ২ মিলি প্রতি লিটার পানি)।
   - For Potato/Tomato Late Blight: রিডোমিল গোল্ড ৬৮ডব্লিউজি (Ridomil Gold 68WG - ২ গ্রাম প্রতি লিটার পানি) or ডাইথেন এম-৪৫ (Dithane M-45 - ২ গ্রাম প্রতি লিটার পানি)।
   - For Borers/Caterpillars (মাজরা পোকা / ডগা ও ফল ছিদ্রকারী পোকা): ভার্টাকো ৪০ডব্লিউজি (Virtako 40WG - ০.১৫ গ্রাম প্রতি লিটার পানি) or সবিক্রন ৪২৫ইসি (Sobicron 425EC - ২ মিলি প্রতি লিটার পানি) or প্রোক্লেম ৫এসজি (Proclaim 5SG - ১ গ্রাম প্রতি লিটার পানি)।
   - For Sucking Insects/Leaf Curl (জাব পোকা / সাদা মাছি / থ্রিপস / পাতা কোঁকড়ানো রোগ): অ্যাডমায়ার ২০০এসএল (Admire 200SL - ০.৫ মিলি প্রতি লিটার পানি) or টিডো ২০০এসএল (Tido 200SL - ০.৫ মিলি প্রতি লিটার পানি)।
   - For Red Spider Mites (লাল মাকড়): ভার্টিমেক ১.৮ইসি (Vertimec 1.8EC - ১.২ মিলি প্রতি লিটার পানি)।
   - For Acidic Soil (pH < 6.0): ডলোচুন (Dolomite Powder / Dololime) - প্রতি শতকে ১ থেকে ১.৫ কেজি মাটির শেষ চাষে।
   - For Alkaline/Saline Soil (pH > 7.5): জিপসাম (Gypsum) - প্রতি শতকে ১.৫ থেকে ২ কেজি শেষ চাষে।
4. **Detailed Explaining Tone ("Bujhano Tone") Requirement**:
   - For any treatment or chemical/fertilizer suggested, explain in detail:
     - **WHY** it is needed (e.g., "ধানের ব্লাস্ট রোগ দমনের জন্য নাティブো খুবই কার্যকরী, এটি ছত্রাকের বিস্তার রোধ করে...").
     - **HOW** to mix/apply step-by-step (e.g., "১ লিটার পানিতে ০.৬ গ্রাম (অথবা ১০ লিটার পানির ডোপে ৬ গ্রাম) নাティブো ভালোভাবে মিশিয়ে নিয়ে বিকেলের রোদে স্প্রে করতে হবে...").
     - **PRECAUTIONS** (e.g., "স্প্রে করার সময় সতর্কতা অবলম্বন করুন, মুখে মাস্ক পরবেন এবং বালাইনাশক ব্যবহারের পর ১৪ দিন পর্যন্ত ফসল সংগ্রহ করবেন না...").
5. Critical Dosage Formatting Rule: NEVER write fertilizer, seed, or chemical dosages/weights in decimal kilograms (e.g., do NOT write "0.03 kg", "0.5 kg", "0.05 kg" or "০.০৩ কেজি"). Convert all decimal kilogram measurements to grams and write them in standard Bangla (e.g., "৩০ গ্রাম", "৫০০ গ্রাম", "৫০ গ্রাম"). If a measurement is 1 kg or more, write it as "X কেজি Y গ্রাম" (e.g., for 1.2 kg write "১ কেজি ২০০ গ্রাম", for 1 kg write "১ কেজি") instead of "1.2 kg" or "১.২ কেজি".
6. Context & Flow Retention Rules (Stateful Chat):
   - You will receive the previous conversation history in the "contents" list. Read it carefully.
   - Pay close attention to context. If the farmer's current query is very short, incomplete, or refers to a previous topic (e.g., "১৫ বছরের" or "কী সার দেব?" or "ওটার জন্য কী সমাধান?"), identify what crop or problem they are referring to from the history (e.g., the 15-year-old coconut tree from the previous question).
   - Never respond as if the short message is a new, isolated query. Respond directly to the topic (e.g., "আপনার ১৫ বছরের নারিকেল গাছটির জন্য নিচে সার ও পরিচর্যার বিবরণ দেওয়া হলো: ...").
   - If there is ambiguity or you need more details to give an authentic dose (e.g. crop symptoms, soil type), ask exactly 1 or 2 clear, warm, contextually related follow-up questions to help them diagnose it.
7. Provide response ONLY in JSON format matching the following schema. No extra text outside JSON. All clarifying, follow-up, soil type, or location questions must be written at the end of the "answer_bn" main reply text in a beautifully bold and bulleted list format. The "follow_up_questions" JSON array must ALWAYS be empty.

JSON Schema:
{
  "answer_bn": "The primary response in warm conversational Bangla. Explain details like a handbook. Detail the brand, why it is used, how to mix/apply it, and precautions using clear paragraphs or bullet points. If you have any clarifying, soil, or location questions, you MUST write them at the very end of this text in a beautiful bold and bulleted list format.",
  "sources": ["List of sources cited (e.g. BRRI, BARI, or গাছের ডাক্তার তথ্যশালা)"],
  "confidence": 0.95,
  "follow_up_questions": [],
  "action_suggestions": [
     {"label": "সারের পরিমাপ হিসাব", "action": "open_fertilizer_calc", "params": {"crop": "ধান"}}
  ]
}
`;

    const userPrompt = `
চাষীর প্রশ্ন: "${query}"
${district ? `বর্তমান জেলা: ${district}` : 'বর্তমান জেলা: অনির্দিষ্ট (কৃষক তার জেলা উল্লেখ করেননি, সাধারণ সমাধান দিন। কিন্তু যদি মাটি বা জেলা-নির্দিষ্ট আবহাওয়া ও ফসল নির্বাচনের মতো কোনো লোকেশন-নির্ভর সমস্যা হয়, তবে উত্তর লেখার শেষভাগে সুন্দর করে কৃষকের কাছে তার জেলা জানতে চেয়ে প্রশ্ন করবেন)'}
ঋতু: ${season}

কৃষি সম্পর্কিত তথ্য (Context):
${context || 'No specific crop matching the query.'}
`;

    // Map history to Gemini API format
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: { sender: 'user' | 'bot'; text: string }) => {
        contents.push({
          role: turn.sender === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      });
    }
    // Append the latest user query with optional attached image
    const latestParts: any[] = [{ text: userPrompt }];
    if (image) {
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
      latestParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    contents.push({
      role: 'user',
      parts: latestParts
    });

    const geminiKeys = getGeminiApiKeys();
    const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);

    let llmSuccess = false;
    let geminiSuccess = false;
    let geminiError = '';
    let responseText = '';
    let usedKeyIndex = -1;
    let usedLlmProvider = '';

    const isImageQuery = !!image;

    // 1. Try MiMoAPI if configured (for text/voice queries)
    if (!isImageQuery && process.env.MIMO_API_KEY) {
      try {
        const mimoUrl = (process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1').trim().replace(/\/$/, '') + '/chat/completions';
        const mimoKey = process.env.MIMO_API_KEY.trim();
        const mimoModel = (process.env.MIMO_API_MODEL || 'mimo-v2.5').trim();

        console.log(`[Chat API] Routing text-only query to MiMoAPI using model: ${mimoModel}`);

        const messages = [{ role: 'system', content: systemPrompt }];
        if (history && Array.isArray(history)) {
          history.forEach((turn: { sender: 'user' | 'bot'; text: string }) => {
            messages.push({
              role: turn.sender === 'user' ? 'user' : 'assistant',
              content: turn.text
            });
          });
        }
        messages.push({ role: 'user', content: userPrompt });

        const timeLimit = Math.min(8000, getRemainingTime(25000));
        const res = await postWithTimeout(
          mimoUrl,
          {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mimoKey}`
          },
          JSON.stringify({
            model: mimoModel,
            messages: messages,
            response_format: { type: "json_object" }
          }),
          timeLimit
        );

        if (res.ok) {
          const data = JSON.parse(res.text);
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            responseText = text;
            llmSuccess = true;
            usedLlmProvider = 'MiMoAPI';
          }
        } else {
          console.error(`[Chat API] MiMoAPI failed with status ${res.status}: ${res.text}`);
        }
      } catch (err: any) {
        console.error(`[Chat API] MiMoAPI call failed:`, err.message);
      }
    }

    if (!isImageQuery && !llmSuccess) {
      // Try FreeLLMAPI first for text/voice queries
      try {
        const freeLlmUrl = (process.env.FREE_LLM_API_URL || process.env.NEXT_PUBLIC_FREELLM_API_URL || 'https://freellmapi.onrender.com/v1').trim().replace(/\/$/, '') + '/chat/completions';
        const freeLlmKey = (process.env.FREE_LLM_API_KEY || process.env.NEXT_PUBLIC_FREELLM_API_KEY || 'freellmapi-d5c6db74de65d76f3a7ac1b1d0b6ba6aa2c1df6716faa9d2').trim();
        const freeLlmModel = (process.env.FREE_LLM_MODEL || 'gemini-3.5-flash').trim();

        console.log(`[Chat API] Routing text-only query to FreeLLMAPI using model: ${freeLlmModel}`);

        const messages = [{ role: 'system', content: systemPrompt }];
        if (history && Array.isArray(history)) {
          history.forEach((turn: { sender: 'user' | 'bot'; text: string }) => {
            messages.push({
              role: turn.sender === 'user' ? 'user' : 'assistant',
              content: turn.text
            });
          });
        }
        messages.push({ role: 'user', content: userPrompt });

        const timeLimit = Math.min(2000, getRemainingTime(25000));
        const res = await postWithTimeout(
          freeLlmUrl,
          {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freeLlmKey}`
          },
          JSON.stringify({
            model: freeLlmModel,
            messages: messages,
            response_format: { type: "json_object" }
          }),
          timeLimit
        );

        if (res.ok) {
          const data = JSON.parse(res.text);
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            responseText = text;
            llmSuccess = true;
            usedLlmProvider = 'FreeLLMAPI';
          }
        } else {
          console.error(`[Chat API] FreeLLMAPI failed with status ${res.status}: ${res.text}`);
        }
      } catch (err: any) {
        console.error(`[Chat API] FreeLLMAPI call failed:`, err.message);
      }
    }

    // Fallback to direct Gemini API if FreeLLMAPI failed/skipped or if it is an image query
    if (!llmSuccess) {
      console.log(`[Chat API] Routing to direct Gemini API (Reason: ${isImageQuery ? 'Image query' : 'FreeLLMAPI failed/skipped'})`);

      for (let i = 0; i < shuffledKeys.length; i++) {
        const activeKey = shuffledKeys[i];
        try {
          const timeLimit = Math.min(25000, getRemainingTime(45000));
          if (timeLimit < 1000) {
            console.warn(`Skipping key ${i} due to insufficient remaining time: ${timeLimit}ms`);
            break;
          }

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
          const res = await postWithTimeout(
            geminiUrl,
            { 'Content-Type': 'application/json' },
            JSON.stringify({
              contents: contents,
              systemInstruction: {
                parts: [
                  { text: systemPrompt }
                ]
              },
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 4000
              }
            }),
            timeLimit
          );

          if (res.ok) {
            const data = JSON.parse(res.text);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              responseText = text;
              llmSuccess = true;
              usedKeyIndex = i;
              usedLlmProvider = 'GeminiDirect';
              break;
            }
          } else {
            geminiError += `[Key ${i} failed: Status ${res.status}] `;
            console.error(`Gemini API key ${i} returned status ${res.status}: ${res.text}`);
          }
        } catch (err: any) {
          geminiError += `[Key ${i} error: ${err.message}] `;
          console.error(`Gemini API key ${i} call failed:`, err.message);
        }
      }
    }

    geminiSuccess = llmSuccess;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const logChatEvent = async (ansText: string) => {
      try {
        if (await isOwnerIp(clientIp)) {
          console.log(`[Bypass Logging] Chat event logging bypassed for owner IP: ${clientIp}`);
          return;
        }
        await supabaseAdmin.from('usage_analytics').insert({
          session_id: 'chat_session_' + (district || 'general'),
          user_agent: userAgent,
          ip_address: clientIp,
          location: district || 'ঢাকা',
          page_visited: '/chat',
          action: 'chat',
          metadata: {
            query: query,
            response: ansText,
            image: image || null
          },
          created_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.error("Failed to log chat to analytics:", dbErr);
      }
    };

    if (geminiSuccess && responseText) {
      const parsed = parseLLMResponse(responseText, dbSources);
      await logChatEvent(parsed.answer_bn);
      return NextResponse.json(parsed);
    }

    // 2. Fallback error response if Gemini fails or times out
    const dbFallbackText = context 
      ? `কৃষক ভাই, দুঃখিত যে সার্ভার বা নেটওয়ার্ক সমস্যার কারণে আমি সরাসরি লাইভ সেবা দিয়ে আপনাকে সম্পূর্ণ পরামর্শ দিতে পারছি না। তবে আমার গাছের ডাক্তার তথ্যশালা অনুযায়ী আপনার প্রশ্নের প্রাসঙ্গিক তথ্য নিচে দেওয়া হলো:\n\n${context}\n\nঅনুগ্রহ করে বিস্তারিত ও জরুরি পরামর্শের জন্য আপনার নিকটস্থ উপজেলা কৃষি অফিসে যোগাযোগ করুন।`
      : 'কৃষক ভাই, দুঃখিত যে সার্ভার বা নেটওয়ার্ক সমস্যার কারণে গাছের ডাক্তারের লাইভ সেবা এই মুহূর্তে সাময়িকভাবে বন্ধ রয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে কিছুক্ষণ পর আবার চেষ্টা করুন।';

    await logChatEvent(dbFallbackText);
    return NextResponse.json({
      answer_bn: dbFallbackText,
      sources: dbSources.length > 0 ? dbSources : ["গাছের ডাক্তার তথ্যশালা"],
      confidence: 0.7,
      follow_up_questions: ["কীভাবে সারের সঠিক ব্যবহার নিশ্চিত করব?", "নিকটস্থ উপজেলা কৃষি অফিস কোথায় পাবো?"],
      action_suggestions: [
        { "label": "সারের পরিমাপ হিসাব", "action": "open_fertilizer_calc", "params": { "crop": "ধান" } }
      ],
      debug: {
        hasGeminiKeys: geminiKeys.length > 0,
        keysCount: geminiKeys.length,
        usedKeyIndex,
        geminiError: geminiError || 'Keys not provided or all failed'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
