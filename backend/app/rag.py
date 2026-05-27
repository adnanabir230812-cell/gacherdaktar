import os
import re
import json
import httpx
from sqlalchemy.orm import Session
from app.database import Crop, Disease, FertilizerRule, KnowledgeEmbedding, ChatHistory
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2.5-72b-instruct")

# Simple local semantic matching (word overlap & keyword search)
def retrieve_context(query: str, db: Session, crop_name: str = None) -> tuple:
    context_parts = []
    sources = []
    
    # 1. Look up crop-specific rule data if mentioned
    crop = None
    if crop_name:
        crop = db.query(Crop).filter(Crop.name_bn.like(f"%{crop_name}%")).first()
    else:
        # scan query for crop keywords
        all_crops = db.query(Crop).all()
        for c in all_crops:
            if c.name_bn in query or (c.name_en and c.name_en.lower() in query.lower()):
                crop = c
                break

    if crop:
        context_parts.append(
            f"ফসল: {crop.name_bn} ({crop.scientific_name}). "
            f"বিভাগ: {crop.category}. পানির চাহিদা: {crop.water_requirement}. "
            f"গড় ফলন: {crop.yield_avg} টন/হেক্টর. গড় লাভ: {crop.profit_avg} টাকা/বিঘা."
        )
        sources.append("কৃষিসাথী ডাটাবেজ")
        
        # Pull fertilizer rules
        for rule in crop.fertilizers:
            context_parts.append(
                f"{crop.name_bn} সারের নিয়ম ({rule.season} মৌসুম - {rule.source_org}): "
                f"ইউরিয়া: {rule.urea} কেজি/বিঘা, টিএসপি: {rule.tsp} কেজি/বিঘা, "
                f"এমওপি: {rule.mop} কেজি/বিঘা, জিপসাম: {rule.gypsum} কেজি/বিঘা, দস্তা: {rule.zinc} কেজি/বিঘা."
            )
            sources.append(f"{rule.source_org} নির্দেশিকা")
            
        # Pull disease treatments
        for dis in crop.diseases:
            if any(k in query for k in dis.name_bn.split()) or any(k in query for k in dis.symptoms.split()):
                context_parts.append(
                    f"রোগ: {dis.name_bn}. লক্ষণ: {dis.symptoms}. কারণ: {dis.cause_bn}. "
                    f"প্রতিকার: {dis.treatment_bn}. প্রতিরোধ: {dis.prevention_bn}."
                )
                sources.append(f"{dis.source_org} রোগ গাইড")

    # 2. General Knowledge snippets text matching
    keywords = [w for w in query.split() if len(w) > 2]
    snippets = db.query(KnowledgeEmbedding).all()
    matched_snippets = []
    for snippet in snippets:
        match_count = sum(1 for kw in keywords if kw in snippet.content_snippet)
        if match_count > 0:
            matched_snippets.append((match_count, snippet))
            
    # Sort snippets by match count
    matched_snippets.sort(key=lambda x: x[0], reverse=True)
    for _, snippet in matched_snippets[:3]:
        context_parts.append(snippet.content_snippet)
        sources.append(snippet.doc_type.upper().replace("_", " "))

    unique_sources = list(set(sources))
    return "\n\n".join(context_parts), unique_sources

def clean_json_string(s: str) -> str:
    s = s.strip()
    if s.startswith("```"):
        lines = s.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        s = "\n".join(lines).strip()
    return s

def parse_llm_response_py(text: str) -> dict:
    cleaned = clean_json_string(text)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except Exception as e:
        print(f"json.loads failed on LLM response, attempting regex fallback: {e}")

    # Regex fallback: try to extract fields manually
    def extract_field_string(field: str) -> str:
        match = re.search(rf'"{field}"\s*:\s*"((?:[^"\\]|\\.)*)"', cleaned) or \
                re.search(rf"'{field}'\s*:\s*'((?:[^'\\]|\\.)*)'", cleaned)
        if match:
            try:
                return json.loads(f'"{match.group(1)}"')
            except Exception:
                return match.group(1)
        return ""

    def extract_field_float(field: str, default_val: float) -> float:
        match = re.search(rf'"{field}"\s*:\s*([0-9.]+)', cleaned) or \
                re.search(rf"'{field}'\s*:\s*([0-9.]+)", cleaned)
        if match:
            try:
                return float(match.group(1))
            except Exception:
                pass
        return default_val

    def extract_field_list(field: str) -> list:
        match = re.search(rf'"{field}"\s*:\s*\[([^\]]*)\]', cleaned) or \
                re.search(rf"'{field}'\s*:\s*\[([^\]]*)\]", cleaned)
        if not match:
            return []
        items_str = match.group(1)
        
        if field == 'action_suggestions':
            try:
                return json.loads(f"[{items_str}]")
            except Exception:
                suggestions = []
                obj_matches = re.finditer(r'\{\s*"label"\s*:\s*"([^"]+)"\s*,\s*"action"\s*:\s*"([^"]+)"\s*(?:,\s*"params"\s*:\s*\{([^\}]+)\})?\s*\}', items_str)
                for om in obj_matches:
                    label = om.group(1)
                    action = om.group(2)
                    params = {}
                    if om.group(3):
                        param_matches = re.finditer(r'"([^"]+)"\s*:\s*"([^"]+)"', om.group(3))
                        for pm in param_matches:
                            params[pm.group(1)] = pm.group(2)
                    suggestions.append({"label": label, "action": action, "params": params})
                return suggestions

        items = []
        item_matches = re.finditer(r'"([^"]+)"|\'([^\']+)\'', items_str)
        for im in item_matches:
            items.append(im.group(1) or im.group(2))
        return items

    return {
        "answer_bn": extract_field_string("answer_bn") or cleaned,
        "sources": extract_field_list("sources"),
        "confidence": extract_field_float("confidence", 0.95),
        "follow_up_questions": extract_field_list("follow_up_questions"),
        "action_suggestions": extract_field_list("action_suggestions")
    }

async def query_llm(system_prompt: str, user_prompt: str) -> dict:
    # We will prioritize Gemini API as requested by "chatbox must be functioning with gemini api"
    # But if Gemini fails or OpenRouter is preferred, we fall back to OpenRouter.
    # Let's try Gemini first, then OpenRouter.
    
    headers = {"Content-Type": "application/json"}
    
    # 1. Try Native Gemini API first
    if GEMINI_API_KEY:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\nUser Question: {user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(gemini_url, headers=headers, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    text_out = result['candidates'][0]['content']['parts'][0]['text']
                    return parse_llm_response_py(text_out)
        except Exception as e:
            print(f"Native Gemini API error, falling back to OpenRouter: {e}")
            
    # 2. Try OpenRouter (Qwen) if Gemini API was unavailable or failed
    if OPENROUTER_API_KEY:
        openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        openrouter_headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://krishisathi.bd", 
            "X-Title": "Krishisathi"
        }
        payload = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt + "\nResponse must be valid JSON matching the schema."},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(openrouter_url, headers=openrouter_headers, json=payload)
                if response.status_code == 200:
                    res_json = response.json()
                    content = res_json['choices'][0]['message']['content']
                    return parse_llm_response_py(content)
        except Exception as e:
            print(f"OpenRouter API error: {e}")

    # 3. Safe fallback offline mock response if all APIs fail or are missing keys
    return {
        "answer_bn": "দুঃখিত, এআই সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন বা এপিআই কী চেক করুন।\n\nজরুরি সহায়তায় কল করুন: ১৬১২৩ (জাতীয় কৃষি তথ্য সেন্টার)।",
        "sources": ["কৃষিসাথী অফলাইন ডাটা"],
        "confidence": 0.5,
        "follow_up_questions": ["ধান চাষে কত সার লাগবে?", "টমেটোর নাবি ধসা রোগ কি?"],
        "action_suggestions": []
    }

async def generate_chat_response(query: str, db: Session, district: str = "ঢাকা", season: str = "বোরো") -> dict:
    context, sources = retrieve_context(query, db)
    
    system_prompt = f"""
You are "কৃষিসাথী" (Krishisathi), an emotionally warm, polite, and highly knowledgeable Bangladeshi agriculture expert. 
Your goal is to help local farmers solve crop cultivation, fertilizer, disease, and weather problems.

RULES:
1. ALWAYS write in simple, warm, and natural conversational Bangla. Avoid complex English terms or academic jargon.
2. Ground your advice strictly in the provided Context. Do NOT invent fertilizer dosages, pesticide numbers, or yields.
3. If the context does not contain the answer, say "এই তথ্যটি আমার কাছে নেই, আপনি নিকটস্থ কৃষি অফিসে যোগাযোগ করতে পারেন।"
4. Provide response ONLY in JSON format matching the following schema. No extra text outside JSON.

JSON Schema:
{{
  "answer_bn": "The primary response in warm conversational Bangla. Use bullet points for steps.",
  "sources": ["List of sources cited (e.g. BRRI, BARI)"],
  "confidence": 0.95,
  "follow_up_questions": ["Question 1?", "Question 2?"],
  "action_suggestions": [
     {{"label": "সার ক্যালকুলেটর", "action": "open_fertilizer_calc", "params": {{"crop": "ধান"}}}}
  ]
}}
"""
    
    user_prompt = f"""
চাষীর প্রশ্ন: "{query}"
বর্তমান জেলা: {district}
ঋতু: {season}

কৃষি সম্পর্কিত তথ্য (Context):
{context}
"""
    
    try:
        response_dict = await query_llm(system_prompt, user_prompt)
    except Exception:
        response_dict = {
            "answer_bn": "দুঃখিত, তথ্যটি প্রসেস করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
            "sources": ["কৃষিসাথী সিস্টেম"],
            "confidence": 0.5,
            "follow_up_questions": [],
            "action_suggestions": []
        }
        
    # Append any database verified sources if missing
    if sources:
        response_dict["sources"] = list(set(response_dict.get("sources", []) + sources))
        
    # Log to chat history
    try:
        log = ChatHistory(
            query_bn=query,
            response_bn=response_dict.get("answer_bn", ""),
            confidence_score=response_dict.get("confidence", 1.0),
            sources=",".join(response_dict.get("sources", []))
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to log chat history: {e}")
        
    return response_dict
