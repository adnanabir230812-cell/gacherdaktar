import { NextResponse } from 'next/server';
import { CROPS, KNOWLEDGE_SNIPPETS } from '../data';
import https from 'https';
import { URL } from 'url';
import dns from 'dns';

if (process.platform === 'win32' && process.env.NODE_ENV === 'development') {
  dns.setDefaultResultOrder('ipv4first');
}

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
  const isWindowsDev = process.platform === 'win32' && process.env.NODE_ENV === 'development';
  if (isWindowsDev) {
    return httpsPostWithTimeout(urlStr, headers, bodyStr, timeoutMs);
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(urlStr, {
        method: 'POST',
        headers: headers,
        body: bodyStr,
        signal: controller.signal
      });
      clearTimeout(id);
      const text = await res.text();
      return {
        ok: res.ok,
        status: res.status,
        text: text
      };
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
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
    crop.diseases.forEach(d => {
      const match = d.name_bn.split(' ').some(w => w.length > 2 && query.includes(w)) || 
                    d.symptoms.split(' ').some(w => w.length > 2 && query.includes(w));
      if (match) {
        contextParts.push(
          `রোগবালাই: ${d.name_bn}. লক্ষণ: ${d.symptoms}. কারণ: ${d.cause_bn}. ` +
          `প্রতিকার ও সমাধান: ${d.treatment_bn}. প্রতিরোধমূলক ব্যবস্থা: ${d.prevention_bn}.`
        );
        sources.push(`${d.source_org} রোগ গাইড`);
      }
    });
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
  const startTime = Date.now();
  const getRemainingTime = (maxDurationMs: number) => {
    const elapsed = Date.now() - startTime;
    return Math.max(1000, maxDurationMs - elapsed);
  };

  try {
    const { query, district = "ঢাকা", season = "বোরো" } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const { context, sources: dbSources } = retrieveLocalContext(query);

    const systemPrompt = `
You are "গাছের ডাক্তার" (Gacher Doctor), a friendly, respectful, and highly experienced crop physician and agricultural expert in Bangladesh. 
Your goal is to help local farmers solve crop cultivation, fertilizer, disease, and weather problems.

IMPORTANT: Do NOT refer to yourself as an AI, chatbot, or assistant. Speak as a wise, caring agricultural doctor or expert who is explaining things in a friendly, book-like, educational tone. Address the farmer with warmth.

RULES:
1. ALWAYS write in natural, conversational, and explaining Bangla. Speak like a friendly crop doctor advising a farmer. Use literary, detailed descriptions.
2. Ground your advice primarily in the provided Context if it contains relevant details. If the Context does NOT contain specific information for the user's query, use your own extensive, expert agricultural knowledge (specifically aligning with BRRI, BARI, and standard Bangladeshi agricultural guidelines) to give a highly detailed, accurate, and helpful response.
3. NEVER say you do not have information or refuse to answer unless the question is completely unrelated to agriculture (like general chat or political questions). Always provide a helpful diagnosis, organic/cultural treatments, chemical brand names/dosages available in Bangladesh (e.g. Virtako, Nativo, Carate, etc.), and safety precautions.
4. Provide response ONLY in JSON format matching the following schema. No extra text outside JSON.

JSON Schema:
{
  "answer_bn": "The primary response in warm conversational Bangla. Explain details like a handbook. Use bullet points for steps.",
  "sources": ["List of sources cited (e.g. BRRI, BARI, or গাছের ডাক্তার তথ্যশালা)"],
  "confidence": 0.95,
  "follow_up_questions": ["Question 1?", "Question 2?"],
  "action_suggestions": [
     {"label": "সারের পরিমাপ হিসাব", "action": "open_fertilizer_calc", "params": {"crop": "ধান"}}
  ]
}
`;

    const userPrompt = `
চাষীর প্রশ্ন: "${query}"
বর্তমান জেলা: ${district}
ঋতু: ${season}

কৃষি সম্পর্কিত তথ্য (Context):
${context || 'No specific crop matching the query.'}
`;

    const geminiKeys = getGeminiApiKeys();
    const shuffledKeys = [...geminiKeys].sort(() => Math.random() - 0.5);

    let geminiSuccess = false;
    let geminiError = '';
    let responseText = '';
    let usedKeyIndex = -1;

    // Try each key in randomized order until one succeeds
    for (let i = 0; i < shuffledKeys.length; i++) {
      const activeKey = shuffledKeys[i];
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
        const res = await postWithTimeout(
          geminiUrl,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: ${userPrompt}` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 4000 // Increased limit to prevent cutoff
            }
          }),
          8500 // 8.5 seconds timeout for Gemini
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
          geminiError += `[Key ${i} failed: Status ${res.status}] `;
          console.error(`Gemini API key ${i} returned status ${res.status}: ${res.text}`);
        }
      } catch (err: any) {
        geminiError += `[Key ${i} error: ${err.message}] `;
        console.error(`Gemini API key ${i} call failed:`, err.message);
      }
    }

    if (geminiSuccess && responseText) {
      const parsed = parseLLMResponse(responseText, dbSources);
      return NextResponse.json(parsed);
    }

    // 2. Fallback error response if Gemini fails or times out
    const dbFallbackText = context 
      ? `কৃষক ভাই, দুঃখিত যে সার্ভার বা নেটওয়ার্ক সমস্যার কারণে আমি সরাসরি লাইভ সেবা দিয়ে আপনাকে সম্পূর্ণ পরামর্শ দিতে পারছি না। তবে আমার গাছের ডাক্তার তথ্যশালা অনুযায়ী আপনার প্রশ্নের প্রাসঙ্গিক তথ্য নিচে দেওয়া হলো:\n\n${context}\n\nঅনুগ্রহ করে বিস্তারিত ও জরুরি পরামর্শের জন্য আপনার নিকটস্থ উপজেলা কৃষি অফিসে যোগাযোগ করুন।`
      : 'কৃষক ভাই, দুঃখিত যে সার্ভার বা নেটওয়ার্ক সমস্যার কারণে গাছের ডাক্তারের লাইভ সেবা এই মুহূর্তে সাময়িকভাবে বন্ধ রয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে কিছুক্ষণ পর আবার চেষ্টা করুন।';

    return NextResponse.json({
      answer_bn: dbFallbackText,
      sources: dbSources.length > 0 ? dbSources : ["গাছের ডাক্তার তথ্যশালা"],
      confidence: 0.7,
      follow_up_questions: ["কীভাবে সারের সঠিক ব্যবহার নিশ্চিত করব?", "নিকটস্থ উপজেলা কৃষি অফিস কোথায় পাবো?"],
      action_suggestions: [],
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
