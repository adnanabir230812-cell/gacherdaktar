import json
from sqlalchemy.orm import Session
from app.database import engine, init_db, SessionLocal, District, Crop, FertilizerRule, Disease, KnowledgeEmbedding

# Bangladesh 64 Districts Coordinates
DISTRICTS_DATA = [
    {"name_bn": "ঢাকা", "name_en": "Dhaka", "lat": 23.8103, "lon": 90.4125},
    {"name_bn": "চট্টগ্রাম", "name_en": "Chittagong", "lat": 22.3569, "lon": 91.7832},
    {"name_bn": "রাজশাহী", "name_en": "Rajshahi", "lat": 24.3745, "lon": 88.6042},
    {"name_bn": "খুলনা", "name_en": "Khulna", "lat": 22.8456, "lon": 89.5403},
    {"name_bn": "বরিশাল", "name_en": "Barisal", "lat": 22.7010, "lon": 90.3535},
    {"name_bn": "সিলেট", "name_en": "Sylhet", "lat": 24.8949, "lon": 91.8687},
    {"name_bn": "রংপুর", "name_en": "Rangpur", "lat": 25.7558, "lon": 89.2444},
    {"name_bn": "ময়মনসিংহ", "name_en": "Mymensingh", "lat": 24.7471, "lon": 90.4203},
    {"name_bn": "গাজীপুর", "name_en": "Gazipur", "lat": 23.9999, "lon": 90.4203},
    {"name_bn": "নারায়ণগঞ্জ", "name_en": "Narayanganj", "lat": 23.6238, "lon": 90.5000},
    {"name_bn": "টাঙ্গাইল", "name_en": "Tangail", "lat": 24.2513, "lon": 89.9167},
    {"name_bn": "ফরিদপুর", "name_en": "Faridpur", "lat": 23.6071, "lon": 89.8429},
    {"name_bn": "নরসিংদী", "name_en": "Narsingdi", "lat": 23.9229, "lon": 90.7177},
    {"name_bn": "মানিকগঞ্জ", "name_en": "Manikganj", "lat": 23.8644, "lon": 90.0047},
    {"name_bn": "মুন্সীগঞ্জ", "name_en": "Munshiganj", "lat": 23.5433, "lon": 90.5354},
    {"name_bn": "কক্সবাজার", "name_en": "Cox's Bazar", "lat": 21.4272, "lon": 92.0058},
    {"name_bn": "কুমিল্লা", "name_en": "Comilla", "lat": 23.4607, "lon": 91.1809},
    {"name_bn": "নোয়াখালী", "name_en": "Noakhali", "lat": 22.8698, "lon": 91.0996},
    {"name_bn": "ফেনী", "name_en": "Feni", "lat": 23.0116, "lon": 91.3976},
    {"name_bn": "ব্রাহ্মণবাড়িয়া", "name_en": "Brahmanbaria", "lat": 23.9571, "lon": 91.1119},
    {"name_bn": "চাঁদপুর", "name_en": "Chandpur", "lat": 23.2321, "lon": 90.6631},
    {"name_bn": "লক্ষ্মীপুর", "name_en": "Lakshmipur", "lat": 22.9425, "lon": 90.8411},
    {"name_bn": "রাঙ্গামাটি", "name_en": "Rangamati", "lat": 22.6574, "lon": 92.1774},
    {"name_bn": "বান্দরবান", "name_en": "Bandarban", "lat": 22.1953, "lon": 92.2184},
    {"name_bn": "খাগড়াছড়ি", "name_en": "Khagrachhari", "lat": 23.1193, "lon": 91.9839},
    {"name_bn": "বগুড়া", "name_en": "Bogra", "lat": 24.8481, "lon": 89.3730},
    {"name_bn": "পাবনা", "name_en": "Pabna", "lat": 24.0063, "lon": 89.2378},
    {"name_bn": "সিরাজগঞ্জ", "name_en": "Sirajganj", "lat": 24.4577, "lon": 89.7080},
    {"name_bn": "নওগাঁ", "name_en": "Naogaon", "lat": 24.7936, "lon": 88.9318},
    {"name_bn": "নাটোর", "name_en": "Natore", "lat": 24.4102, "lon": 89.0076},
    {"name_bn": "জয়পুরহাট", "name_en": "Joypurhat", "lat": 25.0947, "lon": 89.0200},
    {"name_bn": "চাঁপাইনবাবগঞ্জ", "name_en": "Chapainawabganj", "lat": 24.5965, "lon": 88.2777},
    {"name_bn": "দিনাজপুর", "name_en": "Dinajpur", "lat": 25.6279, "lon": 88.6378},
    {"name_bn": "কুড়িগ্রাম", "name_en": "Kurigram", "lat": 25.8054, "lon": 89.6361},
    {"name_bn": "গাইবান্ধা", "name_en": "Gaibandha", "lat": 25.3287, "lon": 89.5280},
    {"name_bn": "লালমনিরহাট", "name_en": "Lalmonirhat", "lat": 25.9122, "lon": 89.4489},
    {"name_bn": "নীলফামারী", "name_en": "Nilphamari", "lat": 25.9417, "lon": 88.8417},
    {"name_bn": "পঞ্চগড়", "name_en": "Panchagarh", "lat": 26.3411, "lon": 88.5541},
    {"name_bn": "ঠাকুরগাঁও", "name_en": "Thakurgaon", "lat": 26.0336, "lon": 88.4617},
    {"name_bn": "যশোর", "name_en": "Jessore", "lat": 23.1664, "lon": 89.2081},
    {"name_bn": "সাতক্ষীরা", "name_en": "Satkhira", "lat": 22.7185, "lon": 89.0705},
    {"name_bn": "বাগেরহাট", "name_en": "Bagerhat", "lat": 22.6516, "lon": 89.7859},
    {"name_bn": "কুষ্টিয়া", "name_en": "Kushtia", "lat": 23.9014, "lon": 89.1204},
    {"name_bn": "ঝিনাইদহ", "name_en": "Jhenaidah", "lat": 23.5450, "lon": 89.1726},
    {"name_bn": "মাগুরা", "name_en": "Magura", "lat": 23.4873, "lon": 89.4199},
    {"name_bn": "মেহেরপুর", "name_en": "Meherpur", "lat": 23.7622, "lon": 88.6318},
    {"name_bn": "নড়াইল", "name_en": "Narail", "lat": 23.1725, "lon": 89.5126},
    {"name_bn": "চুয়াডাঙ্গা", "name_en": "Chuadanga", "lat": 23.6401, "lon": 88.8524},
    {"name_bn": "পটুয়াখালী", "name_en": "Patuakhali", "lat": 22.3597, "lon": 90.3297},
    {"name_bn": "ভোলা", "name_en": "Bhola", "lat": 22.6859, "lon": 90.6440},
    {"name_bn": "পিরোজপুর", "name_en": "Pirojpur", "lat": 22.5791, "lon": 89.9751},
    {"name_bn": "বরগুনা", "name_en": "Barguna", "lat": 22.1591, "lon": 90.1255},
    {"name_bn": "ঝালকাঠি", "name_en": "Jhalokati", "lat": 22.6438, "lon": 90.1968},
    {"name_bn": "হবিগঞ্জ", "name_en": "Habiganj", "lat": 24.3749, "lon": 91.4155},
    {"name_bn": "মৌলভীবাজার", "name_en": "Moulvibazar", "lat": 24.4829, "lon": 91.7685},
    {"name_bn": "সুনামগঞ্জ", "name_en": "Sunamganj", "lat": 25.0660, "lon": 91.3992},
    {"name_bn": "শেরপুর", "name_en": "Sherpur", "lat": 25.0189, "lon": 90.0175},
    {"name_bn": "নেত্রকোণা", "name_en": "Netrokona", "lat": 24.8780, "lon": 90.7270},
    {"name_bn": "জামালপুর", "name_en": "Jamalpur", "lat": 24.9197, "lon": 89.9481},
    {"name_bn": "গোপালগঞ্জ", "name_en": "Gopalganj", "lat": 23.0094, "lon": 89.8252},
    {"name_bn": "মাদারীপুর", "name_en": "Madaripur", "lat": 23.1663, "lon": 90.1870},
    {"name_bn": "শরীয়তপুর", "name_en": "Shariatpur", "lat": 23.2163, "lon": 90.3541},
    {"name_bn": "রাজবাড়ী", "name_en": "Rajbari", "lat": 23.7574, "lon": 89.6384}
]

CROPS_DATA = [
    {
        "name_bn": "ধান (বোরো)",
        "name_en": "Boro Rice",
        "scientific_name": "Oryza sativa",
        "category": "grain",
        "seasons": ["boro", "rabi"],
        "soil_preference": ["clay", "loam"],
        "water_requirement": "high",
        "yield_avg": 6.2,
        "profit_avg": 12000,
        "icon_name": "rice",
        "fertilizers": [
            {"season": "boro", "urea": 35.0, "tsp": 12.0, "mop": 15.0, "gypsum": 8.0, "zinc": 1.5, "source_org": "BRRI"}
        ],
        "diseases": [
            {
                "name_bn": "ধানের ব্লাস্ট রোগ",
                "symptoms": "পাতা হলুদ, চোখের মতো দাগ, পাতার অগ্রভাগ পুড়ে যাওয়া",
                "cause_bn": "ম্যাগনাপোর্টে ওরাইজি নামক ছত্রাক",
                "treatment_bn": "ক্ষেতের পানি শুকিয়ে ফেলা এবং কপার অক্সিক্লোরাইড বা ট্রাইসাইক্লাজোল জাতীয় ছত্রাকনাশক স্প্রে করা।",
                "prevention_bn": "সহনশীল জাত রোপণ করা এবং সঠিক সময়ে সুষম সার প্রয়োগ করা।",
                "source_org": "BRRI"
            },
            {
                "name_bn": "ব্যাকটেরিয়াজনিত পাতা পোড়া (BLB)",
                "symptoms": "পাতার কিনারায় হলুদ বা ধূসর ঢেউ খেলানো দাগ, গাছ শুকিয়ে যাওয়া",
                "cause_bn": "জ্যান্থোমোনাস ওরাইজি নামক ব্যাকটেরিয়া",
                "treatment_bn": "৬০ গ্রাম পটাশ সার এবং ১ গ্রাম জিংক সালফেট ১০ লিটার পানিতে মিশিয়ে ৫ শতক জমিতে স্প্রে করুন। অতিরিক্ত ইউরিয়া সার প্রয়োগ বন্ধ রাখুন।",
                "prevention_bn": "রোগমুক্ত বীজ ব্যবহার এবং নাইট্রোজেন সার ৩-৪ কিস্তিতে সমানভাবে দেয়া।",
                "source_org": "BRRI"
            }
        ]
    },
    {
        "name_bn": "টমেটো",
        "name_en": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "category": "vegetable",
        "seasons": ["rabi", "winter"],
        "soil_preference": ["loam", "sandy"],
        "water_requirement": "medium",
        "yield_avg": 25.0,
        "profit_avg": 22000,
        "icon_name": "tomato",
        "fertilizers": [
            {"season": "rabi", "urea": 28.0, "tsp": 18.0, "mop": 20.0, "gypsum": 10.0, "zinc": 1.0, "source_org": "BARI"}
        ],
        "diseases": [
            {
                "name_bn": "টমেটোর লেট ব্লাইট (নাবি ধসা)",
                "symptoms": "পাতায় কালো বা ভেজা দাগ, আর্দ্র আবহাওয়ায় পাতার নিচে সাদা তুলার মতো ছাতা পড়া",
                "cause_bn": "ফাইটোপথোরা ইনফেসট্যান্স নামক ছত্রাক",
                "treatment_bn": "ম্যানকোজেব বা মেটালাক্সিল জাতীয় ছত্রাকনাশক স্প্রে করুন। আক্রান্ত পাতা পুড়িয়ে ফেলুন।",
                "prevention_bn": "রোপণের সময় গাছের মধ্যে পর্যাপ্ত দূরত্ব রাখা যাতে বাতাস চলাচল করতে পারে।",
                "source_org": "BARI"
            }
        ]
    },
    {
        "name_bn": "আলু",
        "name_en": "Potato",
        "scientific_name": "Solanum tuberosum",
        "category": "vegetable",
        "seasons": ["rabi", "winter"],
        "soil_preference": ["loam", "sandy"],
        "water_requirement": "medium",
        "yield_avg": 20.5,
        "profit_avg": 18000,
        "icon_name": "potato",
        "fertilizers": [
            {"season": "rabi", "urea": 30.0, "tsp": 22.0, "mop": 25.0, "gypsum": 12.0, "zinc": 1.5, "source_org": "BARI"}
        ],
        "diseases": [
            {
                "name_bn": "আলুর নাবি ধসা (Late Blight)",
                "symptoms": "পাতার কিনারায় কালো ভেজা দাগ, পচন ধরা",
                "cause_bn": "ছত্রাকজনিত সংক্রমণ",
                "treatment_bn": "আক্রান্ত পাতা তুলে ফেলা এবং রিডোমিল গোল্ড বা সিকিউর স্প্রে করা।",
                "prevention_bn": "রোগমুক্ত বীজ আলু ব্যবহার এবং সুষম মাত্রায় পটাশ সার ব্যবহার করা।",
                "source_org": "BARI"
            }
        ]
    },
    {
        "name_bn": "বেগুন",
        "name_en": "Brinjal",
        "scientific_name": "Solanum melongena",
        "category": "vegetable",
        "seasons": ["rabi", "kharif", "year-round"],
        "soil_preference": ["loam", "clay"],
        "water_requirement": "medium",
        "yield_avg": 18.0,
        "profit_avg": 15000,
        "icon_name": "eggplant",
        "fertilizers": [
            {"season": "year-round", "urea": 25.0, "tsp": 15.0, "mop": 18.0, "gypsum": 8.0, "zinc": 1.0, "source_org": "BARI"}
        ],
        "diseases": [
            {
                "name_bn": "বেগুন ডগা ও ফল ছিদ্রকারী পোকা",
                "symptoms": "বেগুনের ডগা নুয়ে পড়া এবং ডগা ও ফলে ছোট ছিদ্র দেখা যাওয়া",
                "cause_bn": "লিউসিনোডেস অরবোনালিস নামক পোকা",
                "treatment_bn": "আক্রান্ত ডগা কেটে পুড়িয়ে ফেলা এবং কার্টাপ বা স্পিনোস্যাড জাতীয় কীটনাশক ব্যবহার করা।",
                "prevention_bn": "ফাঁদ ফসল হিসেবে চাষাবাদ করা এবং ক্ষেত পরিচ্ছন্ন রাখা।",
                "source_org": "BARI"
            }
        ]
    },
    {
        "name_bn": "গম",
        "name_en": "Wheat",
        "scientific_name": "Triticum aestivum",
        "category": "grain",
        "seasons": ["rabi", "winter"],
        "soil_preference": ["loam", "sandy"],
        "water_requirement": "low",
        "yield_avg": 3.6,
        "profit_avg": 8000,
        "icon_name": "wheat",
        "fertilizers": [
            {"season": "rabi", "urea": 22.0, "tsp": 14.0, "mop": 10.0, "gypsum": 8.0, "zinc": 1.0, "source_org": "BARI"}
        ],
        "diseases": [
            {
                "name_bn": "গমের ব্লাস্ট রোগ",
                "symptoms": "গমের শীষের অগ্রভাগ সাদা হয়ে যাওয়া, শীষে কালো স্পট বা দাগ",
                "cause_bn": "ছত্রাকজনিত আক্রমণ",
                "treatment_bn": "শীষ বের হওয়ার সময় টেপুকোনাজল বা ট্রাইফ্লক্সিস্ট্রবিন জাতীয় ছত্রাকনাশক স্প্রে করুন।",
                "prevention_bn": "ব্লাস্ট প্রতিরোধী জাত (যেমন- বারি গম ৩৩) রোপণ করা।",
                "source_org": "BARI"
            }
        ]
    }
]

KNOWLEDGE_SNIPPETS = [
    {
        "crop_name": "ধান (বোরো)",
        "doc_type": "brri_manual",
        "snippet": "বোরো ধানের জন্য বীজ তলা তৈরি: নভেম্বর মাসের প্রথম সপ্তাহে বীজতলায় বীজ বোনা উচিত। ইউরিয়া সার সমান ৩টি কিস্তিতে দিতে হবে। ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর, ২য় কিস্তি চারা রোপণের ৩০-৩৫ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন পূর্বে প্রয়োগ করতে হবে। সুষম সার প্রয়োগ ধানের ফলন বাড়ায়।"
    },
    {
        "crop_name": "টমেটো",
        "doc_type": "bari_guide",
        "snippet": "টমেটো চাষাবাদ পদ্ধতি: অক্টোবর-নভেম্বর মাসে বীজতলায় চারা তৈরি করে মূল জমিতে ৩০-৩৫ দিন বয়সের চারা রোপণ করতে হবে। গোবর বা কম্পোস্ট সার জমি তৈরির সময় প্রয়োগ করা উচিত। সেচ দেওয়ার পর মাটির চটা ভেঙে দেয়া গুরুত্বপূর্ণ যাতে টমেটোর মূল পর্যাপ্ত অক্সিজেন পায়।"
    },
    {
        "crop_name": "আলু",
        "doc_type": "bari_guide",
        "snippet": "আলুর সঠিক সেচ ব্যবস্থাপনা: আলু চাষে ২-৩ বার সেচ দেয়া অত্যন্ত জরুরি। ১ম সেচ রোপণের ২০-২৫ দিনের মাথায় এবং ২য় সেচ ৪৫-৫০ দিনে দিতে হবে। জমিতে অতিরিক্ত পানি জমে থাকলে আলু পচে যেতে পারে, তাই পানি নিষ্কাশন ব্যবস্থা ভালো রাখা আবশ্যক।"
    }
]

def seed_database(db: Session):
    # 1. Seed Districts
    print("Seeding districts...")
    for item in DISTRICTS_DATA:
        exists = db.query(District).filter(District.name_bn == item["name_bn"]).first()
        if not exists:
            db.add(District(**item))
    db.commit()

    # 2. Seed Crops, Fertilizers, and Diseases
    print("Seeding crops, fertilizers, diseases...")
    for item in CROPS_DATA:
        exists = db.query(Crop).filter(Crop.name_bn == item["name_bn"]).first()
        if not exists:
            crop = Crop(
                name_bn=item["name_bn"],
                name_en=item["name_en"],
                scientific_name=item["scientific_name"],
                category=item["category"],
                seasons=json.dumps(item["seasons"]),
                soil_preference=json.dumps(item["soil_preference"]),
                water_requirement=item["water_requirement"],
                yield_avg=item["yield_avg"],
                profit_avg=item["profit_avg"],
                icon_name=item["icon_name"]
            )
            db.add(crop)
            db.commit()
            db.refresh(crop)

            # Seed Fertilizers
            for fert in item["fertilizers"]:
                db.add(FertilizerRule(
                    crop_id=crop.id,
                    season=fert["season"],
                    urea=fert["urea"],
                    tsp=fert["tsp"],
                    mop=fert["mop"],
                    gypsum=fert["gypsum"],
                    zinc=fert["zinc"],
                    source_org=fert["source_org"]
                ))

            # Seed Diseases
            for dis in item["diseases"]:
                db.add(Disease(
                    crop_id=crop.id,
                    name_bn=dis["name_bn"],
                    symptoms=dis["symptoms"],
                    cause_bn=dis["cause_bn"],
                    treatment_bn=dis["treatment_bn"],
                    prevention_bn=dis["prevention_bn"],
                    source_org=dis["source_org"]
                ))
            db.commit()

    # 3. Seed Knowledge Embeddings (mock snippets for local fallback RAG)
    print("Seeding knowledge snippets...")
    for snippet in KNOWLEDGE_SNIPPETS:
        crop = db.query(Crop).filter(Crop.name_bn == snippet["crop_name"]).first()
        exists = db.query(KnowledgeEmbedding).filter(KnowledgeEmbedding.content_snippet == snippet["snippet"]).first()
        if not exists:
            db.add(KnowledgeEmbedding(
                crop_id=crop.id if crop else None,
                doc_type=snippet["doc_type"],
                content_snippet=snippet["snippet"],
                embedding_json="[]" # Empty array placeholder; will query via simple local keyword search if no API embedding exists
            ))
    db.commit()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    seed_database(db)
    db.close()
