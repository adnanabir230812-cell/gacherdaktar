import os
import sys
import json
from sqlalchemy.orm import Session

# Add project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, init_db, SessionLocal, Crop, FertilizerRule, Disease

def seed_all_crops_from_json():
    # Path to crops_data.json
    json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "frontend", "scratch", "crops_data.json"
    )
    
    if not os.path.exists(json_path):
        print(f"Error: crops_data.json not found at {json_path}")
        return
        
    with open(json_path, 'r', encoding='utf-8') as f:
        crops_data = json.load(f)
        
    print(f"Loaded {len(crops_data)} crops from crops_data.json.")
    
    db: Session = SessionLocal()
    try:
        # Clear existing crops, fertilizers, and diseases to avoid duplicates and ensure updates are applied
        print("Clearing existing crops, fertilizer rules, and diseases from SQLite...")
        db.query(Disease).delete()
        db.query(FertilizerRule).delete()
        db.query(Crop).delete()
        db.commit()
        
        print("Importing crops into SQLite database...")
        for c in crops_data:
            # Create Crop
            db_crop = Crop(
                id=int(c["id"]),
                name_bn=c["name_bn"],
                name_en=c["name_en"],
                scientific_name=c.get("scientific_name"),
                category=c["category"],
                seasons=json.dumps(c["seasons"], ensure_ascii=False),
                soil_preference=json.dumps(c["soil_preference"], ensure_ascii=False),
                water_requirement=c["water_requirement"],
                yield_avg=float(c["yield_avg"]),
                profit_avg=float(c["profit_avg"]),
                icon_name=c["icon_name"]
            )
            db.add(db_crop)
            db.commit()
            db.refresh(db_crop)
            
            # Add Fertilizers
            for fert in c.get("fertilizers", []):
                db_fert = FertilizerRule(
                    crop_id=db_crop.id,
                    season=fert["season"],
                    urea=float(fert["urea"]),
                    tsp=float(fert["tsp"]),
                    mop=float(fert["mop"]),
                    gypsum=float(fert["gypsum"]),
                    zinc=float(fert["zinc"]),
                    source_org=fert["source_org"]
                )
                db.add(db_fert)
                
            # Add Diseases
            for dis in c.get("diseases", []):
                db_dis = Disease(
                    crop_id=db_crop.id,
                    name_bn=dis["name_bn"],
                    symptoms=dis["symptoms"],
                    cause_bn=dis["cause_bn"],
                    treatment_bn=dis["treatment_bn"],
                    prevention_bn=dis.get("prevention_bn", ""),
                    source_org=dis["source_org"]
                )
                db.add(db_dis)
                
            db.commit()
            
        print(f"Successfully seeded {len(crops_data)} crops in SQLite database!")
        
    except Exception as e:
        db.rollback()
        print("Error seeding crops database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_all_crops_from_json()
