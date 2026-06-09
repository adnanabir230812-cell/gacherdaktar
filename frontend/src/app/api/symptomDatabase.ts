export interface ClarifyingQuestion {
  id: string;
  question: string;
  options: string[]; // ['হ্যাঁ', 'না', 'জানি না']
  affects: Record<string, number>; // maps disease class to score weight (e.g. { 'rice_blast': 5, 'rice_brown_spot': -5 })
}

export interface DiseaseDetail {
  classId: string; // matches ML classification outputs (e.g., 'rice_blast')
  name_bn: string;
  crop_bn: string;
  cause_bn: string;
  symptoms_bn: string[];
  remedies_bn: string[];
  confusing_with: string[]; // visually similar classes
  comparison: {
    withClassId: string;
    points: {
      feature: string;
      this_disease: string;
      other_disease: string;
    }[];
  }[];
}

// Structured database for similar disease comparisons
export const DISEASE_DETAILS_DB: Record<string, DiseaseDetail> = {
  'rice_blast': {
    classId: 'rice_blast',
    name_bn: 'ধানের ব্লাস্ট রোগ (Rice Blast)',
    crop_bn: 'ধান',
    cause_bn: 'ম্যাগনাপোর্ট ওরিয়াজি (Magnaporthe oryzae) নামক ছত্রাক',
    symptoms_bn: [
      'পাতায় চোখের মতো (spindle-shaped) দাগ পড়ে, যার দুই প্রান্ত সুচালো হয়।',
      'দাগের মাঝখানের অংশ ধূসর বা ছাই রঙের এবং চারপাশের বর্ডার বাদামী রঙের হয়।',
      'তীব্র আক্রমণে কান্ড বা শীষের গোড়া কালো হয়ে ভেঙে পড়ে (Neck Blast)।'
    ],
    remedies_bn: [
      'ট্রাইসাইক্লাজল (যেমন: ট্রুপার) বা ট্রাইফ্লক্সিস্ট্রবিন + টেবুকোনাজল (যেমন: নাটিভো) অনুমোদিত মাত্রায় স্প্রে করুন।',
      'আক্রান্ত জমিতে ইউরিয়া সারের অতিরিক্ত উপরি-প্রয়োগ বন্ধ রাখুন এবং পর্যাপ্ত পানি জমিয়ে রাখুন।'
    ],
    confusing_with: ['rice_brown_spot'],
    comparison: [
      {
        withClassId: 'rice_brown_spot',
        points: [
          { feature: 'দাগের আকৃতি', this_disease: 'চোখের মতো লম্বাটে (Spindle-shaped), দুই প্রান্ত সুচালো।', other_disease: 'গোলাকার বা ডিম্বাকার (Circular/Oval)।' },
          { feature: 'দাগের কেন্দ্র', this_disease: 'ধূসর বা ছাই রঙের ছাই-কেন্দ্র থাকে।', other_disease: 'হালকা হলুদ বা হালকা বাদামী রঙের কেন্দ্র থাকে।' },
          { feature: 'শীষের গোড়া (Neck)', this_disease: 'শীষের গোড়া কালো হয়ে পচে ভেঙে পড়তে পারে (নেক ব্লাস্ট)।', other_disease: 'শীষের গোড়ায় কোনো কালো পচন বা ভাঙন ধরে না।' }
        ]
      }
    ]
  },
  'rice_brown_spot': {
    classId: 'rice_brown_spot',
    name_bn: 'ধানের বাদামী দাগ রোগ (Brown Spot)',
    crop_bn: 'ধান',
    cause_bn: 'কক্লিওবোলাস মিয়াবিয়ানুস (Cochliobolus miyabeanus) নামক ছত্রাক',
    symptoms_bn: [
      'পাতায় অসংখ্য ছোট ছোট গোলাকার বা ডিম্বাকার গাঢ় বাদামী স্পট দেখা যায়।',
      'দাগগুলোর চারপাশে একটি হালকা হলদে আভা (yellow halo) থাকে।',
      'স্পটগুলো আকারে ব্লাস্টের চেয়ে ছোট এবং সমস্ত পাতায় ছড়িয়ে থাকে।'
    ],
    remedies_bn: [
      'ম্যানকোজেব বা প্রোপিকোনাজল (যেমন: টিল্ট) জাতীয় ছত্রাকনাশক স্প্রে করুন।',
      'মাটিতে পটাশ সার ও দস্তা সার পরিমাণমতো প্রয়োগ করুন এবং সুষম সেচ দিন।'
    ],
    confusing_with: ['rice_blast'],
    comparison: [
      {
        withClassId: 'rice_blast',
        points: [
          { feature: 'দাগের আকৃতি', this_disease: 'গোলাকার বা ডিম্বাকার (Circular/Oval)।', other_disease: 'চোখের মতো লম্বাটে (Spindle-shaped), দুই প্রান্ত সুচালো।' },
          { feature: 'দাগের কেন্দ্র', this_disease: 'হালকা হলুদ বা হালকা বাদামী রঙের কেন্দ্র থাকে।', other_disease: 'ধূসর বা ছাই রঙের ছাই-কেন্দ্র থাকে।' },
          { feature: 'দাগের সংখ্যা', this_disease: 'পাতাজুড়ে অসংখ্য ছোট ছোট দাগ ছড়ানো থাকে।', other_disease: 'দাগ সংখ্যায় তুলনামূলক কম কিন্তু আকারে বড় ও ছড়ানো হয়।' }
        ]
      }
    ]
  },
  'tomato_early_blight': {
    classId: 'tomato_early_blight',
    name_bn: 'টমেটোর আগাম ধসা রোগ (Early Blight)',
    crop_bn: 'টমেটো',
    cause_bn: 'অল্টারনারিয়া সোলানি (Alternaria solani) ছত্রাক',
    symptoms_bn: [
      'গাছের নিচের দিকের পুরোনো পাতায় প্রথমে গাঢ় বাদামী বা কালো দাগ পড়ে।',
      'দাগগুলোর ভেতরে বৃত্তাকার রিং বা চক্রাকার রেখা (Targetboard effect) দেখা যায়।',
      'আক্রান্ত পাতা হলুদ হয়ে ঝরে পড়ে এবং কান্ডেও কালচে দাগ দেখা দেয়।'
    ],
    remedies_bn: [
      'রোভরাল বা ডাইথেন এম-৪৫ অনুমোদিত মাত্রায় স্প্রে করুন।',
      'গাছের নিচের আক্রান্ত ও মরা পাতা ছাঁটাই করে পুড়িয়ে ফেলুন।'
    ],
    confusing_with: ['tomato_late_blight'],
    comparison: [
      {
        withClassId: 'tomato_late_blight',
        points: [
          { feature: 'দাগের ধরণ', this_disease: 'বৃত্তাকার কালচে রিংযুক্ত দাগ (Target-like rings)।', other_disease: 'পানি-ভেজা বড় ছড়ানো ক্ষত এবং স্যাঁতসেঁতে ছাতা।' },
          { feature: 'ছত্রাক বৃদ্ধি', this_disease: 'দাগ শুকনো থাকে এবং কোনো সাদা গুঁড়ো ছাতা দেখা যায় না।', other_disease: 'পাতার উল্টো পিঠে ভেজা আবহাওয়ায় সাদা তুলার মতো ছাতা পড়ে।' },
          { feature: 'ছড়ানোর গতি', this_disease: 'ধীরে ধীরে নিচ থেকে উপরের পাতায় ছড়ায়।', other_disease: 'কুয়াশাচ্ছন্ন ও ঠান্ডা আবহাওয়ায় কয়েক দিনে পুরো মাঠ ধ্বংস করে ফেলে।' }
        ]
      }
    ]
  },
  'tomato_late_blight': {
    classId: 'tomato_late_blight',
    name_bn: 'টমেটোর নাভি ধসা রোগ (Late Blight)',
    crop_bn: 'টমেটো',
    cause_bn: 'ফাইটোপথোরা ইনফেসট্যান্স (Phytophthora infestans) ছত্রাক',
    symptoms_bn: [
      'পাতার ডগা বা কিনারায় বড় বড় পানি-ভেজা কালচে বেগুনি ক্ষত দেখা দেয়।',
      'সকালে বা আর্দ্র আবহাওয়ায় পাতার নিচের পিঠে সাদা তুলার মতো ছাতা (fuzzy mold) দেখা যায়।',
      'ঠান্ডা ও কুয়াশাচ্ছন্ন আবহাওয়ায় খুব দ্রুত কান্ড ও ফল পচে গাছ মারা যায়।'
    ],
    remedies_bn: [
      'ম্যানকোজেব + মেটাল্যাক্সিল (যেমন: রিডোমিল গোল্ড) স্প্রে করুন।',
      'কুয়াশাচ্ছন্ন আবহাওয়ায় জমিতে সেচ দেওয়া বন্ধ রাখুন এবং আক্রান্ত গাছ দ্রুত তুলে ধ্বংস করুন।'
    ],
    confusing_with: ['tomato_early_blight'],
    comparison: [
      {
        withClassId: 'tomato_early_blight',
        points: [
          { feature: 'দাগের ধরণ', this_disease: 'পানি-ভেজা বড় ছড়ানো ক্ষত এবং স্যাঁতসেঁতে ছাতা।', other_disease: 'বৃত্তাকার কালচে রিংযুক্ত দাগ (Target-like rings)।' },
          { feature: 'আবহাওয়ার প্রভাব', this_disease: 'ঠান্ডা, কুয়াশা ও বৃষ্টির পর দ্রুত মহামারী আকার ধারণ করে।', other_disease: 'উষ্ণ ও মাঝারি আর্দ্র আবহাওয়ায় ধীরে ধীরে ছড়ায়।' },
          { feature: 'ফল ও কান্ড', this_disease: 'ফল ও কান্ডে বড় বড় কালচে পচন ক্ষত সৃষ্টি করে।', other_disease: 'কান্ডে ছোট গাঢ় দাগ ফেলে কিন্তু ফল সহজে পচে ঝরে না।' }
        ]
      }
    ]
  },
  'potato_early_blight': {
    classId: 'potato_early_blight',
    name_bn: 'আলুর আগাম ধসা রোগ (Potato Early Blight)',
    crop_bn: 'আলু',
    cause_bn: 'অল্টারনারিয়া সোলানি (Alternaria solani) ছত্রাক',
    symptoms_bn: [
      'পাতার উপর ছোট ছোট কোণাকার গাঢ় বাদামী দাগ পড়ে যা ধীরে ধীরে বাড়ে।',
      'দাগের ভেতরে চক্রাকার বলয় বা রিং রেখা (Concentric rings) স্পষ্ট দেখা যায়।',
      'গাছের নিচের পাতা আগে আক্রান্ত হয় ও শুকিয়ে ঝরে যায়।'
    ],
    remedies_bn: [
      'কপার অক্সিক্লোরাইড বা রোভরাল ছত্রাকনাশক স্প্রে করুন।',
      'ফসলের ধ্বংসাবশেষ পুড়িয়ে ফেলুন এবং সুষম নাইট্রোজেন সার ব্যবহার করুন।'
    ],
    confusing_with: ['potato_late_blight'],
    comparison: [
      {
        withClassId: 'potato_late_blight',
        points: [
          { feature: 'দাগের আকৃতি', this_disease: 'বৃত্তাকার বলয় বা টার্গেটের মতো বলয় রেখা স্পষ্ট।', other_disease: 'অনিয়মিত বড় ক্ষত, চারপাশে হালকা হলদে রিং।' },
          { feature: 'সাদা ছাতা', this_disease: 'দাগে কোনো সাদা ছত্রাকের বৃদ্ধি দেখা যায় না।', other_disease: 'পাতার নিচ পিঠে আর্দ্রতায় সাদা পাউডারের মতো ছাতা পড়ে।' },
          { feature: 'ক্ষতির গতি', this_disease: 'আস্তে আস্তে ছড়ায়, ফলন আংশিক হ্রাস করে।', other_disease: '১-২ দিনের মধ্যে পুরো মাঠের আলু গাছ ঝলসে মেরে ফেলতে পারে।' }
        ]
      }
    ]
  },
  'potato_late_blight': {
    classId: 'potato_late_blight',
    name_bn: 'আলুর মড়ক বা নাভি ধসা রোগ (Potato Late Blight)',
    crop_bn: 'আলু',
    cause_bn: 'ফাইটোপথোরা ইনফেসট্যান্স (Phytophthora infestans) ছত্রাক',
    symptoms_bn: [
      'পাতায় পানি-ভেজা অনিয়মিত আকৃতির কালচে ক্ষত দেখা দেয় যা খুব দ্রুত বাড়ে।',
      'আর্দ্র ও কুয়াশাচ্ছন্ন সকালে পাতার উল্টো পিঠে সাদা তুলার মতো ছত্রাক স্তর দেখা যায়।',
      'কয়েক দিনের মধ্যে মাঠের সমস্ত আলু গাছ ঝলসে পচে দুর্গন্ধ বের হয়।'
    ],
    remedies_bn: [
      'সিকিউর বা রিডোমিল গোল্ড ছত্রাকনাশক কুয়াশার পূর্বাভাস পেলেই স্প্রে করুন।',
      'আক্রান্ত জমিতে সেচ দেওয়া সম্পূর্ণ বন্ধ রাখুন এবং আক্রান্ত গাছ দ্রুত উপড়ে পুড়িয়ে ফেলুন।'
    ],
    confusing_with: ['potato_early_blight'],
    comparison: [
      {
        withClassId: 'potato_early_blight',
        points: [
          { feature: 'দাগের আকৃতি', this_disease: 'অনিয়মিত বড় ক্ষত, চারপাশে হালকা হলদে রিং।', other_disease: 'বৃত্তাকার বলয় বা টার্গেটের মতো বলয় রেখা স্পষ্ট।' },
          { feature: 'আক্রমণকাল', this_disease: 'মাঝারি থেকে তীব্র কুয়াশা ও ঠান্ডার রাতে দ্রুত বাড়ে।', other_disease: 'উষ্ণ আবহাওয়ায় গাছের বয়স বাড়ার সাথে সাথে দেখা দেয়।' },
          { feature: 'কন্দ (Tuber) পচন', this_disease: 'আলুর ভেতরে কালচে মরিচা রঙের পচন সৃষ্টি করে।', other_disease: 'আলুর কন্দ সাধারণত পচে না বা আংশিক কুঁকড়ে শুকিয়ে যায়।' }
        ]
      }
    ]
  }
};

// Clarifying questions database
export const CLARIFYING_QUESTIONS_DB: Record<string, ClarifyingQuestion[]> = {
  'rice': [
    {
      id: 'q_rice_spindle',
      question: 'পাতার দাগগুলো কি দুই মাথায় সুচালো বা চোখের (Spindle) মতো আকৃতির?',
      options: ['হ্যাঁ, চোখের মতো লম্বাটে', 'না, গোলাকার বা ডিম্বাকার', 'নিশ্চিত নই'],
      affects: {
        'rice_blast': 4,
        'rice_brown_spot': -4
      }
    },
    {
      id: 'q_rice_center',
      question: 'দাগের মাঝখানের অংশ কি হালকা ধূসর বা ছাই রঙের?',
      options: ['হ্যাঁ, ধূসর/ছাই রঙের', 'না, হালকা বাদামী বা হলদেটে', 'নিশ্চিত নই'],
      affects: {
        'rice_blast': 3,
        'rice_brown_spot': -3
      }
    },
    {
      id: 'q_rice_neck',
      question: 'ধানের শীষের গোড়ার কান্ড কি কালো হয়ে পচে ভেঙে পড়ছে?',
      options: ['হ্যাঁ, ভেঙে পড়ছে', 'না, কান্ড সুস্থ আছে', 'নিশ্চিত নই'],
      affects: {
        'rice_blast': 5, // Neck Blast indicator
        'rice_brown_spot': -2
      }
    }
  ],
  'tomato': [
    {
      id: 'q_tomato_rings',
      question: 'পাতার কালো দাগের ভেতরে কি চক্রাকার রিং (Concentric circles) দেখা যায়?',
      options: ['হ্যাঁ, রিং দেখা যায়', 'না, রিং ছাড়া বড় ক্ষত', 'নিশ্চিত নই'],
      affects: {
        'tomato_early_blight': 4,
        'tomato_late_blight': -4
      }
    },
    {
      id: 'q_tomato_white_mold',
      question: 'সকালে পাতার নিচের পিঠে কি তুলার মতো সাদা বা ধূসর ছাতা দেখা যায়?',
      options: ['হ্যাঁ, সাদা ছাতা দেখা যায়', 'না, পাতা শুকনা', 'নিশ্চিত নই'],
      affects: {
        'tomato_late_blight': 5,
        'tomato_early_blight': -5
      }
    },
    {
      id: 'q_tomato_speed',
      question: 'রোগটি কি কুয়াশা ও বৃষ্টির পর ১-২ দিনের মধ্যে মারাত্মকভাবে ছড়িয়ে পড়েছে?',
      options: ['হ্যাঁ, খুব দ্রুত ছড়াচ্ছে', 'না, নিচ থেকে ধীরে ধীরে ছড়াচ্ছে', 'নিশ্চিত নই'],
      affects: {
        'tomato_late_blight': 4,
        'tomato_early_blight': -2
      }
    }
  ],
  'potato': [
    {
      id: 'q_potato_target',
      question: 'পাতার দাগগুলোর ভেতরে কি গোল গোল রিং বা চক্রাকার বলয় স্পষ্ট?',
      options: ['হ্যাঁ, চক্রাকার বলয় আছে', 'না, বলয়হীন ছড়ানো পচন', 'নিশ্চিত নই'],
      affects: {
        'potato_early_blight': 4,
        'potato_late_blight': -4
      }
    },
    {
      id: 'q_potato_underside_mold',
      question: 'কুয়াশাচ্ছন্ন আবহাওয়ায় পাতার নিচ পিঠে কি সাদা গুঁড়ো ছাতা দেখা যাচ্ছে?',
      options: ['হ্যাঁ, সাদা ছাতা আছে', 'না, পাতা শুকনো', 'নিশ্চিত নই'],
      affects: {
        'potato_late_blight': 5,
        'potato_early_blight': -5
      }
    },
    {
      id: 'q_potato_odor',
      question: 'গাছ কি পচে ঢলে পড়ছে এবং মাঠ থেকে তীব্র দুর্গন্ধ বের হচ্ছে?',
      options: ['হ্যাঁ, দুর্গন্ধ বের হচ্ছে', 'না, স্বাভাবিক শুকনা পচন', 'নিশ্চিত নই'],
      affects: {
        'potato_late_blight': 4,
        'potato_early_blight': -2
      }
    }
  ]
};
