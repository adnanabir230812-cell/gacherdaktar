export interface District {
  name_bn: string;
  name_en: string;
  lat: number;
  lon: number;
}

export interface FertilizerRule {
  season: string;
  urea: number; // kg per bigha
  tsp: number;
  mop: number;
  gypsum: number;
  zinc: number;
  source_org: string;
}

export interface Disease {
  name_bn: string;
  symptoms: string;
  cause_bn: string;
  treatment_bn: string;
  prevention_bn: string;
  source_org: string;
}

export interface Crop {
  id: string;
  name_bn: string;
  name_en: string;
  scientific_name: string;
  category: 'grain' | 'vegetable' | 'fruit' | 'spice' | 'flower' | 'commercial';
  seasons: string[];
  soil_preference: string[];
  water_requirement: 'low' | 'medium' | 'high';
  yield_avg: number;
  profit_avg: number;
  icon_name: string;
  fertilizers: FertilizerRule[];
  diseases: Disease[];
  cultivation_method_bn?: string;
  spacing_info_bn?: string;
  harvest_duration_bn?: string;
}

export const DISTRICTS: District[] = [
  {
    "name_bn": "ঢাকা",
    "name_en": "Dhaka",
    "lat": 23.8103,
    "lon": 90.4125
  },
  {
    "name_bn": "চট্টগ্রাম",
    "name_en": "Chittagong",
    "lat": 22.3569,
    "lon": 91.7832
  },
  {
    "name_bn": "রাজশাহী",
    "name_en": "Rajshahi",
    "lat": 24.3745,
    "lon": 88.6042
  },
  {
    "name_bn": "খুলনা",
    "name_en": "Khulna",
    "lat": 22.8456,
    "lon": 89.5403
  },
  {
    "name_bn": "বরিশাল",
    "name_en": "Barisal",
    "lat": 22.701,
    "lon": 90.3535
  },
  {
    "name_bn": "সিলেট",
    "name_en": "Sylhet",
    "lat": 24.8949,
    "lon": 91.8687
  },
  {
    "name_bn": "রংপুর",
    "name_en": "Rangpur",
    "lat": 25.7558,
    "lon": 89.2444
  },
  {
    "name_bn": "ময়মনসিংহ",
    "name_en": "Mymensingh",
    "lat": 24.7471,
    "lon": 90.4203
  },
  {
    "name_bn": "গাজীপুর",
    "name_en": "Gazipur",
    "lat": 23.9999,
    "lon": 90.4203
  },
  {
    "name_bn": "নারায়ণগঞ্জ",
    "name_en": "Narayanganj",
    "lat": 23.6238,
    "lon": 90.5
  },
  {
    "name_bn": "টাঙ্গাইল",
    "name_en": "Tangail",
    "lat": 24.2513,
    "lon": 89.9167
  },
  {
    "name_bn": "ফریدপুর",
    "name_en": "Faridpur",
    "lat": 23.6071,
    "lon": 89.8429
  },
  {
    "name_bn": "নরসিংদী",
    "name_en": "Narsingdi",
    "lat": 23.9229,
    "lon": 90.7177
  },
  {
    "name_bn": "মানিকগঞ্জ",
    "name_en": "Manikganj",
    "lat": 23.8644,
    "lon": 90.0047
  },
  {
    "name_bn": "মুন্সীগঞ্জ",
    "name_en": "Munshiganj",
    "lat": 23.5433,
    "lon": 90.5354
  },
  {
    "name_bn": "কক্সবাজার",
    "name_en": "Cox's Bazar",
    "lat": 21.4272,
    "lon": 92.0058
  },
  {
    "name_bn": "কুমিল্লা",
    "name_en": "Comilla",
    "lat": 23.4607,
    "lon": 91.1809
  },
  {
    "name_bn": "নোয়াখালী",
    "name_en": "Noakhali",
    "lat": 22.8698,
    "lon": 91.0996
  },
  {
    "name_bn": "ফেনী",
    "name_en": "Feni",
    "lat": 23.0116,
    "lon": 91.3976
  },
  {
    "name_bn": "ব্রাহ্মণবাড়িয়া",
    "name_en": "Brahmanbaria",
    "lat": 23.9571,
    "lon": 91.1119
  },
  {
    "name_bn": "চাঁদপুর",
    "name_en": "Chandpur",
    "lat": 23.2321,
    "lon": 90.6631
  },
  {
    "name_bn": "লক্ষ্মীপুর",
    "name_en": "Lakshmipur",
    "lat": 22.9425,
    "lon": 90.8411
  },
  {
    "name_bn": "রাঙ্গামাটি",
    "name_en": "Rangamati",
    "lat": 22.6574,
    "lon": 92.1774
  },
  {
    "name_bn": "বান্দরবান",
    "name_en": "Bandarban",
    "lat": 22.1953,
    "lon": 92.2184
  },
  {
    "name_bn": "খাগড়াছড়ি",
    "name_en": "Khagrachhari",
    "lat": 23.1193,
    "lon": 91.9839
  },
  {
    "name_bn": "বগুড়া",
    "name_en": "Bogra",
    "lat": 24.8481,
    "lon": 89.373
  },
  {
    "name_bn": "পাবনা",
    "name_en": "Pabna",
    "lat": 24.0063,
    "lon": 89.2378
  },
  {
    "name_bn": "সিরাজগঞ্জ",
    "name_en": "Sirajganj",
    "lat": 24.4577,
    "lon": 89.708
  },
  {
    "name_bn": "নওগাঁ",
    "name_en": "Naogaon",
    "lat": 24.7936,
    "lon": 88.9318
  },
  {
    "name_bn": "নাটোর",
    "name_en": "Natore",
    "lat": 24.4102,
    "lon": 89.0076
  },
  {
    "name_bn": "জয়পুরহাট",
    "name_en": "Joypurhat",
    "lat": 25.0947,
    "lon": 89.02
  },
  {
    "name_bn": "চাঁপাইনবাবগঞ্জ",
    "name_en": "Chapainawabganj",
    "lat": 24.5965,
    "lon": 88.2777
  },
  {
    "name_bn": "দিনাজপুর",
    "name_en": "Dinajpur",
    "lat": 25.6279,
    "lon": 88.6378
  },
  {
    "name_bn": "কুড়িগ্রাম",
    "name_en": "Kurigram",
    "lat": 25.8054,
    "lon": 89.6361
  },
  {
    "name_bn": "গাইবান্ধা",
    "name_en": "Gaibandha",
    "lat": 25.3287,
    "lon": 89.528
  },
  {
    "name_bn": "লালমনিরহাট",
    "name_en": "Lalmonirhat",
    "lat": 25.9122,
    "lon": 89.4489
  },
  {
    "name_bn": "নীলফামারী",
    "name_en": "Nilphamari",
    "lat": 25.9417,
    "lon": 88.8417
  },
  {
    "name_bn": "পঞ্চগড়",
    "name_en": "Panchagarh",
    "lat": 26.3411,
    "lon": 88.5541
  },
  {
    "name_bn": "ঠাকুরগাঁও",
    "name_en": "Thakurgaon",
    "lat": 26.0336,
    "lon": 88.4617
  },
  {
    "name_bn": "যশোর",
    "name_en": "Jessore",
    "lat": 23.1664,
    "lon": 89.2081
  },
  {
    "name_bn": "সাতক্ষীরা",
    "name_en": "Satkhira",
    "lat": 22.7185,
    "lon": 89.0705
  },
  {
    "name_bn": "বাগেরহাট",
    "name_en": "Bagerhat",
    "lat": 22.6516,
    "lon": 89.7859
  },
  {
    "name_bn": "কুষ্টিয়া",
    "name_en": "Kushtia",
    "lat": 23.9014,
    "lon": 89.1204
  },
  {
    "name_bn": "ঝিনাইদহ",
    "name_en": "Jhenaidah",
    "lat": 23.545,
    "lon": 89.1726
  },
  {
    "name_bn": "মাগুরা",
    "name_en": "Magura",
    "lat": 23.4873,
    "lon": 89.4199
  },
  {
    "name_bn": "মেহেরপুর",
    "name_en": "Meherpur",
    "lat": 23.7622,
    "lon": 88.6318
  },
  {
    "name_bn": "নড়াইল",
    "name_en": "Narail",
    "lat": 23.1725,
    "lon": 89.5126
  },
  {
    "name_bn": "চুয়াডাঙ্গা",
    "name_en": "Chuadanga",
    "lat": 23.6401,
    "lon": 88.8524
  },
  {
    "name_bn": "পটুয়াখালী",
    "name_en": "Patuakhali",
    "lat": 22.3597,
    "lon": 90.3297
  },
  {
    "name_bn": "ভোলা",
    "name_en": "Bhola",
    "lat": 22.6859,
    "lon": 90.644
  },
  {
    "name_bn": "পিরোজপুর",
    "name_en": "Pirojpur",
    "lat": 22.5791,
    "lon": 89.9751
  },
  {
    "name_bn": "বরগুনা",
    "name_en": "Barguna",
    "lat": 22.1591,
    "lon": 90.1255
  },
  {
    "name_bn": "ঝালকাঠি",
    "name_en": "Jhalokati",
    "lat": 22.6438,
    "lon": 90.1968
  },
  {
    "name_bn": "হবিগঞ্জ",
    "name_en": "Habiganj",
    "lat": 24.3749,
    "lon": 91.4155
  },
  {
    "name_bn": "মৌলভীবাজার",
    "name_en": "Moulvibazar",
    "lat": 24.4829,
    "lon": 91.7685
  },
  {
    "name_bn": "সুনামগঞ্জ",
    "name_en": "Sunamganj",
    "lat": 25.066,
    "lon": 91.3992
  },
  {
    "name_bn": "শেরপুর",
    "name_en": "Sherpur",
    "lat": 25.0189,
    "lon": 90.0175
  },
  {
    "name_bn": "নেত্রকোণা",
    "name_en": "Netrokona",
    "lat": 24.878,
    "lon": 90.727
  },
  {
    "name_bn": "জামালপুর",
    "name_en": "Jamalpur",
    "lat": 24.9197,
    "lon": 89.9481
  },
  {
    "name_bn": "গোপালগঞ্জ",
    "name_en": "Gopalganj",
    "lat": 23.0094,
    "lon": 89.8252
  },
  {
    "name_bn": "মাদারীপুর",
    "name_en": "Madaripur",
    "lat": 23.1663,
    "lon": 90.187
  },
  {
    "name_bn": "শরীয়তপুর",
    "name_en": "Shariatpur",
    "lat": 23.2163,
    "lon": 90.3541
  },
  {
    "name_bn": "রাজবাড়ী",
    "name_en": "Rajbari",
    "lat": 23.7574,
    "lon": 89.6384
  }
];

export const CROPS: Crop[] = [
  {
    "id": "1",
    "name_bn": "ধান (বোরো)",
    "name_en": "Boro Rice",
    "scientific_name": "Oryza sativa",
    "category": "grain",
    "seasons": [
      "বোরো",
      "রবি"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল (Clay)"
    ],
    "water_requirement": "high",
    "yield_avg": 6.2,
    "profit_avg": 12000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "বোরো",
        "urea": 35,
        "tsp": 12,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ধান (বোরো) ধানের ব্লাস্ট রোগ",
        "symptoms": "পাতায় চোখের মতো দাগ। কপার অক্সিক্লোরাইড স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "উর্বর দোআঁশ বা এঁটেল মাটিতে বীজতলায় প্রথমে চারা তৈরি করতে হবে। এরপর মূল জমি ৩-৪ বার চাষ দিয়ে কাদা করে ২৫-৩০ দিন বয়সের চারা রোপণ করতে হবে। ধানের জমিতে সর্বদা হালকা পানি (১-২ ইঞ্চি) ধরে রাখতে হবে এবং আগাছা নিয়মিত পরিষ্কার করতে হবে। শেষ কিস্তির ইউরিয়া সার দেওয়ার সময় বিশেষ নজর দিন।",
    "spacing_info_bn": "সারি থেকে সারি ২০ সেমি এবং গুছি থেকে গুছি ১৫ সেমি দূরত্ব বজায় রাখুন। প্রতি গুছিতে ২-৩টি সুস্থ চারা রোপণ করুন। রোপণের গভীরতা ৩-৪ সেমি রাখা বাঞ্ছনীয়।",
    "harvest_duration_bn": "রোপণের ১১০-১৪০ দিন পর, যখন ছড়ার ৮০% ধান সোনালী বা খড়ের রঙ ধারণ করবে, তখন ফসল কাটতে হবে। কাটা ধান রোদে ভালো করে শুকিয়ে আর্দ্রতা ১২% এর নিচে এনে গুদামজাত করতে হবে।"
  },
  {
    "id": "2",
    "name_bn": "ধান (আমন)",
    "name_en": "Aman Rice",
    "scientific_name": "Oryza sativa",
    "category": "grain",
    "seasons": [
      "আমন",
      "খরিপ"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল (Clay)"
    ],
    "water_requirement": "high",
    "yield_avg": 4.5,
    "profit_avg": 9500,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "আমন",
        "urea": 25,
        "tsp": 10,
        "mop": 12,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ধান (আমন) খোলপোড়া রোগ",
        "symptoms": "খাপের গায়ে দাগ। সুষম পটাশ ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "উর্বর দোআঁশ বা এঁটেল মাটিতে বীজতলায় প্রথমে চারা তৈরি করতে হবে। এরপর মূল জমি ৩-৪ বার চাষ দিয়ে কাদা করে ২৫-৩০ দিন বয়সের চারা রোপণ করতে হবে। ধানের জমিতে সর্বদা হালকা পানি (১-২ ইঞ্চি) ধরে রাখতে হবে এবং আগাছা নিয়মিত পরিষ্কার করতে হবে। শেষ কিস্তির ইউরিয়া সার দেওয়ার সময় বিশেষ নজর দিন।",
    "spacing_info_bn": "সারি থেকে সারি ২০ সেমি এবং গুছি থেকে গুছি ১৫ সেমি দূরত্ব বজায় রাখুন। প্রতি গুছিতে ২-৩টি সুস্থ চারা রোপণ করুন। রোপণের গভীরতা ৩-৪ সেমি রাখা বাঞ্ছনীয়।",
    "harvest_duration_bn": "রোপণের ১১০-১৪০ দিন পর, যখন ছড়ার ৮০% ধান সোনালী বা খড়ের রঙ ধারণ করবে, তখন ফসল কাটতে হবে। কাটা ধান রোদে ভালো করে শুকিয়ে আর্দ্রতা ১২% এর নিচে এনে গুদামজাত করতে হবে।"
  },
  {
    "id": "3",
    "name_bn": "ধান (আউশ)",
    "name_en": "Aus Rice",
    "scientific_name": "Oryza sativa",
    "category": "grain",
    "seasons": [
      "আউশ",
      "খরিপ"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "high",
    "yield_avg": 3.2,
    "profit_avg": 7000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "আউশ",
        "urea": 20,
        "tsp": 8,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ধান (আউশ) টুংরো রোগ",
        "symptoms": "পাতা হলুদ ও লালচে। সবুজ পাতা ফড়িং দমন করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "উর্বর দোআঁশ বা এঁটেল মাটিতে বীজতলায় প্রথমে চারা তৈরি করতে হবে। এরপর মূল জমি ৩-৪ বার চাষ দিয়ে কাদা করে ২৫-৩০ দিন বয়সের চারা রোপণ করতে হবে। ধানের জমিতে সর্বদা হালকা পানি (১-২ ইঞ্চি) ধরে রাখতে হবে এবং আগাছা নিয়মিত পরিষ্কার করতে হবে। শেষ কিস্তির ইউরিয়া সার দেওয়ার সময় বিশেষ নজর দিন।",
    "spacing_info_bn": "সারি থেকে সারি ২০ সেমি এবং গুছি থেকে গুছি ১৫ সেমি দূরত্ব বজায় রাখুন। প্রতি গুছিতে ২-৩টি সুস্থ চারা রোপণ করুন। রোপণের গভীরতা ৩-৪ সেমি রাখা বাঞ্ছনীয়।",
    "harvest_duration_bn": "রোপণের ১১০-১৪০ দিন পর, যখন ছড়ার ৮০% ধান সোনালী বা খড়ের রঙ ধারণ করবে, তখন ফসল কাটতে হবে। কাটা ধান রোদে ভালো করে শুকিয়ে আর্দ্রতা ১২% এর নিচে এনে গুদামজাত করতে হবে।"
  },
  {
    "id": "4",
    "name_bn": "গম",
    "name_en": "Wheat",
    "scientific_name": "Triticum aestivum",
    "category": "grain",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 3.6,
    "profit_avg": 8000,
    "icon_name": "Wheat",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 22,
        "tsp": 14,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "গম গমের ব্লাস্ট",
        "symptoms": "শীষ সাদা হয়ে শুকিয়ে যায়। ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "গম চাষের জন্য দোআঁশ ও বেলে দোআঁশ মাটি সবচেয়ে উপযোগী। নভেম্বর মাসের মধ্যে জমি শুকনো ও ঝুরঝুরে করে ৪-৫ বার চাষ ও মই দিয়ে বীজ বপন করতে হবে। গম গাছে ৩টি প্রধান সেচ দেওয়া জরুরি: ১ম চারা গজানোর ২০-২৫ দিন পর (শিকড় গজানোর সময়), ২য় মোচা বের হওয়ার সময় (৫৫-৬০ দিন) এবং ৩য় দানা বাঁধার সময় (৭৫-৮০ দিন)।",
    "spacing_info_bn": "সারি থেকে সারি ২০ সেমি দূরত্বে বীজ বপন করুন। বপনের গভীরতা ৩-৫ সেমি হওয়া উচিত। বিঘা প্রতি ১৫-১৬ কেজি ভালো মানের শোধিত বীজ প্রয়োজন।",
    "harvest_duration_bn": "বীজ বপনের ১১৫-১২৫ দিন পর ফসল কাটার উপযোগী হয়। সম্পূর্ণ গাছ সোনালী বর্ণ ধারণ করলে এবং পাতা শুকিয়ে গেলে কেটে নিতে হবে। মাড়াইয়ের পর দানা রোদে শুকিয়ে ঠাণ্ডা করে সংরক্ষণ করতে হবে।"
  },
  {
    "id": "5",
    "name_bn": "ভুট্টা",
    "name_en": "Maize",
    "scientific_name": "Zea mays",
    "category": "grain",
    "seasons": [
      "রবি",
      "খরিপ"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 8.5,
    "profit_avg": 15000,
    "icon_name": "Wheat",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 45,
        "tsp": 20,
        "mop": 22,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ভুট্টা পাতা ঝলসানো রোগ",
        "symptoms": "পাতায় লম্বাটে দাগ। প্রোপিকোনাজোল ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "ভুট্টা চাষের জন্য সুনিষ্কাশিত বেলে দোআঁশ বা দোআঁশ মাটি উপযোগী। জমি গভীর চাষ দিয়ে ঝুরঝুরে করে বীজ বপন করতে হবে। ভুট্টা গাছে পর্যাপ্ত পরিমাণে নাইট্রোজেন, পটাশ ও বোরণ সার প্রয়োগ করলে দানার আকার ও ফলন ভালো হয়। ফুল আসার সময় ও দানা বাঁধার সময় নিয়মিত সেচ দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারি ৬০ সেমি এবং গাছ থেকে গাছ ২৫ সেমি দূরত্বে বীজ বপন করতে হবে। প্রতি গর্তে ১-২টি বীজ ৩-৪ সেমি গভীরতায় বপন করতে হবে।",
    "harvest_duration_bn": "বপনের ১২০-১৪৫ দিন পর মোচার খোসা শুকিয়ে সোনালী বর্ণ ধারণ করলে এবং দানার গোড়ায় কালো দাগ দেখা দিলে সংগ্রহ করতে হবে। সংগ্রহের পর মোচা ভালো করে রোদে শুকাতে হবে।"
  },
  {
    "id": "6",
    "name_bn": "আলু",
    "name_en": "Potato",
    "scientific_name": "Solanum tuberosum",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 20.5,
    "profit_avg": 18000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 30,
        "tsp": 22,
        "mop": 25,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "আলু আলুর নাবি ধসা",
        "symptoms": "পাতায় ভেজা কালো দাগ। রিডোমিল গোল্ড স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "আলু চাষের জন্য নরম ও উর্বর দোআঁশ মাটি উপযুক্ত। জমি ৫-৬ বার চাষ ও মই দিয়ে মাটির ঢেলা ভালো করে ভেঙে ঝুরঝুরে করে বীজ আলু রোপণ করতে হবে। আলু গজানোর পর মাটির নিচে আলু বড় হওয়ার জন্য দুই পাশে মাটি তুলে আইল উঁচু করে দিতে হবে। নিয়মিত হালকা সেচ দিতে হবে, খেয়াল রাখতে হবে যেন পানি জমে না থাকে।",
    "spacing_info_bn": "লাইন থেকে লাইন ৬০ সেমি এবং বীজ আলু থেকে আলুর দূরত্ব ২৫ সেমি বজায় রাখুন। আলু মাটির নিচে ৮-১০ সেমি গভীরে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ৮০-৯০ দিন পর আলুর গাছ যখন সম্পূর্ণ হলুদ হয়ে মরে শুকিয়ে যায়, তখন আলু তোলার উপযুক্ত সময়। তোলার ৭-১০ দিন আগে গাছের উপরিভাগের ডালপালা কেটে ফেলে রাখলে আলুর চামড়া শক্ত হয়।"
  },
  {
    "id": "7",
    "name_bn": "টমেটো",
    "name_en": "Tomato",
    "scientific_name": "Solanum lycopersicum",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 25,
    "profit_avg": 22000,
    "icon_name": "Tomato",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 28,
        "tsp": 18,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "টমেটো লেট ব্লাইট",
        "symptoms": "পাতায় পচন ধরে ও গন্ধ বের হয়। ডাইথেন এম-৪৫ দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "টমেটো দোআঁশ ও বেলে দোআঁশ মাটিতে খুব ভালো জন্মে। বীজতলায় ৩০-৩৫ দিন বয়সের সুস্থ সবল চারা তৈরি করে মূল জমিতে রোপণ করতে হবে। ফল ধরার পর প্রতিটি গাছে বাঁশের খুঁটি বা মাচা দিয়ে ঠেস দেওয়ার ব্যবস্থা করতে হবে যাতে ফলের ভারে গাছ হেলে না পড়ে এবং ফল মাটিতে লেগে পচে না যায়।",
    "spacing_info_bn": "সারি থেকে সারি ৬০ সেমি এবং গাছ থেকে গাছ ৪০ সেমি দূরত্বে চারা রোপণ করুন। চারা রোপণের পর হালকা সেচ দেওয়া অত্যন্ত জরুরি।",
    "harvest_duration_bn": "চারা রোপণের ৭০-৯০ দিন পর ফল সংগ্রহ করা যায়। ঘরের ব্যবহারের জন্য আংশিক লাল এবং দূরবর্তী বাজারে বিক্রির জন্য সম্পূর্ণ লাল বা হালকা লালচে হলুদ পরিপক্ব অবস্থায় সংগ্রহ করুন।"
  },
  {
    "id": "8",
    "name_bn": "বেগুন",
    "name_en": "Brinjal",
    "scientific_name": "Solanum melongena",
    "category": "vegetable",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 18,
    "profit_avg": 15000,
    "icon_name": "Egg",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 25,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "বেগুন ডগা ও ফল ছিদ্রকারী পোকা",
        "symptoms": "ডগা নেতিয়ে পড়ে। ক্যারাটে বা ফেরোমন ফাঁদ ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "বেগুন একটি দীর্ঘমেয়াদী এবং খরা সহনশীল ফসল হলেও ফলন বৃদ্ধির জন্য নিয়মিত সেচ প্রয়োজন। জমি ভালোভাবে গভীর চাষ দিয়ে ঝুরঝুরে করে চারা রোপণ করতে হবে। ডগা ও ফল ছিদ্রকারী পোকা দমনে নিয়মিত আক্রান্ত অংশ কেটে ধ্বংস করতে হবে এবং ফেরোমন ফাঁদ ব্যবহার করা উত্তম।",
    "spacing_info_bn": "সারি থেকে সারি ৭৫ সেমি এবং গাছ থেকে গাছ ৬০ সেমি দূরত্ব রাখতে হবে। প্রতি মাদায় একটি করে সুস্থ চারা রোপণ করুন।",
    "harvest_duration_bn": "চারা রোপণের ৬০-৮০ দিনের মধ্যে বেগুন তোলা শুরু করা যায়। ফল বীজ হওয়ার আগে, চকচকে ও নরম থাকতে থাকতে সংগ্রহ করতে হবে।"
  },
  {
    "id": "9",
    "name_bn": "পটল",
    "name_en": "Pointed Gourd",
    "scientific_name": "Trichosanthes dioica",
    "category": "vegetable",
    "seasons": [
      "খরিপ"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 12,
    "profit_avg": 14000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 18,
        "tsp": 12,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পটল শিকড় পচা রোগ",
        "symptoms": "গাছ শুকিয়ে মরে যায়। গোড়ায় ম্যানকোজেব স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পটল চাষের জন্য বেলে দোআঁশ বা পলি মাটি সবচেয়ে উপযোগী। মাটির নিচে শিকড় গজানোর জন্য গভীর করে জমি চাষ দিতে হয়। পটল গাছের পুরুষ ও স্ত্রী ফুলের অনুপাত ১০:১ রাখা প্রয়োজন যাতে পরাগায়ন সঠিকভাবে সম্পন্ন হয়। সকালে কৃত্রিম পরাগায়ন দিলে ফলন অনেক বৃদ্ধি পায়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব হতে হবে ২ মিটার এবং মাদায় গাছ থেকে গাছের দূরত্ব হতে হবে ১ মিটার। প্রতিটি গর্ত বা মাদার গভীরতা হতে হবে ৪৫ সেমি।",
    "harvest_duration_bn": "রোপণের ৮০-৯০ দিন পর পটল তোলা শুরু হয়। সপ্তাহে ২-৩ বার কচি অবস্থায় পটল তুলে নিতে হবে।"
  },
  {
    "id": "10",
    "name_bn": "করলা",
    "name_en": "Bitter Gourd",
    "scientific_name": "Momordica charantia",
    "category": "vegetable",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 15,
    "profit_avg": 16000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 20,
        "tsp": 15,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "করলা ডাউনি মিলডিউ",
        "symptoms": "পাতার নিচে সাদা পাউডার। ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "সুনিষ্কাশিত বেলে দোআঁশ মাটিতে করলা খুব ভালো জন্মে। জমি চাষ দিয়ে মাদা তৈরি করতে হবে। প্রতিটি মাদায় গোবর সার ও টিএসপি মিশিয়ে বীজ বপন করতে হবে। করলা গাছের ডগা বা লতা ছড়িয়ে দেওয়ার জন্য বাঁশের বা জালের মাচা তৈরি করে দিতে হবে। নিয়মিত পানি সেচ দেওয়া এবং আগাছা পরিষ্কার করা আবশ্যক।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ১.৫ মিটার এবং মাদা থেকে মাদার দূরত্ব ১ মিটার রাখতে হবে। বীজ বপনের গভীরতা হবে ২-৩ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৬০-৭০ দিন পর করলা সংগ্রহের উপযোগী হয়। ফল সবুজ কিন্তু পরিপক্ব অবস্থায় সংগ্রহ করতে হবে, ফল হলুদ হওয়ার আগেই তুলে নিতে হবে।"
  },
  {
    "id": "11",
    "name_bn": "ফুলকপি",
    "name_en": "Cauliflower",
    "scientific_name": "Brassica oleracea",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 22,
    "profit_avg": 20000,
    "icon_name": "Flower",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 35,
        "tsp": 20,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ফুলকপি পাতা পচা রোগ",
        "symptoms": "ফুল পচে বাদামী হয়। কপার অক্সিক্লোরাইড স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "ফুলকপি চাষের জন্য উর্বর ও মাঝারি উঁচু দোআঁশ মাটি উত্তম। বীজতলায় ৩০-৩৫ দিন চারা তৈরি করে মূল জমিতে লাগাতে হবে। ইউরিয়া ও পটাশ সার কিস্তিতে উপরিপ্রয়োগ করতে হবে। ফুল বা কার্ড যখন সাদা অবস্থায় থাকে, তখন সূর্যের আলো থেকে রক্ষা করতে চারপাশের পাতা দিয়ে ফুলটি ঢেকে (ব্ল্যাঞ্চিং) দেওয়া উচিত। এতে ফুলের রঙ সাদা ও আকর্ষণীয় থাকে।",
    "spacing_info_bn": "সারি থেকে সারি ৬০ সেমি এবং গাছ থেকে গাছ ৪৫ সেমি দূরত্ব বজায় রাখতে হবে। চারা রোপণের পর হালকা পানি সেচ দিতে হবে।",
    "harvest_duration_bn": "চারা রোপণের ৭৫-৯০ দিন পর ফুলকপি পরিপক্ব হয়। ফুলটি আঁটসাঁট থাকা অবস্থায় চারপাশের ২-৩টি পাতা সহ কেটে বাজারজাত করা উচিত।"
  },
  {
    "id": "12",
    "name_bn": "বাঁধাকপি",
    "name_en": "Cabbage",
    "scientific_name": "Brassica oleracea var. capitata",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 28,
    "profit_avg": 19000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 32,
        "tsp": 18,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "বাঁধাকপি ক্লাবরুট রোগ",
        "symptoms": "শিকড় ফুলে গিঁট হয়। চুন জমিতে ছিটিয়ে দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "বাঁধাকপির জন্য উর্বর দোআঁশ ও এঁটেল দোআঁশ মাটি সবচেয়ে উপযোগী। বীজতলায় চারা তৈরি করে ২৫-৩০ দিন বয়সে রোপণ করতে হবে। জমিতে পর্যাপ্ত নাইট্রোজেন ও গোবর সার দিলে বাঁধাকপির মাথা শক্ত ও বড় হয়। গাছের গোড়ায় নিয়মিত সেচ ও নিড়ানি দিয়ে মাটি আলগা করে দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং চারা থেকে চারার দূরত্ব ৪৫ সেমি রাখতে হবে। চারা রোপণের গভীরতা ৩-৪ সেমি রাখা ভালো।",
    "harvest_duration_bn": "রোপণের ৮০-৯৫ দিন পর বাঁধাকপির মাথা শক্ত ও বাঁধতে শুরু করে। মাথাটি পুরোপুরি শক্ত হলে নিচ থেকে কেটে সংগ্রহ করতে হবে।"
  },
  {
    "id": "13",
    "name_bn": "লাল শাক",
    "name_en": "Red Amaranth",
    "scientific_name": "Amaranthus cruentus",
    "category": "vegetable",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 8,
    "profit_avg": 10000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 12,
        "tsp": 6,
        "mop": 8,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "লাল শাক পাতার সাদা মরিচা রোগ",
        "symptoms": "পাতার নিচে সাদা ফোস্কা। ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "লাল শাক প্রায় সব ধরণের মাটিতেই চাষ করা যায়, তবে দোআঁশ ও বেলে দোআঁশ মাটি সবচেয়ে ভালো। জমি ৩-৪ বার চাষ দিয়ে মাটি ঝুরঝুরে করে সমান করতে হবে। বীজ সাধারণত জমিতে ছিটিয়ে বা সারিতে বপন করা হয়। বপনের পর হালকা মাটি দিয়ে বীজ ঢেকে দিতে হবে। শাকের দ্রুত বৃদ্ধির জন্য সামান্য ইউরিয়া সার ছিটিয়ে দেওয়া এবং হালকা সেচ দেওয়া ভালো।",
    "spacing_info_bn": "সারিতে বপন করলে সারি থেকে সারির দূরত্ব ২০ সেমি এবং বীজ অত্যন্ত ঘন হলে চারা গজানোর পর পাতলা করে দিতে হবে।",
    "harvest_duration_bn": "বীজ বপনের ২০-৩০ দিনের মধ্যে লাল শাক তোলার উপযুক্ত হয়। সাধারণত কচি অবস্থায় শিকড় সহ বা গোড়া থেকে কেটে সংগ্রহ করা যায়।"
  },
  {
    "id": "14",
    "name_bn": "পালং শাক",
    "name_en": "Spinach",
    "scientific_name": "Spinacia oleracea",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 10,
    "profit_avg": 11000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 15,
        "tsp": 8,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পালং শাক পাতা ফুটোকারী পোকা",
        "symptoms": "পাতায় ক্ষুদ্র ছিদ্র। সাবান পানি স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পালং শাক চাষের জন্য উর্বর, সুনিষ্কাশিত দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। জমি ভালোভাবে চাষ দিয়ে সার মিশিয়ে বীজ বপন করতে হবে। আর্দ্রতা ধরে রাখতে নিয়মিত কিন্তু হালকা সেচ দিতে হবে। পাতার ভালো বৃদ্ধির জন্য বীজ গজানোর ১০ দিন পর একবার এবং ২০ দিন পর আরেকবার ইউরিয়া সার উপরিপ্রয়োগ করতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২৫ সেমি এবং সারির ভেতরের গাছের দূরত্ব ১০ সেমি রাখতে হবে। বীজ বপনের গভীরতা হবে ১.৫ সেমি।",
    "harvest_duration_bn": "বপনের ৩০-৪৫ দিন পর পালং শাক তোলা শুরু করা যায়। গাছের বাইরের দিকের বড় পাতাগুলো কেটে নিলে ভেতরের পাতাগুলো আবার বড় হওয়ার সুযোগ পায়।"
  },
  {
    "id": "15",
    "name_bn": "পুঁই শাক",
    "name_en": "Indian Spinach",
    "scientific_name": "Basella alba",
    "category": "vegetable",
    "seasons": [
      "খরিপ",
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 14,
    "profit_avg": 12000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 18,
        "tsp": 10,
        "mop": 12,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পুঁই শাক পাতা পোড়া দাগ",
        "symptoms": "পাতায় বেগুনী দাগ। ছত্রাকনাশক ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পুঁই শাকের জন্য উর্বর ও মাঝারি আর্দ্রতাযুক্ত দোআঁশ মাটি সবচেয়ে ভালো। জমি চাষ করে মাদা তৈরি করতে হবে অথবা সরাসরি লাইনে বীজ বপন করা যায়। গাছ একটু বড় হলে লতা বেয়ে ওঠার জন্য বাঁশের চটা বা বাউনি বা মাচা দিতে হবে। লতা ছাঁটাই করলে নতুন নতুন শাখা বা ডগা বের হয় যা ফলন বাড়ায়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ১ মিটার এবং গাছ থেকে গাছের দূরত্ব ৫০ সেমি রাখা ভালো। কাটিং বা চারা রোপণের ক্ষেত্রে গভীরতা হবে ৫-৭ সেমি।",
    "harvest_duration_bn": "বীজ বা চারা রোপণের ৪৫-৬০ দিন পর থেকে ডগা ও পাতা কাটা শুরু করা যায়। কচি ও সতেজ ডগাগুলো নিয়মিত কাটলে নতুন ডগা বের হওয়া ত্বরান্বিত হয়।"
  },
  {
    "id": "16",
    "name_bn": "ঢেঁড়স",
    "name_en": "Okra",
    "scientific_name": "Abelmoschus esculentus",
    "category": "vegetable",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 11,
    "profit_avg": 13000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 22,
        "tsp": 12,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ঢেঁড়স হলুদ শিরা মোজাইক",
        "symptoms": "পাতার শিরা হলুদ হয়। ভাইরাসের বাহক পোকা দমন করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "ঢেঁড়স চাষের জন্য গরম ও আর্দ্র আবহাওয়া এবং সুনিষ্কাশিত দোআঁশ মাটি সবচেয়ে ভালো। বীজ বপনের আগে ২৪ ঘণ্টা পানিতে ভিজিয়ে রাখলে দ্রুত চারা গজায়। ঢেঁড়স গাছে গোড়ার আগাছা পরিষ্কার রাখা অত্যন্ত জরুরি। ফলন বাড়াতে নিয়মিত ইউরিয়া সার ও সেচ দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং বীজ থেকে বীজের দূরত্ব ৩০ সেমি রাখতে হবে। বপনের গভীরতা হবে ২ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৫০-৬০ দিন পর ঢেঁড়স তোলা শুরু হয়। ফুল ফোটার ৩-৫ দিন পর যখন ঢেঁড়স কচি ও নরম থাকে তখন নিয়মিত তুলে নিতে হবে, আঁশ হয়ে গেলে স্বাদ নষ্ট হয়ে যায়।"
  },
  {
    "id": "17",
    "name_bn": "শসা",
    "name_en": "Cucumber",
    "scientific_name": "Cucumis sativus",
    "category": "vegetable",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 18,
    "profit_avg": 17000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 25,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "শসা অ্যানথ্রাকনোজ",
        "symptoms": "পাতায় তামাটে দাগ। রিডোমিল গোল্ড স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "উর্বর বেলে দোআঁশ ও দোআঁশ মাটি শসা চাষের জন্য উপযোগী। মাটিতে জোঁ বা জো থাকা অবস্থায় বীজ বপন করা ভালো। শসা গাছের বৃদ্ধির জন্য মাচা দেওয়া অত্যন্ত জরুরি। ফল ধরা শুরু হলে গাছের গোড়ায় পর্যাপ্ত পানি সেচ দিতে হবে যাতে শসা তিতা না হয়ে যায়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ১.৫ মিটার এবং মাদা থেকে মাদার দূরত্ব ১ মিটার রাখতে হবে। প্রতি মাদায় ২-৩টি বীজ বুনে পরে সুস্থ ১টি চারা রাখতে হবে।",
    "harvest_duration_bn": "বীজ বপনের ৫০-৬০ দিন পর ফল ধরা শুরু হয়। শসা কচি ও সবুজ থাকা অবস্থায় সংগ্রহ করতে হবে। দেরি হলে শসা হলুদ ও শক্ত হয়ে যায়।"
  },
  {
    "id": "18",
    "name_bn": "মিষ্টি কুমড়া",
    "name_en": "Sweet Gourd",
    "scientific_name": "Cucurbita moschata",
    "category": "vegetable",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 20,
    "profit_avg": 14000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 20,
        "tsp": 15,
        "mop": 16,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "মিষ্টি কুমড়া পাউডারি মিলডিউ",
        "symptoms": "পাতার উপরে সাদা পাউডার। সালফার স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "মিষ্টি কুমড়া চাষের জন্য বেলে দোআঁশ বা দোআঁশ মাটি সবচেয়ে ভালো। জমি চাষ দিয়ে বড় আকারের মাদা তৈরি করতে হয়। মাদায় প্রচুর গোবর সার ও রাসায়নিক সার মিশিয়ে বীজ বপন করতে হবে। মিষ্টি কুমড়ার গাছ মাটির উপর লতিয়ে চলে। পরাগায়ন ভালো করার জন্য সকালে স্ত্রী ও পুরুষ ফুলের মিলন বা কৃত্রিম পরাগায়ন করানো যেতে পারে।",
    "spacing_info_bn": "মাদা থেকে মাদার দূরত্ব হতে হবে ২.৫ মিটার এবং লাইনের দূরত্ব ৩ মিটার। প্রতিটি মাদায় ২ সেমি গভীরতায় বীজ বপন করতে হবে।",
    "harvest_duration_bn": "বপনের ৯০-১২০ দিন পর মিষ্টি কুমড়া পরিপক্ব হয়। ফলের বোঁটা শক্ত ও খড়ের রঙ ধারণ করলে এবং গায়ের চামড়া শক্ত ও উজ্জ্বল বর্ণ ধারণ করলে ফল সংগ্রহ করতে হবে।"
  },
  {
    "id": "19",
    "name_bn": "লাউ",
    "name_en": "Bottle Gourd",
    "scientific_name": "Lagenaria siceraria",
    "category": "vegetable",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 25,
    "profit_avg": 18000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 24,
        "tsp": 16,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "লাউ ফলের মাছি পোকা",
        "symptoms": "ফল পচে ঝরে পড়ে। সেক্স ফেরোমন ফাঁদ ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "লাউ চাষের জন্য সুনিষ্কাশিত, উর্বর দোআঁশ মাটি উত্তম। বড় গর্ত বা মাদা তৈরি করে বীজ বপন করতে হবে। লাউ গাছ খুব দ্রুত বাড়ে এবং প্রচুর পানির প্রয়োজন হয়, তাই গাছের গোড়ায় নিয়মিত সেচ নিশ্চিত করতে হবে। লতাগুলো বাঁশের মাচায় তুলে দিতে হবে এবং মরা পাতা ছেঁটে দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৩ মিটার এবং মাদা থেকে মাদার দূরত্ব ২ মিটার রাখা বাঞ্ছনীয়। বীজ ২-৩ সেমি গভীরতায় বপন করতে হবে।",
    "harvest_duration_bn": "বীজ বপনের ৭০-৯০ দিনের মধ্যে লাউ তোলার উপযুক্ত হয়। লাউ কচি, উজ্জ্বল সবুজ ও গায়ের পশম নরম থাকা অবস্থায় সংগ্রহ করা উচিত।"
  },
  {
    "id": "20",
    "name_bn": "গাজর",
    "name_en": "Carrot",
    "scientific_name": "Daucus carota",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 18,
    "profit_avg": 16000,
    "icon_name": "Carrot",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 20,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "গাজর গাজরের পাতা ঝলসানো",
        "symptoms": "পাতা শুকিয়ে লালচে হয়। ছত্রাকনাশক দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "গাজরের জন্য গভীর ও ঝুরঝুরে বেলে দোআঁশ বা পলি দোআঁশ মাটি আবশ্যক, কারণ মাটি শক্ত হলে গাজর আঁকাবাঁকা ও ফেটে যায়। জমি গভীরভাবে ৫-৬ বার চাষ ও মই দিয়ে ঢেলা ভেঙে ধুলোর মতো করে বীজ বপন করতে হবে। বীজ বপনের পর হালকা সেচ দিতে হবে এবং চারা গজানোর পর অতিরিক্ত চারা তুলে পাতলা করে দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২৫ সেমি এবং চারা থেকে চারার দূরত্ব ১০ সেমি রাখতে হবে। বীজ বপনের গভীরতা হবে ০.৫-১ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৮৫-১০০ দিন পর গাজর তোলার উপযুক্ত হয়। গাজরের উপরিভাগের পাতাগুলো কিছুটা হলুদ হয়ে এলে মাটি খুঁড়ে গাজর তুলে ভালো করে ধুয়ে নিতে হবে।"
  },
  {
    "id": "21",
    "name_bn": "মুলা",
    "name_en": "Radish",
    "scientific_name": "Raphanus sativus",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 22,
    "profit_avg": 12000,
    "icon_name": "Carrot",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 18,
        "tsp": 12,
        "mop": 14,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "মুলা মূল পচা রোগ",
        "symptoms": "মূল পচে নরম হয়। পানি নিষ্কাশন ব্যবস্থা ভালো রাখুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "মুলা চাষের জন্য উর্বর বেলে দোআঁশ মাটি সবচেয়ে উপযোগী। মুলা দ্রুত বর্ধনশীল একটি মূল জাতীয় সবজি। জমি ভালোভাবে চাষ করে সার প্রয়োগ করতে হবে। মাটি আর্দ্র থাকলে মুলার আকার ও স্বাদ ভালো হয়, অন্যথায় মুলা শক্ত ও ঝাঁঝালো হয়ে যায়। নিয়মিত নিড়ানি ও গোড়ায় মাটি তুলে দেওয়া প্রয়োজন।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৩০ সেমি এবং চারা থেকে চারার দূরত্ব ১৫ সেমি রাখতে হবে। বীজ বপনের গভীরতা হবে ১.৫ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৪০-৫০ দিনের মধ্যে মুলা তুলে নিতে হবে। মুলা কচি ও নরম থাকতেই সংগ্রহ করা উচিত, বেশি দিন রাখলে ভেতরে ফাঁপা হয়ে যায়।"
  },
  {
    "id": "22",
    "name_bn": "শিম",
    "name_en": "Hyacinth Bean",
    "scientific_name": "Lablab purpureus",
    "category": "vegetable",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 10,
    "profit_avg": 14000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 15,
        "tsp": 12,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "শিম শিমের জাব পোকা",
        "symptoms": "কচি ডগায় কালো পোকা। ছাই অথবা সেভিন দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "উর্বর দোআঁশ মাটিতে শিম খুব ভালো জন্মায়। সাধারণত বর্ষার শেষের দিকে বীজ বপন করতে হবে। শিম গাছের লতা ছড়িয়ে দেওয়ার জন্য শক্ত বাঁশের মাচা তৈরি করা প্রয়োজন। বালাই দমনে জৈব বালাইনাশক ব্যবহার করতে হবে এবং ফুল বা ফল আসার সময় নিয়মিত সেচ দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২.৫ মিটার এবং মাদা থেকে মাদার দূরত্ব ১.৫ মিটার রাখতে হবে। বীজ বপনের গভীরতা হবে ৩ সেমি।",
    "harvest_duration_bn": "বপনের ১০০-১২০ দিন পর শিম তোলা শুরু হয়। শিমের ভেতরের বীজ বা দানা শক্ত হওয়ার আগে, কচি অবস্থায় শিম ছিঁড়ে সংগ্রহ করতে হবে।"
  },
  {
    "id": "23",
    "name_bn": "বরবটি",
    "name_en": "Yardlong Bean",
    "scientific_name": "Vigna unguiculata subsp. sesquipedalis",
    "category": "vegetable",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 12,
    "profit_avg": 13000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 16,
        "tsp": 12,
        "mop": 12,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "বরবটি মরিচা রোগ",
        "symptoms": "পাতায় মরিচার মতো দাগ। সালফার স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "বরবটি চাষের জন্য উর্বর দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। বর্ষাকালে জল নিষ্কাশনের ভালো সুবিধা থাকতে হবে। বরবটি গাছে বাউনি বা জাংলা দেওয়া প্রয়োজন যাতে লতা সহজেই বেয়ে উঠতে পারে। নাইট্রোজেন সার কম লাগে কারণ শিকড়ে রাইজোবিয়াম ব্যাকটেরিয়া বাতাস থেকে নাইট্রোজেন জমা করে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং বীজ থেকে বীজের দূরত্ব ২৫ সেমি রাখতে হবে। বীজ বপনের গভীরতা ২-৩ সেমি রাখা বাঞ্ছনীয়।",
    "harvest_duration_bn": "বীজ বপনের ৬০-৭০ দিন পর থেকে বরবটি সংগ্রহ শুরু হয়। সপ্তাহে ২-৩ বার কচি ও নরম অবস্থায় বরবটি তোলা উচিত, দানা শক্ত হলে বাজারমূল্য কমে যায়।"
  },
  {
    "id": "24",
    "name_bn": "পেঁয়াজ",
    "name_en": "Onion",
    "scientific_name": "Allium cepa",
    "category": "spice",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 14.5,
    "profit_avg": 20000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 24,
        "tsp": 18,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পেঁয়াজ পার্পল ব্লচ (বেগুনি দাগ)",
        "symptoms": "পাতায় বেগুনি দাগ পড়ে। রোভরাল স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পেঁয়াজ চাষের জন্য সুনিষ্কাশিত বেলে দোআঁশ বা পলি দোআঁশ মাটি সবচেয়ে উত্তম। পেঁয়াজ কন্দ জাতীয় মসলা ফসল, তাই মাটির উপরিভাগ ঝুরঝুরে রাখা প্রয়োজন। বীজতলায় চারা তৈরি করে মূল জমিতে রোপণ করতে হবে। কন্দের বৃদ্ধির সময় জমিতে পর্যাপ্ত আর্দ্রতা থাকতে হবে, তবে পরিপক্বতার সময় পানি নিষ্কাশন করতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ১৫ সেমি এবং চারা থেকে চারার দূরত্ব ১০ সেমি রাখা উচিত। চারা ২-৩ সেমি গভীরে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ৯০-১১০ দিন পর পেঁয়াজ পরিপক্ব হয়। গাছের পাতা হলুদ হয়ে ভেঙে পড়লে পেঁয়াজ তুলে নিতে হবে। তোলার পর কয়েক দিন ছায়াযুক্ত স্থানে শুকিয়ে সংরক্ষণ করতে হবে।"
  },
  {
    "id": "25",
    "name_bn": "রসুন",
    "name_en": "Garlic",
    "scientific_name": "Allium sativum",
    "category": "spice",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "পলি দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 8.5,
    "profit_avg": 25000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 22,
        "tsp": 16,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "রসুন পাতা ঝলসানো রোগ",
        "symptoms": "পাতা হলুদ হয়ে শুকিয়ে যায়। ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "রসুন চাষের জন্য উর্বর দোআঁশ ও সুনিষ্কাশিত বেলে দোআঁশ মাটি উপযোগী। রসুনের কোয়া সরাসরি মাটিতে রোপণ করা হয়। রসুনের জমিতে আর্দ্রতা বজায় রাখতে খড় বা কুঁড়ো দিয়ে মালচিং বা আচ্ছাদন দিলে ফলন ও কন্দের আকার ভালো হয়। নিয়মিত সেচ ও নিড়ানি দিয়ে মাটি আলগা রাখা জরুরি।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২০ সেমি এবং কোয়া থেকে কোয়ার দূরত্ব ১০ সেমি রাখতে হবে। রসুনের কোয়া ৩-৪ সেমি গভীরতায় রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ১২০-১৪০ দিন পর গাছের পাতা শুকিয়ে বাদামী হয়ে ভেঙে পড়লে রসুন তুলতে হবে। রসুন ভালো করে বাতাসে শুকিয়ে ঠাণ্ডা স্থানে সংরক্ষণ করতে হবে।"
  },
  {
    "id": "26",
    "name_bn": "আদা",
    "name_en": "Ginger",
    "scientific_name": "Zingiber officinale",
    "category": "spice",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 15,
    "profit_avg": 30000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 30,
        "tsp": 20,
        "mop": 22,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "আদা কন্দ পচা রোগ",
        "symptoms": "গাছ হলুদ ও গোড়া পচে। ট্রাইকোডার্মা দিয়ে শোধন করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "আদা চাষের জন্য উর্বর দোআঁশ মাটি এবং আংশিক ছায়াযুক্ত স্থান সবচেয়ে ভালো। জমি গভীরভাবে চাষ দিয়ে জৈব সার মিশিয়ে কান্দি বা বেড তৈরি করে আদা রোপণ করতে হবে। আদার কন্দ বৃদ্ধির জন্য মে থেকে সেপ্টেম্বর মাসে প্রচুর আর্দ্রতার প্রয়োজন হয়, কিন্তু পানি জমে থাকা সহ্য করতে পারে না।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৫০ সেমি এবং কন্দ থেকে কন্দের দূরত্ব ২৫ সেমি রাখতে হবে। কন্দ ৫ সেমি মাটির নিচে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ৯-১০ মাস পর আদা সংগ্রহের উপযুক্ত হয়। যখন গাছের পাতা হলুদ হয়ে সম্পূর্ণ শুকিয়ে যায়, তখন মাটি খুঁড়ে আদা তুলতে হবে।"
  },
  {
    "id": "27",
    "name_bn": "হলুদ",
    "name_en": "Turmeric",
    "scientific_name": "Curcuma longa",
    "category": "spice",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "পলি দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 18,
    "profit_avg": 28000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 28,
        "tsp": 18,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "হলুদ পাতার দাগ রোগ",
        "symptoms": "পাতায় ডিম্বাকার দাগ। বোর্দো মিক্সচার ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "হলুদ চাষের জন্য দোআঁশ বা বেলে দোআঁশ মাটি এবং হালকা ছায়াযুক্ত স্থান সবচেয়ে ভালো। জমি ভালো করে চাষ করে উঁচু আইল বা বেড তৈরি করতে হবে। হলুদের গোড়ায় নিয়মিত মাটি তুলে দেওয়া এবং পানি নিষ্কাশনের ব্যবস্থা রাখা প্রয়োজন। রোগবালাই দমনে বীজ শোধন করা জরুরি।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং কন্দ থেকে কন্দের দূরত্ব ২৫ সেমি রাখতে হবে। কন্দ মাটির ৫-৭ সেমি গভীরে বপন করতে হবে।",
    "harvest_duration_bn": "রোপণের ৯-১০ মাস পর গাছের পাতা শুকিয়ে গেলে হলুদ তোলার উপযুক্ত সময়। মাটি খুঁড়ে হলুদ তুলে পরিষ্কার করে সেদ্ধ ও রোদে শুকিয়ে প্রক্রিয়াজাত করতে হবে।"
  },
  {
    "id": "28",
    "name_bn": "মরিচ",
    "name_en": "Chilli",
    "scientific_name": "Capsicum annuum",
    "category": "spice",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 10,
    "profit_avg": 22000,
    "icon_name": "Pepper",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 25,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "মরিচ অ্যানথ্রাকনোজ (ফল পচা)",
        "symptoms": "মরিচ শুকিয়ে কুঁচকে যায়। টিল্ট স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "মরিচ চাষের জন্য উর্বর ও মাঝারি উঁচু দোআঁশ বা বেলে দোআঁশ মাটি সবচেয়ে উপযোগী। বীজতলায় ৩০-৩৫ দিনের সুস্থ চারা তৈরি করে মূল জমিতে রোপণ করতে হবে। মরিচ গাছের গোড়ায় অতিরিক্ত জল নিষ্কাশনের ব্যবস্থা থাকতে হবে। ফুল ও ফল আসার সময় ইউরিয়া ও পটাশ সার দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৫০ সেমি এবং গাছ থেকে গাছের দূরত্ব ৪০ সেমি বজায় রাখতে হবে। চারা রোপণের গভীরতা হবে ৩-৪ সেমি।",
    "harvest_duration_bn": "রোপণের ৬০-৮০ দিন পর কাঁচা মরিচ এবং ১১০-১২০ দিন পর পাকা মরিচ সংগ্রহ করা যায়। কচি অবস্থায় বা সম্পূর্ণ লাল হলে হাত দিয়ে বোঁটা সহ ছিঁড়তে হবে।"
  },
  {
    "id": "29",
    "name_bn": "ধনে",
    "name_en": "Coriander",
    "scientific_name": "Coriandrum sativum",
    "category": "spice",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 1.8,
    "profit_avg": 12000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 12,
        "tsp": 8,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "ধনে পাউডারি মিলডিউ",
        "symptoms": "গাছের গায়ে সাদা পাউডার। সালফার স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "ধনে পাতা চাষের জন্য সুনিষ্কাশিত বেলে দোআঁশ বা দোআঁশ মাটি সবচেয়ে ভালো। বীজ বপনের আগে বীজগুলো সামান্য ঘষে দুই ভাগ করে নিলে ভালো চারা গজায়। আর্দ্রতা বজায় রাখতে হালকা সেচ প্রয়োজন। শাকের দ্রুত বৃদ্ধির জন্য সামান্য ইউরিয়া সার প্রয়োগ করা কার্যকর।",
    "spacing_info_bn": "বীজ সারিতে বপন করলে সারি থেকে সারির দূরত্ব ২০ সেমি এবং গাছ থেকে গাছের দূরত্ব ৫ সেমি রাখতে হবে। বপনের গভীরতা হবে ১.৫ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৩০-৪০ দিন পর কচি অবস্থায় ধনে পাতা সংগ্রহ করা যায়। পাতা কাটার পাশাপাশি সরাসরি শিকড় সহ গাছ বা শাক উপড়েও ব্যবহার করা যায়।"
  },
  {
    "id": "30",
    "name_bn": "সরিষা",
    "name_en": "Mustard",
    "scientific_name": "Brassica juncea",
    "category": "commercial",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 1.5,
    "profit_avg": 9000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 18,
        "tsp": 12,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "সরিষা অল্টারনারিয়া লিফ স্পট",
        "symptoms": "পাতায় গাঢ় দাগ পড়ে। রোভরাল স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "সরিষা চাষের জন্য দোআঁশ বা বেলে দোআঁশ মাটি উপযোগী। কার্তিক-অগ্রহায়ণ (অক্টোবর-নভেম্বর) মাসে জমি ৩-৪ বার চাষ ও মই দিয়ে ঝুরঝুরে করে বীজ বপন করতে হবে। সরিষা গাছের দ্রুত বৃদ্ধির জন্য বীজ বপনের পর হালকা একটি সেচ দেওয়া ভালো। ফুল আসার সময় ও ফল বাঁধার সময় আর্দ্রতা নিশ্চিত করতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৩০ সেমি এবং বীজ অত্যন্ত ঘন হলে চারা গজানোর পর পাতলা করে দিতে হবে যাতে গাছ ভালো পুষ্টি পায়।",
    "harvest_duration_bn": "বীজ বপনের ৭৫-৯০ দিন পর গাছের পাতা ও ফল হলুদ বর্ণ ধারণ করলে ফসল কেটে নিতে হবে। কেটে রোদে ভালো করে শুকিয়ে লাঠি দিয়ে পিটিয়ে দানা আলাদা করতে হবে।"
  },
  {
    "id": "31",
    "name_bn": "তিল",
    "name_en": "Sesame",
    "scientific_name": "Sesamum indicum",
    "category": "commercial",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 1.2,
    "profit_avg": 8500,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 15,
        "tsp": 10,
        "mop": 8,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "তিল কান্ড পচা রোগ",
        "symptoms": "কান্ড কালো হয়ে পচে। কার্বেন্ডাজিম স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "তিল খরা সহনশীল ফসল এবং উর্বর বেলে দোআঁশ বা দোআঁশ মাটিতে খুব ভালো জন্মে। জমি চাষ দিয়ে ঝুরঝুরে করে বীজ বপন করতে হবে। তিল গাছ জলাবদ্ধতা সহ্য করতে পারে না, তাই জল নিষ্কাশনের নালা থাকা আবশ্যক। বপনের ২০-২৫ দিন পর অতিরিক্ত চারা তুলে পাতলা করতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৩০ সেমি এবং গাছ থেকে গাছের দূরত্ব ১০ সেমি রাখতে হবে। বীজ বপনের গভীরতা ২ সেমি।",
    "harvest_duration_bn": "বপনের ৮৫-১০০ দিন পর গাছের পাতা ও ফলের খোসা হালকা হলুদ বর্ণ ধারণ করলে এবং নিচের ফল ফাটতে শুরু করলে তিল কেটে নিতে হবে।"
  },
  {
    "id": "32",
    "name_bn": "সূর্যমুখী",
    "name_en": "Sunflower",
    "scientific_name": "Helianthus annuus",
    "category": "commercial",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 2.2,
    "profit_avg": 14000,
    "icon_name": "Flower",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 24,
        "tsp": 16,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "সূর্যমুখী মাথা পচা রোগ",
        "symptoms": "ফুলের মাথা পচে যায়। ছত্রাকনাশক দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "সূর্যমুখী চাষের জন্য দোআঁশ ও এঁটেল দোআঁশ মাটি উপযুক্ত। জমি চাষ ও মই দিয়ে সমান করে লাইন করে বীজ বপন করতে হবে। সূর্যমুখী গাছে বোরন সারের অভাব হলে ফুল ও দানা গঠন ব্যাহত হয়, তাই সুষম সার দিতে হবে। গাছের ফুল ফোটা ও দানা বাঁধার সময় নিয়মিত হালকা সেচ দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং গাছ থেকে গাছের দূরত্ব ৩০ সেমি রাখতে হবে। বীজ বপনের গভীরতা ৩ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৯০-১১০ দিন পর ফুলের পেছন দিক হলুদ বা বাদামী বর্ণ ধারণ করলে এবং পাতা শুকিয়ে গেলে ফুল কেটে রোদে শুকিয়ে কাঠি দিয়ে পিটিয়ে বীজ আলাদা করতে হবে।"
  },
  {
    "id": "33",
    "name_bn": "চিনাবাদাম",
    "name_en": "Groundnut",
    "scientific_name": "Arachis hypogaea",
    "category": "commercial",
    "seasons": [
      "রবি",
      "খরিপ"
    ],
    "soil_preference": [
      "বেলে (Sandy)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 2,
    "profit_avg": 15000,
    "icon_name": "Nut",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 15,
        "tsp": 18,
        "mop": 12,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "চিনাবাদাম টিক্কা রোগ",
        "symptoms": "পাতায় ছোট গোল দাগ। কপার ছত্রাকনাশক দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "চিনাবাদাম চাষের জন্য হালকা ও ঝুরঝুরে বেলে বা বেলে দোআঁশ মাটি সবচেয়ে উপযোগী, কারণ চিনাবাদামের শিকড় ও শুঁটি মাটির নিচে সহজে প্রবেশ করতে পারে। জমি ৪-৫ বার চাষ দিয়ে ঝুরঝুরে করে খোসা সহ বা খোসা ছাড়া বীজ বপন করতে হবে। মাটির নিচ দিয়ে শুঁটি বাড়ার জন্য নিয়মিত নিড়ানি দিয়ে মাটি আলগা রাখা প্রয়োজন।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৪০ সেমি এবং বীজ থেকে বীজের দূরত্ব ১৫ সেমি রাখতে হবে। বপনের গভীরতা হবে ৩-৪ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ১২০-১৪০ দিন পর গাছের পাতা হলুদ হয়ে ঝরে পড়লে চিনাবাদাম মাটি খুঁড়ে তুলতে হবে। বাদাম গাছের গোড়া উপড়ে শুঁটিগুলো আলাদা করে রোদে ভালো করে শুকাতে হবে।"
  },
  {
    "id": "34",
    "name_bn": "মসুর ডাল",
    "name_en": "Lentil",
    "scientific_name": "Lens culinaris",
    "category": "grain",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "পলি দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 1.4,
    "profit_avg": 11000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 10,
        "tsp": 15,
        "mop": 10,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "মসুর ডাল রুট রট (শিকড় পচা)",
        "symptoms": "শিকড় কালো হয়ে গাছ ঢলে পড়ে। বীজ শোধন আবশ্যক।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "মসুর ডাল চাষের জন্য মাঝারি উর্বর দোআঁশ বা এঁটেল দোআঁশ মাটি সবচেয়ে ভালো। কার্তিক-অগ্রহায়ণ মাসে জমি চাষ করে বীজ বোনা হয়। ডাল জাতীয় ফসল হওয়ার কারণে শিকড়ে রাইজোবিয়াম ব্যাকটেরিয়া থাকে, ফলে নাইট্রোজেন সার কম লাগে। জমিতে জো থাকা অবস্থায় বীজ বপন করতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২৫ সেমি এবং বীজ থেকে বীজের দূরত্ব ৫-৭ সেমি রাখা উচিত। বপনের গভীরতা হবে ২-৩ সেমি।",
    "harvest_duration_bn": "বপনের ১০০-১১০ দিন পর গাছের পাতা ও ফল সোনালী বা খড়ের রঙ ধারণ করলে পুরো গাছ গোড়া থেকে কেটে নিতে হবে। রোদে শুকিয়ে মাড়াই করে মসুর আলাদা করতে হবে।"
  },
  {
    "id": "35",
    "name_bn": "মুগ ডাল",
    "name_en": "Mung Bean",
    "scientific_name": "Vigna radiata",
    "category": "grain",
    "seasons": [
      "রবি",
      "খরিপ"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 1.3,
    "profit_avg": 10500,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 8,
        "tsp": 14,
        "mop": 8,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BRRI"
      }
    ],
    "diseases": [
      {
        "name_bn": "মুগ ডাল হলুদ মোজাইক ভাইরাস",
        "symptoms": "পাতা হলুদ ছোপ ছোপ হয়। সাদা মাছি পোকা দমন করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BRRI"
      }
    ],
    "cultivation_method_bn": "মুগ ডাল চাষের জন্য মাঝারি দোআঁশ ও সুনিষ্কাশিত বেলে দোআঁশ মাটি উপযোগী। খরিপ মৌসুমে বা রবি মৌসুমের শেষে এটি বোনা যায়। জমিতে অতিরিক্ত জল জমতে দেওয়া যাবে না। ফুল আসার সময় ও পড বা শুঁটি গঠনের সময় হালকা সেচ দিলে ফলন অনেক ভালো হয়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৩০ সেমি এবং গাছ থেকে গাছের দূরত্ব ১০ সেমি রাখতে হবে। বীজ বপনের গভীরতা হবে ৩ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ৭০-৮৫ দিন পর শুঁটিগুলো যখন কালো বা গাঢ় বাদামী বর্ণ ধারণ করবে, তখন হাত দিয়ে ছিঁড়ে শুঁটি সংগ্রহ করতে হবে। কলাইগুলো রোদে শুকিয়ে মাড়াই করতে হবে।"
  },
  {
    "id": "36",
    "name_bn": "আম",
    "name_en": "Mango",
    "scientific_name": "Mangifera indica",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "পলি দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 12,
    "profit_avg": 45000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 40,
        "tsp": 30,
        "mop": 35,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "আম আমের অ্যানথ্রাকনোজ",
        "symptoms": "পাতায় ও ফলে কালো ক্ষত। প্রোপিকোনাজোল ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "আম চাষের জন্য উর্বর, গভীর দোআঁশ মাটি সবচেয়ে উপযোগী। বর্ষার শুরুতে বা শেষে (জ্যৈষ্ঠ-আশ্বিন) চারা রোপণের সঠিক সময়। রোপণের পূর্বে ২x২x২ ফুট আকারের গর্ত করে তাতে গোবর ও সুষম রাসায়নিক সার মিশিয়ে ১০-১৫ দিন রেখে চারা লাগাতে হবে। প্রতি বছর বর্ষার আগে ও পরে গাছের গোড়ায় মাটি আলগা করে সার দিতে হবে।",
    "spacing_info_bn": "ফলের ভালো বৃদ্ধির জন্য গাছ থেকে গাছের দূরত্ব ৮-১০ মিটার রাখতে হবে। গর্তের গভীরতা ও চওড়া ২ ফুট বা ৬০ সেমি হতে হবে।",
    "harvest_duration_bn": "কলমের গাছ রোপণের ৩-৪ বছর পর ফলন শুরু হয়। আম পরিপক্ব ও বোঁটার রঙ হালকা হলুদ হলে ডাল সহ সাবধানে পেড়ে নিতে হবে যাতে ফলের গায়ে দাগ না পড়ে।"
  },
  {
    "id": "37",
    "name_bn": "কাঁঠাল",
    "name_en": "Jackfruit",
    "scientific_name": "Artocarpus heterophyllus",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "লাল মাটি",
      "দোআঁশ মাটি"
    ],
    "water_requirement": "low",
    "yield_avg": 18,
    "profit_avg": 35000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 35,
        "tsp": 25,
        "mop": 30,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "কাঁঠাল ফল পচা রোগ",
        "symptoms": "ফল কালো হয়ে পচে ঝরে। বোর্দো মিক্সচার ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "কাঁঠাল গাছ জলাবদ্ধতা একদম সহ্য করতে পারে না, তাই উঁচু দোআঁশ বা লাল মাটি কাঁঠাল চাষের জন্য উত্তম। বর্ষার শুরুতে উঁচু স্থানে গর্ত করে সার প্রয়োগ করে চারা লাগাতে হবে। কাঁঠাল গাছের গোড়ায় মাটি উঁচু করে রাখতে হবে যাতে বর্ষার পানি জমতে না পারে।",
    "spacing_info_bn": "গাছ থেকে গাছের দূরত্ব ১০-১২ মিটার হওয়া উচিত। চারা লাগানোর গর্তটি হতে হবে ২.৫x২.৫x২.৫ ফুট আকারের।",
    "harvest_duration_bn": "চারা রোপণের ৫-৭ বছর পর ফলন শুরু হয়। কাঁঠালের গাঢ় সবুজ রঙ যখন হালকা বাদামী বা তামাটে হয় এবং বোঁটার কাছের অংশ নরম হয়, তখন ফল সংগ্রহ করতে হবে।"
  },
  {
    "id": "38",
    "name_bn": "লিচু",
    "name_en": "Litchi",
    "scientific_name": "Litchi chinensis",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 8,
    "profit_avg": 50000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 30,
        "tsp": 25,
        "mop": 25,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "লিচু লিচুর মাইট রোগ",
        "symptoms": "পাতা তামাটে ও কোঁকড়ানো হয়। সালফার মাকড়নাশক দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "লিচু চাষের জন্য সুনিষ্কাশিত দোআঁশ বা পলি মাটি সবচেয়ে ভালো। জলবায়ু কিছুটা আর্দ্র ও রৌদ্রোজ্জ্বল হওয়া দরকার। মে-জুন মাসে চারা রোপণ করা ভালো। লিচু গাছে কচি পাতায় ও ফলে নিয়মিত সেচ দিতে হবে এবং ফল ফাটার রোগ দমনে বোরন সার প্রয়োগ করতে হবে।",
    "spacing_info_bn": "গাছ থেকে গাছের দূরত্ব ৮-১০ মিটার রাখা আবশ্যক। চারা লাগানোর গর্তের আকার হতে হবে ২x২x২ ফুট।",
    "harvest_duration_bn": "কলমের গাছে রোপণের ৩-৪ বছরের মধ্যে লিচু ধরে। লিচুর খোসার গায়ের কাঁটাগুলো যখন সমান বা চ্যাপ্টা হয়ে লালচে বর্ণ ধারণ করে, তখন ডাল সহ থোকা ধরে লিচু ভাঙতে হবে।"
  },
  {
    "id": "39",
    "name_bn": "কলা",
    "name_en": "Banana",
    "scientific_name": "Musa acuminata",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 32,
    "profit_avg": 28000,
    "icon_name": "Banana",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 40,
        "tsp": 20,
        "mop": 50,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "কলা পানামা রোগ",
        "symptoms": "পাতা হলুদ হয়ে ঝুলে পড়ে। আক্রান্ত গাছ তুলে ধ্বংস করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "উর্বর, সুনিষ্কাশিত দোআঁশ ও এঁটেল দোআঁশ মাটি কলা চাষের জন্য সবচেয়ে ভালো। কলা গাছের গোড়ায় পর্যাপ্ত পানি ও আর্দ্রতা থাকা দরকার, কিন্তু জলাবদ্ধতা ক্ষতিকর। রোপণের জন্য ভালো সাকার বা তেউড় নির্বাচন করতে হবে। কলা গাছে প্রচুর পরিমাণে পটাশ ও গোবর সার প্রয়োগ করা প্রয়োজন।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২ মিটার এবং চারা থেকে চারার দূরত্ব ২ মিটার রাখা ভালো। চারা লাগানোর গর্তের গভীরতা হবে ৪৫ সেমি।",
    "harvest_duration_bn": "চারা রোপণের ১১-১৩ মাসের মধ্যে কলা কাটার উপযোগী হয়। কলার কোণগুলো যখন গোল হয়ে আসে এবং গায়ের সবুজ ভাব হালকা হয়ে আসে, তখন কলার ছড়া কাটতে হবে।"
  },
  {
    "id": "40",
    "name_bn": "পেয়ারা",
    "name_en": "Guava",
    "scientific_name": "Psidium guajava",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "লাল মাটি"
    ],
    "water_requirement": "low",
    "yield_avg": 22,
    "profit_avg": 24000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 25,
        "tsp": 20,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পেয়ারা উইল্ট রোগ (ঢলে পড়া)",
        "symptoms": "গাছ হঠাৎ শুকিয়ে মরে। জমির গোড়ায় চুন দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পেয়ারা অত্যন্ত সহনশীল একটি ফল, যা দোআঁশ থেকে শুরু করে এঁটেল মাটিতেও জন্মে। কলমের চারা রোপণ করলে দ্রুত ফল পাওয়া যায়। গাছের সুন্দর আকৃতি ও বেশি ফলনের জন্য প্রতি বছর ডালপালা ছাঁটাই করা আবশ্যক। বর্ষার পূর্বে ও পরে সুষম সার দিলে ফল বড় ও মিষ্টি হয়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৪-৫ মিটার এবং চারা থেকে চারার দূরত্ব ৪ মিটার রাখতে হবে। গর্তের গভীরতা হবে ৫০ সেমি।",
    "harvest_duration_bn": "কলমের গাছে রোপণের ১-২ বছরের মধ্যে পেয়ারা ধরে। পেয়ারার রঙ গাঢ় সবুজ থেকে হালকা সবুজ বা হলুদাভ সবুজ বর্ণ ধারণ করলে সংগ্রহ করতে হবে।"
  },
  {
    "id": "41",
    "name_bn": "পেঁপে",
    "name_en": "Papaya",
    "scientific_name": "Carica papaya",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 45,
    "profit_avg": 32000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 30,
        "tsp": 22,
        "mop": 25,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পেঁপে পেঁপের রিং স্পট রোগ",
        "symptoms": "ফল ও পাতায় রিং আকৃতির দাগ। রোগাক্রান্ত গাছ তুলে ফেলুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পেঁপে জলাবদ্ধতা একেবারেই সহ্য করতে পারে না, তাই পানি নিষ্কাশন ব্যবস্থা অত্যন্ত ভালো হতে হবে। উঁচু দোআঁশ মাটিতে পেঁপে খুব ভালো জন্মে। বীজতলায় চারা তৈরি করে ২-৩ মাস পর মূল জমিতে লাগাতে হবে। প্রতিটি মাদায় ২-৩টি চারা লাগিয়ে পরে একটি ফলবতী স্ত্রী গাছ রাখতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২ মিটার এবং মাদা থেকে মাদার দূরত্ব ২ মিটার রাখা বাঞ্ছনীয়। চারা ১৫-২০ সেমি গভীরতায় রোপণ করতে হবে।",
    "harvest_duration_bn": "চারা রোপণের ৯-১০ মাসের মধ্যে পাকা পেঁপে এবং ৫-৬ মাসের মধ্যে কাঁচা পেঁপে সংগ্রহ করা যায়। ফলের গায়ে হলদে আভা দেখা দিলে সংগ্রহ করতে হবে।"
  },
  {
    "id": "42",
    "name_bn": "আনারস",
    "name_en": "Pineapple",
    "scientific_name": "Ananas comosus",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "পাহাড়ি লাল মাটি"
    ],
    "water_requirement": "low",
    "yield_avg": 24,
    "profit_avg": 26000,
    "icon_name": "Pineapple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 20,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "আনারস গোড়া পচা রোগ",
        "symptoms": "আনারসের গোড়া পচে। ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "আনারস চাষের জন্য পাহাড়ী ঢালু জমি বা সুনিষ্কাশিত দোআঁশ মাটি সবচেয়ে উপযোগী। আনারসের কড়া রোপণ করে চাষ করা হয়। আনারসের ভালো বৃদ্ধির জন্য হালকা ছায়া এবং আর্দ্র আবহাওয়া প্রয়োজন। মাটির উর্বরতা বাড়াতে নাইট্রোজেন ও পটাশ সার কিস্তিতে দিতে হবে।",
    "spacing_info_bn": "লাইন থেকে লাইনের দূরত্ব ৫০ সেমি এবং চারা থেকে চারার দূরত্ব ৩০ সেমি রাখতে হবে। আনারসের কড়া বা চারা ১০-১৫ সেমি গভীরে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ১৫-১৮ মাসের মধ্যে আনারস সংগ্রহের উপযোগী হয়। ফলের নিচের দিকের চোখগুলো যখন হলুদ রঙ ধারণ করতে শুরু করে, তখন আনারস কেটে নিতে হবে।"
  },
  {
    "id": "43",
    "name_bn": "তরমুজ",
    "name_en": "Watermelon",
    "scientific_name": "Citrullus lanatus",
    "category": "fruit",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "বেলে (Sandy)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 35,
    "profit_avg": 40000,
    "icon_name": "Pineapple",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 28,
        "tsp": 20,
        "mop": 22,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "তরমুজ ফিউজেরিয়াম উইল্ট",
        "symptoms": "লতা ঢলে পড়ে শুকিয়ে যায়। কার্বেন্ডাজিম দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "নদীচর বা সুনিষ্কাশিত বেলে দোআঁশ মাটিতে তরমুজ খুব ভালো জন্মায়। বীজ বপনের আগে ২৪ ঘণ্টা ভিজিয়ে রেখে মাদা তৈরি করে বপন করতে হবে। লতাগুলোর গোড়ায় নিয়মিত পানি সেচ দিতে হবে তবে ফলের নিচে খড় দিতে হবে যাতে আর্দ্র মাটির সংস্পর্শে ফল পচে না যায়।",
    "spacing_info_bn": "মাদা থেকে মাদার দূরত্ব ২ মিটার এবং লাইনের দূরত্ব ৩ মিটার রাখা উচিত। বীজ ২-৩ সেমি গভীরতায় বপন করতে হবে।",
    "harvest_duration_bn": "বীজ বপনের ৮০-১০০ দিন পর তরমুজ পরিপক্ব হয়। ফলের উপরিভাগ টোকা দিলে যদি গভীর বা ভারী শব্দ হয় এবং মাটির সংস্পর্শে থাকা অংশ হলুদ বর্ণ ধারণ করে, তবে বুঝতে হবে তরমুজ পেকেছে।"
  },
  {
    "id": "44",
    "name_bn": "লেবু",
    "name_en": "Lemon",
    "scientific_name": "Citrus limon",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "বেলে দোআঁশ"
    ],
    "water_requirement": "low",
    "yield_avg": 15,
    "profit_avg": 22000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 20,
        "tsp": 15,
        "mop": 18,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "লেবু সাইট্রাস ক্যাংকার",
        "symptoms": "পাতায় খসখসে বাদামী দাগ। কপার অক্সিক্লোরাইড স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "সুনিষ্কাশিত দোআঁশ ও বেলে দোআঁশ মাটি লেবু চাষের জন্য উপযুক্ত। চারা বা কলম বর্ষার শুরুতে রোপণ করা ভালো। লেবু গাছে নিয়মিত আগাছা পরিষ্কার করা এবং জল নিষ্কাশনের ব্যবস্থা রাখা প্রয়োজন। ফলের ভালো আকার ও রসের জন্য গাছের গোড়ায় আর্দ্রতা ধরে রাখতে হালকা সেচ দিতে হবে।",
    "spacing_info_bn": "গাছ থেকে গাছের দূরত্ব ৩-৪ মিটার রাখতে হবে। চারা লাগানোর গর্তের আকার হতে হবে ৪৫x৪৫x৪৫ সেমি।",
    "harvest_duration_bn": "রোপণের ১-২ বছরের মধ্যে লেবু ধরা শুরু হয়। লেবুর রঙ গাঢ় সবুজ থেকে হালকা সবুজ হয়ে মসৃণ ও চকচকে হলে সংগ্রহ করতে হবে।"
  },
  {
    "id": "45",
    "name_bn": "নারিকেল",
    "name_en": "Coconut",
    "scientific_name": "Cocos nucifera",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "বেলে দোআঁশ",
      "উপকূলীয় মাটি"
    ],
    "water_requirement": "low",
    "yield_avg": 120,
    "profit_avg": 48000,
    "icon_name": "Apple",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 50,
        "tsp": 30,
        "mop": 40,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "নারিকেল কুঁড়ি পচা রোগ",
        "symptoms": "নারিকেলের ডগা পচে ভেঙে পড়ে। কপার ছত্রাকনাশক দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "নারিকেল গাছে লবণাক্ততা সহনশীলতা বেশি হলেও উর্বর দোআঁশ বা উপকূলীয় বেলে মাটি সবচেয়ে উপযোগী। নারিকেলের চারা লাগানোর জন্য ৩x৩x৩ ফুট গর্ত করে পচা গোবর, ছাই ও লবণ মিশিয়ে মাটি তৈরি করতে হবে। গাছের উপরিভাগের পাতা পরিষ্কার রাখা এবং বর্ষার আগে ও পরে সুষম সার দেওয়া জরুরি।",
    "spacing_info_bn": "গাছ থেকে গাছের দূরত্ব ৭-৮ মিটার হওয়া উচিত। চারা লাগানোর সময় গর্তের মাঝামাঝি নারিকেলটি ৩/৪ অংশ মাটির নিচে রাখতে হবে।",
    "harvest_duration_bn": "চারা রোপণের ৫-৭ বছর পর ফলন শুরু হয়। ডাব বা নারকেলের খোসা বাদামী বা ধূসর বর্ণ ধারণ করলে অথবা তরল পানি কমার শব্দ শুনলে নারিকেল সংগ্রহ করতে হবে।"
  },
  {
    "id": "46",
    "name_bn": "পাট",
    "name_en": "Jute",
    "scientific_name": "Corchorus olitorius",
    "category": "commercial",
    "seasons": [
      "খরিপ"
    ],
    "soil_preference": [
      "পলি দোআঁশ",
      "দোআঁশ"
    ],
    "water_requirement": "high",
    "yield_avg": 2.8,
    "profit_avg": 16000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 20,
        "tsp": 8,
        "mop": 12,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পাট পাট কান্ড পচা",
        "symptoms": "কান্ডে কালো ডোরাকাটা দাগ। সুষম সার ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পাট বাংলাদেশের প্রধান অর্থকরী ফসল। উর্বর দোআঁশ ও পলি দোআঁশ মাটিতে পাট সবচেয়ে ভালো জন্মায়। চৈত্র-বৈশাখ (মার্চ-এপ্রিল) মাসে জমি ৪-৫ বার চাষ দিয়ে বীজ বপন করতে হবে। বীজ বপনের পর চারা গজানো এবং ২০-২৫ দিন পর চারা পাতলা করা অত্যন্ত গুরুত্বপূর্ণ। পাটের আঁশের গুণগত মান বাড়াতে সঠিক সময়ে নিড়ানি দিতে হবে।",
    "spacing_info_bn": "লাইনে বপন করলে সারি থেকে সারির দূরত্ব ৩০ সেমি এবং গাছ থেকে গাছের দূরত্ব ১০ সেমি রাখতে হবে। বপনের গভীরতা হবে ২ সেমি।",
    "harvest_duration_bn": "বপনের ১২০-১৩০ দিন পর যখন গাছে ফুল আসতে শুরু করে, তখন পাট কাটার উপযুক্ত সময়। কেটে জাঁক দিয়ে পানিতে ডুবিয়ে পচানোর পর আঁশ ছাড়িয়ে রোদে শুকাতে হবে।"
  },
  {
    "id": "47",
    "name_bn": "আখ",
    "name_en": "Sugarcane",
    "scientific_name": "Saccharum officinarum",
    "category": "commercial",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "এঁটেল দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 75,
    "profit_avg": 35000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 45,
        "tsp": 25,
        "mop": 30,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "আখ রেড রট (লাল পচা)",
        "symptoms": "আখের ভেতরটা লাল হয়ে যায় ও টক গন্ধ ছড়ায়। প্রতিরোধী জাত চাষ করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "আখ একটি দীর্ঘমেয়াদী ফসল যা চাষের জন্য সুনিষ্কাশিত দোআঁশ ও এঁটেল দোআঁশ মাটি উপযোগী। জমি গভীর চাষ দিয়ে নালা তৈরি করে আখের সেট বা চোখযুক্ত কাটিং রোপণ করতে হবে। আখের দ্রুত কান্ড বৃদ্ধির জন্য নাইট্রোজেন, পটাশ সার এবং নিয়মিত সেচ অত্যন্ত প্রয়োজনীয়।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৯০ সেমি এবং কাটিং থেকে কাটিংয়ের দূরত্ব ৪৫ সেমি রাখতে হবে। কাটিংগুলো মাটির ১০-১৫ সেমি গভীরে শোয়ানো অবস্থায় রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ১০-১২ মাস পর আখ কাটার উপযুক্ত হয়। আখের কান্ড শক্ত ও মিষ্টি হলে এবং নিচের পাতাগুলো শুকিয়ে গেলে গোড়া থেকে কেটে সংগ্রহ করতে হবে।"
  },
  {
    "id": "48",
    "name_bn": "চা",
    "name_en": "Tea",
    "scientific_name": "Camellia sinensis",
    "category": "commercial",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "পাহাড়ি অম্লীয় দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 2.2,
    "profit_avg": 60000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 35,
        "tsp": 15,
        "mop": 20,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "চা লাল মরিচা রোগ",
        "symptoms": "পাতায় লালচে পশমি দাগ। কপার ছত্রাকনাশক স্প্রে করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "চা চাষের জন্য অম্লীয় (pH 4.5-5.5) ও সুনিষ্কাশিত পাহাড়ী ঢালু লাল মাটি অত্যন্ত উপযোগী। চায়ের জন্য প্রচুর বৃষ্টিপাত কিন্তু জলাবদ্ধতাহীন নিষ্কাশন ব্যবস্থা প্রয়োজন। চারা লাগানোর পর নিয়মিত ছাঁটাই (Pruning) করে গাছের উচ্চতা ও পাতা তোলার টেবিল ঠিক রাখতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ১.২ মিটার এবং গাছ থেকে গাছের দূরত্ব ৬০ সেমি রাখতে হবে। চারা ৩০ সেমি গভীরে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ২-৩ বছর পর পাতা তোলা শুরু হয়। সাধারণত গাছের অগ্রভাগের দুটি পাতা ও একটি কুঁড়ি (Two leaves and a bud) হাত দিয়ে সংগ্রহ করতে হবে।"
  },
  {
    "id": "49",
    "name_bn": "তুলা",
    "name_en": "Cotton",
    "scientific_name": "Gossypium hirsutum",
    "category": "commercial",
    "seasons": [
      "খরিপ",
      "রবি"
    ],
    "soil_preference": [
      "দোআঁশ (Loam)",
      "লাল মাটি"
    ],
    "water_requirement": "medium",
    "yield_avg": 2.5,
    "profit_avg": 24000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "খরিপ",
        "urea": 30,
        "tsp": 20,
        "mop": 22,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "তুলা তুলা বোল পচা",
        "symptoms": "বোল পচে তুলা নষ্ট হয়। বালাইনাশক ব্যবহার করুন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "তুলা চাষের জন্য উর্বর ও মাঝারি উঁচু দোআঁশ মাটি সবচেয়ে উপযোগী। জমি ভালোভাবে ৪-৫ বার চাষ করে ঝুরঝুরে করে বীজ বপন করতে হবে। তুলা গাছের প্রারম্ভিক বৃদ্ধির সময় আগাছা দমন ও ফুল আসার সময় নিয়মিত সেচ নিশ্চিত করতে হবে। বোল পাকার সময় শুষ্ক আবহাওয়া থাকা ভালো।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৯০ সেমি এবং গাছ থেকে গাছের দূরত্ব ৪৫ সেমি রাখতে হবে। বীজ বপনের গভীরতা ৩ সেমি।",
    "harvest_duration_bn": "বীজ বপনের ১৫০-১৬৫ দিন পর তুলার বোল ফাটতে শুরু করে। বোল ফাটার পর ভেতর থেকে সাদা তুলা রোদেলা দিনে সাবধানে হাত দিয়ে টেনে তুলে নিতে হবে।"
  },
  {
    "id": "50",
    "name_bn": "পান",
    "name_en": "Betel Leaf",
    "scientific_name": "Piper betle",
    "category": "commercial",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "উঁচু উর্বর দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 10,
    "profit_avg": 45000,
    "icon_name": "Leaf",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 25,
        "tsp": 18,
        "mop": 15,
        "gypsum": 10,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "পান গোড়া পচা ও লতা পচা",
        "symptoms": "পান লতা পচে খসে পড়ে। লতা শোধন করুন ও বোর্দো দিন।",
        "cause_bn": "প্যাথোজেন সংক্রমণ",
        "treatment_bn": "১. আক্রান্ত অংশ কেটে ধ্বংস করা।\n২. সুপারিশকৃত ছত্রাকনাশক বা কীটনাশক স্প্রে করা।",
        "prevention_bn": "১. সুষম সার ব্যবহার করা।\n২. বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "পান চাষের জন্য সুনিষ্কাশিত, মাঝারি উঁচু দোআঁশ বা লাল মাটি উপযোগী। পান চাষের জন্য বিশেষ বরজ তৈরি করতে হবে যাতে রোদ ও ঝড় থেকে রক্ষা পাওয়া যায়। পানের লতাগুলো বাঁশের খুঁটির সাথে বেঁধে দিতে হবে এবং গোড়ায় নিয়মিত হালকা পানি সেচ ও খৈল পচা সার দিতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ৬০ সেমি এবং লতা থেকে লতার দূরত্ব ১৫ সেমি রাখতে হবে। পানের লতার কাটিং ১০-১৫ সেমি গভীরে রোপণ করতে হবে।",
    "harvest_duration_bn": "রোপণের ৫-৬ মাস পর থেকে পানের পাতা তোলা শুরু করা যায়। নিচের দিকের পরিপক্ব ও গাঢ় সবুজ পাতাগুলো বোঁটা সহ আলতো করে ভেঙে তুলে নিতে হবে।"
  },
  {
    "id": "51",
    "name_bn": "রসুন",
    "name_en": "Garlic",
    "scientific_name": "Allium sativum",
    "category": "spice",
    "seasons": [
      "রবি",
      "শীতকাল"
    ],
    "soil_preference": [
      "উর্বর দোআঁশ",
      "পলি দোআঁশ"
    ],
    "water_requirement": "medium",
    "yield_avg": 8,
    "profit_avg": 22000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "রবি",
        "urea": 28,
        "tsp": 22,
        "mop": 25,
        "gypsum": 12,
        "zinc": 1.5,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "রসুনের বেগুনী দাগ রোগ (Purple Blotch)",
        "symptoms": "পাতায় বেগুনী রঙের দাগ পড়ে এবং পাতা শুকিয়ে যায়।",
        "cause_bn": "ছত্রাক সংক্রমণ (Alternaria porri)",
        "treatment_bn": "১. আক্রান্ত লতা-পাতা পুড়িয়ে ফেলা।\n২. রোভরাল বা প্রোভ্যাক্স ছত্রাকনাশক স্প্রে করা।",
        "prevention_bn": "১. সুস্থ বীজ রোপণ করা।\n২. বীজ বপনের পূর্বে প্রোভ্যাক্স দিয়ে বীজ শোধন করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "রসুন চাষের জন্য সুনিষ্কাশিত দোআঁশ ও পলি দোআঁশ মাটি উপযুক্ত। রসুনের কোয়া রোপণ করার পর মাটিতে খড় বা কচুরিপানা দিয়ে ঢেকে রাখলে আর্দ্রতা বজায় থাকে এবং ফলন ভালো হয়। নিয়মিত নিরানি দিয়ে জমির আগাছা দূর করতে হবে এবং অতিরিক্ত জল নিষ্কাশনের ব্যবস্থা রাখতে হবে।",
    "spacing_info_bn": "সারি থেকে সারির দূরত্ব ২০ সেমি এবং কোয়া থেকে কোয়ার দূরত্ব ১০ সেমি রাখতে হবে। কোয়া ৪ সেমি মাটির নিচে খড়াভাবে রোপণ করা উচিত।",
    "harvest_duration_bn": "রোপণের ১২০-১৩০ দিন পর রসুনের পাতা সম্পূর্ণ শুকিয়ে নুয়ে পড়লে রসুন তুলতে হবে। তোলার পর পাতা সহ ৩-৪ দিন রোদে শুকিয়ে সংরক্ষণ করতে হবে।"
  },
  {
    "id": "52",
    "name_bn": "লিচু",
    "name_en": "Litchi",
    "scientific_name": "Litchi chinensis",
    "category": "fruit",
    "seasons": [
      "বছরের সব সময়"
    ],
    "soil_preference": [
      "উঁচু ও মাঝারি দোআঁশ মাটি"
    ],
    "water_requirement": "medium",
    "yield_avg": 12,
    "profit_avg": 55000,
    "icon_name": "Sprout",
    "fertilizers": [
      {
        "season": "বছরের সব সময়",
        "urea": 40,
        "tsp": 35,
        "mop": 30,
        "gypsum": 15,
        "zinc": 2,
        "source_org": "BARI"
      }
    ],
    "diseases": [
      {
        "name_bn": "লিচুর ফল পচা রোগ",
        "symptoms": "পাকা লিচুতে ভেজা দাগ দেখা যায় এবং পরবর্তীতে ফল পচে যায়।",
        "cause_bn": "ছত্রাকজনিত রোগ",
        "treatment_bn": "১. আক্রান্ত ফল মাঠ থেকে সংগ্রহ করে দূরে ফেলে দেয়া বা পুড়িয়ে ফেলা।\n২. ছত্রাকনাশক ডাইথেন এম-৪৫ স্প্রে করা।",
        "prevention_bn": "১. বাগান সবসময় পরিষ্কার-পরিচ্ছন্ন রাখা।\n২. ফল পরিপক্ক হওয়ার পূর্বে ছত্রাকনাশক স্প্রে করা।",
        "source_org": "BARI"
      }
    ],
    "cultivation_method_bn": "লিচু চাষের জন্য গভীর ও উর্বর দোআঁশ মাটি সবচেয়ে উত্তম। কলম বা গুটি কলমের চারা রোপণের পূর্বে গর্ত তৈরি করে প্রস্তুত করতে হবে। ফলন্ত গাছে যখন ফল কুঁড়ি আকারে থাকে, তখন নিয়মিত পানি সেচ দিতে হবে যাতে ফল ঝরে না পড়ে।",
    "spacing_info_bn": "গাছ থেকে গাছের দূরত্ব ৮-১০ মিটার রাখা আবশ্যক। চারা লাগানোর গর্তের গভীরতা হবে ৬০ সেমি।",
    "harvest_duration_bn": "গুটি কলমের গাছে রোপণের ৩ বছরের মধ্যে ফলন আসে। লিচুর খোসার কাঁটাগুলো যখন মসৃণ বা চ্যাপ্টা আকার ধারণ করে এবং লালচে হয়, তখন থোকা সহ ভেঙে সংগ্রহ করতে হবে।"
  }
];

export const KNOWLEDGE_SNIPPETS = [
  "বোরো ধানের জন্য বীজ তলা তৈরি: নভেম্বর মাসের প্রথম সপ্তাহে বীজতলায় বীজ বোনা উচিত। ইউরিয়া সার সমান ৩টি কিস্তিতে দিতে হবে। ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর, ২য় কিস্তি চারা রোপণের ৩০-৩৫ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন পূর্বে প্রয়োগ করতে হবে। সুষম সার প্রয়োগ ধানের ফলন বাড়ায়।",
  "টমেটো চাষাবাদ পদ্ধতি: অক্টোবর-নভেম্বর মাসে বীজতলায় চারা তৈরি করে মূল জমিতে ৩০-৩৫ দিন বয়সের চারা রোপণ করতে হবে। গোবর বা কম্পোস্ট সার জমি তৈরির সময় প্রয়োগ করা উচিত। সেচ দেওয়ার পর মাটির চটা ভেঙে দেয়া গুরুত্বপূর্ণ যাতে টমেটোর মূল পর্যাপ্ত অক্সিজেন পায়।",
  "আলুর সঠিক সেচ ব্যবস্থাপনা: আলু চাষে ২-৩ বার সেচ দেয়া অত্যন্ত জরুরি। ১ম সেচ রোপণের ২০-২৫ দিনের মাথায় এবং ২য় সেচ ৪৫-৫০ দিনে দিতে হবে। জমিতে অতিরিক্ত পানি জমে থাকলে আলু পচে যেতে পারে, তাই পানি নিষ্কাশন ব্যবস্থা ভালো রাখা আবশ্যক।"
];
