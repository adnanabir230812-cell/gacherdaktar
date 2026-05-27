import os
import json
import httpx
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import init_db, get_db, District, Crop, FertilizerRule, Disease
from app.seed import seed_database
from app.rag import generate_chat_response

app = FastAPI(title="কৃষিসাথী API", version="1.0.0")

# Setup CORS to allow Next.js frontend to query backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and Seed Database on Startup
@app.on_event("startup")
def startup_event():
    init_db()
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        # Check if districts table is seeded
        if db.query(District).count() == 0:
            print("Database not seeded. Running seed script...")
            seed_database(db)
        else:
            print("Database already contains data.")
    finally:
        db.close()

# Pydantic schemas
class ChatRequest(BaseModel):
    query: str
    district: Optional[str] = "ঢাকা"
    season: Optional[str] = "বোরো"

class FertilizerRequest(BaseModel):
    crop_id: int
    land_size: float # in bigha
    season: str

@app.get("/api/districts")
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    return [{"id": d.id, "name_bn": d.name_bn, "name_en": d.name_en, "lat": d.lat, "lon": d.lon} for d in districts]

@app.get("/api/crops")
def get_crops(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Crop)
    if category:
        query = query.filter(Crop.category == category)
    crops = query.all()
    
    result = []
    for c in crops:
        result.append({
            "id": c.id,
            "name_bn": c.name_bn,
            "name_en": c.name_en,
            "scientific_name": c.scientific_name,
            "category": c.category,
            "seasons": json.loads(c.seasons) if c.seasons else [],
            "soil_preference": json.loads(c.soil_preference) if c.soil_preference else [],
            "water_requirement": c.water_requirement,
            "yield_avg": c.yield_avg,
            "profit_avg": c.profit_avg,
            "icon_name": c.icon_name
        })
    return result

@app.get("/api/crops/{crop_id}")
def crop_details(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    fertilizers = db.query(FertilizerRule).filter(FertilizerRule.crop_id == crop_id).all()
    diseases = db.query(Disease).filter(Disease.crop_id == crop_id).all()
    
    return {
        "id": crop.id,
        "name_bn": crop.name_bn,
        "name_en": crop.name_en,
        "scientific_name": crop.scientific_name,
        "category": crop.category,
        "seasons": json.loads(crop.seasons) if crop.seasons else [],
        "soil_preference": json.loads(crop.soil_preference) if crop.soil_preference else [],
        "water_requirement": crop.water_requirement,
        "yield_avg": crop.yield_avg,
        "profit_avg": crop.profit_avg,
        "icon_name": crop.icon_name,
        "fertilizers": [{
            "season": f.season,
            "urea": f.urea,
            "tsp": f.tsp,
            "mop": f.mop,
            "gypsum": f.gypsum,
            "zinc": f.zinc,
            "source_org": f.source_org
        } for f in fertilizers],
        "diseases": [{
            "id": d.id,
            "name_bn": d.name_bn,
            "symptoms": d.symptoms,
            "cause_bn": d.cause_bn,
            "treatment_bn": d.treatment_bn,
            "prevention_bn": d.prevention_bn,
            "source_org": d.source_org
        } for d in diseases]
    }

@app.get("/api/weather")
async def get_weather(district_name: str, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.name_bn == district_name).first()
    if not district:
        # Fallback search by English name
        district = db.query(District).filter(District.name_en.like(f"%{district_name}%")).first()
        
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
        
    # Query Open-Meteo
    url = f"https://api.open-meteo.com/v1/forecast?latitude={district.lat}&longitude={district.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,showers_sum,weathercode&current_weather=true&timezone=Asia/Dhaka"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Weather service unavailable")
            data = response.json()
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to fetch weather: {str(e)}")

    # Map Open-Meteo weathercode to Bangla
    # Ref: WMO weather interpretation codes
    weather_codes = {
        0: "পরিষ্কার রৌদ্রোজ্জ্বল আকাশ",
        1: "প্রধানত পরিষ্কার আকাশ", 2: "আংশিক মেঘলা", 3: "মেঘলা আকাশ",
        45: "কুয়াশাচ্ছন্ন", 48: "ঘন কুয়াশা ও বরফ কণা",
        51: "হালকা গুঁড়িগুঁড়ি বৃষ্টি", 53: "মাঝারি গুঁড়িগুঁড়ি বৃষ্টি", 55: "ঘন গুঁড়িগুঁড়ি বৃষ্টি",
        61: "হালকা বৃষ্টি", 63: "মাঝারি বৃষ্টি", 65: "ভারী বৃষ্টি",
        71: "হালকা তুষারপাত", 73: "মাঝারি তুষারপাত", 75: "ভারী তুষারপাত",
        77: "তুষার কণা",
        80: "হালকা বৃষ্টির ঝাপটা", 81: "মাঝারি বৃষ্টির ঝাপটা", 82: "ভারী মুষলধারে বৃষ্টি",
        85: "হালকা তুষারপাত ঝাপটা", 86: "ভারী তুষারপাত ঝাপটা",
        95: "বজ্রবিদ্যুৎসহ ঝড়ো হাওয়া", 96: "বজ্রবিদ্যুৎ ও শিলাবৃষ্টি", 99: "প্রবল বজ্রঝড় ও শিলাবৃষ্টি"
    }

    current = data.get("current_weather", {})
    code = current.get("weathercode", 0)
    temp = current.get("temp", current.get("temperature", 28.0))
    wind = current.get("windspeed", 5.0)
    
    # Farming impact evaluation
    farming_advice = []
    daily_precip = data.get("daily", {}).get("precipitation_sum", [0])[0]
    
    # Advice 1: Irrigation
    if daily_precip > 5.0:
        farming_advice.append("⚠️ জমিতে সেচ দেওয়া বন্ধ রাখুন। আগামী ২৪ ঘণ্টায় বৃষ্টির প্রবল সম্ভাবনা রয়েছে।")
    else:
        farming_advice.append("💧 জমিতে সেচ দেওয়ার জন্য উপযুক্ত সময়। অতিরিক্ত পানি নিষ্কাশনের দিকে লক্ষ্য রাখুন।")
        
    # Advice 2: Sprays
    if wind > 15.0:
        farming_advice.append("💨 বাতাসের গতি বেশি ({:.1f} কিমি/ঘণ্টা)। আজ জমিতে কীটনাশক বা সার স্প্রে করা থেকে বিরত থাকুন।".format(wind))
    else:
        farming_advice.append("✅ হালকা বাতাস। বালাইনাশক বা ছত্রাকনাশক স্প্রে করার জন্য নিরাপদ সময়।")
        
    # Advice 3: Disease alert based on temp
    if temp > 32.0:
        farming_advice.append("☀️ অতিরিক্ত গরম তাপমাত্রা ({}°C)। ফসলের গোড়ায় আর্দ্রতা বজায় রাখতে বিকেলের দিকে হালকা সেচ দিন।".format(temp))
    elif temp < 18.0:
        farming_advice.append("❄️ শীতকালীন আবহাওয়া। টমেটো ও আলুর ক্ষেত্রে নাবি ধসা (Late Blight) রোগের প্রতি সতর্ক নজর রাখুন।")

    return {
        "district": district.name_bn,
        "temp": temp,
        "condition": weather_codes.get(code, "মেঘলা আকাশ"),
        "wind_speed": wind,
        "daily": {
            "dates": data.get("daily", {}).get("time", []),
            "temp_max": data.get("daily", {}).get("temperature_2m_max", []),
            "temp_min": data.get("daily", {}).get("temperature_2m_min", []),
            "precipitation": data.get("daily", {}).get("precipitation_sum", [])
        },
        "advice": farming_advice
    }

@app.post("/api/fertilizer")
def calculate_fertilizer(req: FertilizerRequest, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == req.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    rule = db.query(FertilizerRule).filter(
        FertilizerRule.crop_id == req.crop_id,
        FertilizerRule.season == req.season
    ).first()
    
    if not rule:
        # Fallback to any rule for this crop
        rule = db.query(FertilizerRule).filter(FertilizerRule.crop_id == req.crop_id).first()
        
    if not rule:
        raise HTTPException(status_code=400, detail="No fertilizer guidelines available for this crop")
        
    # Formula: rule value * land size (in bigha)
    land = req.land_size
    urea_total = rule.urea * land
    tsp_total = rule.tsp * land
    mop_total = rule.mop * land
    gypsum_total = rule.gypsum * land
    zinc_total = rule.zinc * land
    
    # Calculations details & guidelines in Bangla
    guidelines = [
        f"১. ইউরিয়া সার ({urea_total:.1f} কেজি) ৩টি কিস্তিতে সমানভাগে প্রয়োগ করুন। ১ম কিস্তি চারা রোপণের ১৫ দিন পর, ২য় কিস্তি ৩০ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে দিতে হবে।",
        f"২. জমি শেষ চাষের সময় সমস্ত টিএসপি ({tsp_total:.1f} কেজি), জিপসাম ({gypsum_total:.1f} কেজি) এবং দস্তা ({zinc_total:.1f} কেজি) সার মাটির সাথে ভালো করে মিশিয়ে দিন।",
        f"৩. এমওপি সার ({mop_total:.1f} কেজি) ২ কিস্তিতে প্রয়োগ করতে হবে: অর্ধেক জমি শেষ চাষের সময় এবং বাকি অর্ধেক চারা রোপণের ৩৫-৪০ দিন পর (২য় বার ইউরিয়া দেওয়ার সময়)।"
    ]
    
    return {
        "crop_name": crop.name_bn,
        "land_size": land,
        "season": req.season,
        "source": rule.source_org,
        "urea_kg": round(urea_total, 2),
        "tsp_kg": round(tsp_total, 2),
        "mop_kg": round(mop_total, 2),
        "gypsum_kg": round(gypsum_total, 2),
        "zinc_kg": round(zinc_total, 2),
        "guidelines": guidelines
    }

@app.post("/api/chat")
async def chat_bot(req: ChatRequest, db: Session = Depends(get_db)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    response_data = await generate_chat_response(req.query, db, req.district, req.season)
    return response_data

@app.get("/api/recommend-crops")
def recommend_crops(district: str, season: str, soil_type: str, db: Session = Depends(get_db)):
    all_crops = db.query(Crop).all()
    recommended = []
    
    for c in all_crops:
        seasons_list = json.loads(c.seasons) if c.seasons else []
        soils_list = json.loads(c.soil_preference) if c.soil_preference else []
        
        # simple matching logic
        season_match = season.lower() in [s.lower() for s in seasons_list]
        soil_match = soil_type.lower() in [s.lower() for s in soils_list]
        
        if season_match and soil_match:
            recommended.append({
                "id": c.id,
                "name_bn": c.name_bn,
                "name_en": c.name_en,
                "category": c.category,
                "yield_avg": c.yield_avg,
                "profit_avg": c.profit_avg,
                "icon_name": c.icon_name,
                "suitability": "উচ্চ (Suitable)" if c.profit_avg > 15000 else "মাঝারি"
            })
            
    # Sort by profit
    recommended.sort(key=lambda x: x["profit_avg"], reverse=True)
    return recommended
