import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Dimensions
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Sprout,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Layers,
  Award,
  Droplet,
  ShieldAlert,
  ClipboardList,
  Compass,
  RotateCw,
  CheckCircle,
  TrendingUp,
  HelpCircle
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CROPS, Crop } from '@/constants/data';
import { Colors } from '@/constants/theme';

interface RotationFollower {
  name: string;
  benefits: string;
}

interface RotationPlan {
  crop_name: string;
  season_bn: string;
  ideal_followers: RotationFollower[];
  pest_benefit: string;
  soil_benefit: string;
}

const ROTATION_DATABASE: RotationPlan[] = [
  {
    crop_name: "ধান (বোরো)",
    season_bn: "রবি - গ্রীষ্ম মৌসুম",
    ideal_followers: [
      { name: "ধান (আমন)", benefits: "বোরো ধানের পর রোপা আমন চাষে মাটির আর্দ্রতা এবং অবশিষ্ট পুষ্টি উপাদান নিখুঁতভাবে কাজে লাগানো যায়।" },
      { name: "মুগ ডাল (সবুজ সার)", benefits: "ধান কাটার পর পতিত সময়ে মুগ ডাল চাষ করলে এটি মাটিতে প্রচুর পরিমাণ নাইট্রোজেন যোগ করে।" }
    ],
    pest_benefit: "ধানের মাঝখানে ডাল জাতীয় ফসল চাষ করলে মাজরা পোকা ও পাতার ব্লাস্ট রোগের জীবাণুর বংশবৃদ্ধি চক্র ভেঙে যায়।",
    soil_benefit: "ডাল ফসলের শিকড় বায়ুমন্ডল থেকে নাইট্রোজেন শোষণ করে মাটিতে জমা করে, ফলে পরবর্তী ফসলে ইউরিয়া কম লাগে।"
  },
  {
    crop_name: "আলু",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "ভুট্টা", benefits: "আলু উত্তোলনের পর উচ্চ পুষ্টি গ্রহণকারী ভুট্টা চাষে আলুর অবশিষ্ট সারের সর্বোচ্চ ব্যবহার হয়।" },
      { name: "তোষা পাট", benefits: "পাটের গভীর শিকড় মাটির নিচের স্তরের পুষ্টি টেনে আনে এবং পাটের পাতা পচে প্রচুর জৈব সার তৈরি করে।" }
    ],
    pest_benefit: "আলুর পর পাট বা تিল চাষ করলে আলুর সাধারণ স্কেব ব্যাকটেরিয়া এবং কৃমি পোকা (Nematode) দমন হয়।",
    soil_benefit: "আলু চাষে মাটি গভীরভাবে আলগা করতে হয়, যা মাটির অক্সিজেন বৃদ্ধি করে ও পরবর্তী ফসলের শিকড় গঠনে সাহায্য করে।"
  },
  {
    crop_name: "দেশি পেঁয়াজ",
    season_bn: "শীতকাল ও গ্রীষ্মকাল",
    ideal_followers: [
      { name: "কাঁচা মরিচ বা বেগুন", benefits: "পেঁয়াজের অগভীর শিকড়ের পর মরিচের মাঝারি শিকড় মাটির পুষ্টি সুষম রাখে।" },
      { name: "তিল (তৈলবীজ)", benefits: "পেঁয়াজ তোলার পর কম সেচ চাহিদার তিল চাষে অতিরিক্ত সার ছাড়াই ভালো ফলন পাওয়া যায়।" }
    ],
    pest_benefit: "পেঁয়াজের ঝাঁঝালো অ্যালিসিন উপাদানের প্রভাবে মাটির ক্ষতিকর রোগজীবাণু ও নিমাটোড বা কৃমি পোকা মারা যায়।",
    soil_benefit: "পেঁয়াজ মাটির অম্লত্বের সমতা বজায় রাখতে সাহায্য করে এবং মাটির উপরিভাগের শক্ত স্তর নরম করে।"
  },
  {
    crop_name: "কাঁচা মরিচ",
    season_bn: "খরিপ ও রবি মৌসুম",
    ideal_followers: [
      { name: "মসুর ডাল বা মুগ ডাল", benefits: "ডাল ফসল চাষে মরিচের ক্ষয়িত নাইট্রোজেন প্রাকৃতিকভাবে ফিরে আসে।" },
      { name: "বারি সরিষা", benefits: "মরিচ তোলার পর দ্রুততম সময়ে সরিষা চাষ করলে জমির সুপ্ত আর্দ্রতার উর্বর ব্যবহার হয়।" }
    ],
    pest_benefit: "মরিচের পর ডাল ফসল চাষ করলে মরিচের ভাইরাস বাহক সাদা মাছি ও থ্রিপস পোকার বংশবৃদ্ধি সম্পূর্ণ ব্যাহত হয়।",
    soil_benefit: "ডাল জাতীয় ফসল মাটির ক্ষয়রোধ করে এবং মাটিতে ফসফরাস ও নাইট্রোজেন সারের কার্যকারিতা বৃদ্ধি করে।"
  },
  {
    crop_name: "ভুট্টা",
    season_bn: "রবি ও গ্রীষ্ম মৌসুম",
    ideal_followers: [
      { name: "মুগ ডাল (সবুজ সার)", benefits: "ভুট্টার পর মাটিতে নাইট্রোজেন বাড়াতে মুগ চাষ ও কচি গাছ মাটিতে চাষ দিয়ে মিশিয়ে দেওয়া উত্তম।" },
      { name: "ধান (আমন)", benefits: "ভুট্টা কাটার পর বর্ষার শুরুতে আমন ধান রোপণ করলে মাটির পুষ্টি সুষম বণ্টন হয়।" }
    ],
    pest_benefit: "ভুট্টার পর ডাল চাষে ভুট্টার ফল আর্মিওয়ার্ম পোকা ও কান্ড পচা ছত্রাকের বংশবিস্তার চক্র ধ্বংস হয়ে যায়।",
    soil_benefit: "ভুট্টা গাছ উত্তোলনের পর শিকড় মাটিতে পচে জৈব উপাদান বাড়ায় এবং মাটির ভেতরের পানি ধারণ ক্ষমতা বাড়ায়।"
  },
  {
    crop_name: "ধান (আমন)",
    season_bn: "বর্ষাকাল (খরিপ-২)",
    ideal_followers: [
      { name: "আলু বা বারি সরিষা", benefits: "আমন ধান কাটার পর মাটিতে আর্দ্রতা থাকতেই দ্রুত আলু বা সরিষা রোপণ করলে কম সেচে ভালো ফলন হয়।" },
      { name: "খেসারি ডাল", benefits: "ধান কাটার আগে রিলে ক্রপিং হিসেবে খেসারি বীজ ছিটিয়ে দিলে ধান কাটার সাথে সাথে চারা বাড়ে।" }
    ],
    pest_benefit: "আমন ধানের পর সরিষা চাষ করলে ধান পাতার লেদা পোকা ও গন্ধি পোকার জীবাণু সম্পূর্ণ ধ্বংস হয়ে যায়।",
    soil_benefit: "খেসারি ডাল বিনা চাষে মাটিতে নাইট্রোজেন ও ব্যাকটেরিয়া বৃদ্ধি করে মাটির উর্বরতা পুনরুদ্ধার করে।"
  },
  {
    crop_name: "বারি সরিষা",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "ধান (বোরো)", benefits: "সরিষা কাটার পর বোরো ধান রোপণ করলে সরিষার অবশিষ্টাংশ মাটির রন্ধ্রতা বাড়ায়।" },
      { name: "মুগ ডাল", benefits: "সরিষার পর মুগ ডাল চাষে মাটির ক্ষয়প্রাপ্ত পুষ্টি উপাদান প্রাকৃতিক উপায়ে পূরণ হয়।" }
    ],
    pest_benefit: "সরিষার শিকড় নিঃসৃত রস ও তেলের অবশিষ্টাংশ মাটির ক্ষতিকারক ছত্রাক ও কৃমির জন্য প্রাকৃতিক প্রতিষেধক হিসেবে কাজ করে।",
    soil_benefit: "সরিষা কাটার পর শিকড় পচে মাটির রন্ধ্রতা বৃদ্ধি করে, যা পরবর্তী বোরো ধানের চারা সহজে কুশি গজাতে সাহায্য করে।"
  },
  {
    crop_name: "বেগুন",
    season_bn: "সারা বছর চাষ উপযোগী",
    ideal_followers: [
      { name: "লাল শাক বা পালং শাক", benefits: "বেগুনের পর স্বল্পমেয়াদী শাক চাষে মাটির উপরিভাগের পুষ্টি পুনরায় সচল হয়।" },
      { name: "ধঞ্চে (সবুজ সার)", benefits: "ধঞ্চে চাষ করে কচি অবস্থায় চাষ দিয়ে মাটিতে মিশিয়ে দিলে মাটির উর্বরতা অনেক বাড়ে।" }
    ],
    pest_benefit: "বেগুনের ডগা ও ফল ছিদ্রকারী পোকার তীব্র আক্রমণ কমাতে বেগুনের পর সবুজ সার ধঞ্চে চাষ করে জমি শোধন করা জরুরি।",
    soil_benefit: "ধঞ্চে জৈব সার হিসেবে পচে মাটির অম্লতা ও ক্ষারত্বের সমতা ফিরিয়ে আনে ও বেগুনের পুষ্টি ঘাটতি পূরণ করে।"
  },
  {
    crop_name: "টমেটো",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "মুগ ডাল", benefits: "টমেটো চাষে ক্ষয়িত নাইট্রোজেন প্রাকৃতিকভাবে মাটিতে ফিরিয়ে আনতে মুগ ডাল চাষ অত্যন্ত উপকারী।" },
      { name: "দেশি পেঁয়াজ", benefits: "টমেটোর পর পেঁয়াজ চাষ মাটির সুষম পুষ্টিচক্র বজায় রাখতে ভূমিকা রাখে।" }
    ],
    pest_benefit: "টমেটোর পর পেঁয়াজ চাষ করলে টমেটোর ক্ষতিকর ব্যাকটেরিয়াল উইল্ট এবং শিকড় পচা নেমাটোড সম্পূর্ণ ধ্বংস হয়ে যায়।",
    soil_benefit: "ডাল ফসল মাটিতে জৈব পদার্থ যোগ করে টমেটোর অতিরিক্ত পুষ্টি শোষণজনিত ঘাটতি প্রাকৃতিকভাবে পুনরুদ্ধার করে।"
  },
  {
    crop_name: "মিষ্টি কুমড়া",
    season_bn: "খরিপ ও রবি মৌসুম",
    ideal_followers: [
      { name: "ধান (বোরো)", benefits: "কুমড়ার পর বোরো ধানের চাষ মাটির পুষ্টি ও আগাছা নিয়ন্ত্রণে চমৎকার ভূমিকা রাখে।" },
      { name: "বারি সরিষা", benefits: "কুমড়া কাটার পর জমিতে সরিষা চাষ করলে অবশিষ্ট পুষ্টির সুষম ব্যবহার সম্ভব হয়।" }
    ],
    pest_benefit: "কুমড়ার পর বোরো ধান চাষে প্লাবিত মাটির কারণে কুমড়ার লাল বিটল পোকার ডিম ও সুপ্ত লার্ভা শ্বাসরুদ্ধ হয়ে মারা যায়।",
    soil_benefit: "কুমড়ার বড় পাতা মাটিকে ঢেকে রেখে আর্দ্রতা ও নাইট্রোজেন ক্ষয়রোধ করে এবং মাটি আলগা ও ঝুরঝুরে রাখে।"
  },
  {
    crop_name: "আদা",
    season_bn: "গ্রীষ্ম ও বর্ষাকাল (খরিপ)",
    ideal_followers: [
      { name: "মুগ ডাল", benefits: "আদা উত্তোলনের পর পতিত জমিতে মুগ ডাল চাষে মাটির উর্বরতা পুনরুদ্ধার করা যায়।" },
      { name: "বারি সরিষা", benefits: "আদার পর কম পুষ্টি শোষণকারী সরিষা চাষ মাটির অতিরিক্ত পুষ্টি ক্ষয় নিয়ন্ত্রণ করে।" }
    ],
    pest_benefit: "আদার পর ডাল জাতীয় শস্য বা সরিষা চাষ করলে আদার রাইজোম রট বা আদা পচা ছত্রাকের বংশবিস্তার সম্পূর্ণ ব্যাহত হয়।",
    soil_benefit: "আদা চাষে প্রচুর পরিমাণে পটাশ প্রয়োজন হয়, পরবর্তী ডাল শস্য চাষ মাটিতে নাইট্রোজেনের সমতা ফিরিয়ে আনে।"
  },
  {
    crop_name: "হলুদ",
    season_bn: "গ্রীষ্ম ও বর্ষাকাল (খরিপ)",
    ideal_followers: [
      { name: "তোষা পাট", benefits: "হলুদ তোলার পর পাটের চাষ মাটিতে প্রচুর পাতা পচা জৈব সার যোগ করে।" },
      { name: "দেশি পেঁয়াজ", benefits: "পেঁয়াজের অগভীর শিকড় হলুদের গভীর পুষ্টি স্তরের ভারসাম্য সুষম রাখে।" }
    ],
    pest_benefit: "হলুদ উত্তোলনের পর পাট চাষ করলে হলুদের সুপ্ত রাইজোম উইভিল পোকার লার্ভা ও ডিম নষ্ট হয়ে যায়।",
    soil_benefit: "হলুদ মাটির গভীর থেকে পুষ্টি টানে, পরবর্তী অগভীর পেঁয়াজ চাষ মাটির উপরিভাগের পুষ্টিচক্র সচল রাখে।"
  },
  {
    crop_name: "রসুন",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "তোষা পাট", benefits: "রসুন তোলার পর পাট চাষে অতিরিক্ত সার ছাড়াই পাট দ্রুত ও স্বাস্থ্যকরভাবে বাড়ে।" },
      { name: "মিষ্টি কুমড়া", benefits: "রসুনের পর মিষ্টি কুমড়া চাষ মাটির পুষ্টি সুষম বণ্টন ও পানি ধরে রাখতে সাহায্য করে।" }
    ],
    pest_benefit: "রসুনের তীব্র ঝাঁঝালো উদ্বায়ী সালফার যৌগ মাটির ক্ষতিকর ছত্রাক ও ক্ষতিকর ব্যাকটেরিয়ার প্রাকৃতিক প্রতিষেধক হিসেবে কাজ করে।",
    soil_benefit: "রসুন মাটির ক্ষারত্ব হ্রাস করে অম্লত্ব নিয়ন্ত্রণ করে এবং মাটির স্বাস্থ্য ও উউর্বরতা সচল রাখতে ভূমিকা রাখে।"
  },
  {
    crop_name: "বাঁধাকপি",
    season_bn: "শীতকাল (রবি মৌসুম)",
    ideal_followers: [
      { name: "মুগ ডাল", benefits: "কপির পর মাটিতে নাইট্রোজেন ও ব্যাকটেরিয়া বাড়াতে মুগ চাষ ও কচি গাছ মাটিতে মিশিয়ে দেওয়া উত্তম।" },
      { name: "দেশি পেঁয়াজ", benefits: "বাঁধাকপি কাটার পর পেঁয়াজ চাষ মাটির উর্বরতা ও পুষ্টি স্তর নিয়ন্ত্রণে সাহায্য করে।" }
    ],
    pest_benefit: "বাঁধাকপির পর মুগ ডাল চাষ করলে বাঁধাকপির মাথা পচা ব্যাকটেরিয়া ও শুঁয়োপোকার বংশবিস্তার চক্র ধ্বংস হয়।",
    soil_benefit: "ডাল ফসল শিকড়ে নাইট্রোজেন নোডিউল তৈরি করে বাঁধাকপির অতিরিক্ত ক্ষয়িত নাইট্রোজেন প্রাকৃতিকভাবে ফিরিয়ে দেয়।"
  },
  {
    crop_name: "করলা",
    season_bn: "গ্রীষ্ম ও বর্ষাকাল",
    ideal_followers: [
      { name: "ধান (আমন)", benefits: "করলা কাটার পর আমন ধান রোপণ করলে বর্ষার পানি করলার ক্ষতিকর পোকা দমনে কাজ করে।" },
      { name: "বারি সরিষা", benefits: "করলার পর সরিষা চাষে সুপ্ত সারের উর্বর ব্যবহার সম্ভব হয়।" }
    ],
    pest_benefit: "করলা চাষের পর আমন ধান চাষ করলে জমিতে জমে থাকা পানি করলার শিকড় পচা নেমাটোড ও সাদা মাছি ধ্বংস করে।",
    soil_benefit: "সরিষা কাটার পর শিকড় পচে মাটির রন্ধ্রতা বাড়ায় যা করলার লতা ও শিকড়ের অক্সিজেন গ্রহণ ত্বরান্বিত করে।"
  },
  {
    crop_name: "তরমুজ",
    season_bn: "বসন্ত ও গ্রীষ্মকাল",
    ideal_followers: [
      { name: "তোষা পাট", benefits: "তরমুজ কাটার পর পাট চাষ করলে মাটির উপরিভাগের পুষ্টি ও জৈব উপাদান প্রাকৃতিকভাবে বাড়ে।" },
      { name: "মুগ ডাল", benefits: "তরমুজের পর মুগ ডাল চাষ মাটির নাইট্রোজেন সমতা বজায় রাখতে সাহায্য করে।" }
    ],
    pest_benefit: "তরমুজ সংগ্রহের পর পাট চাষ করলে তরমুজের ক্ষতিকর ফিউজেরিয়াম উইল্ট ছত্রাকের সুপ্ত স্পোর মাটি থেকে নিষ্ক্রিয় হয়।",
    soil_benefit: "তরমুজের পর গভীর শিকড়ের তোষা পাট চাষ মাটির নিচের স্তরের অতিরিক্ত পটাশ ও ক্যালসিয়ামের ভারসাম্য রক্ষা করে।"
  }
];

export default function CropsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  // Tab State
  const [activeTab, setActiveTab] = useState<'handbook' | 'matchmaker' | 'rotation'>('handbook');

  // Handbook States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCropId, setExpandedCropId] = useState<string | null>(null);

  // Matchmaker States
  const [soilType, setSoilType] = useState<string>('দোআঁশ');
  const [season, setSeason] = useState<string>('রবি');
  const [matchedCrops, setMatchedCrops] = useState<Crop[]>([]);
  const [matchedCalculated, setMatchedCalculated] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Rotation States
  const [selectedRotationPlan, setSelectedRotationPlan] = useState<RotationPlan>(ROTATION_DATABASE[0]);
  const [showRotationDropdown, setShowRotationDropdown] = useState(false);

  useEffect(() => {
    if (params.tab === 'matchmaker') {
      setActiveTab('matchmaker');
    } else if (params.tab === 'rotation') {
      setActiveTab('rotation');
    } else {
      setActiveTab('handbook');
    }
  }, [params.tab]);

  const categories = [
    { key: 'all', label: 'সব ফসল' },
    { key: 'grain', label: 'দানা শস্য' },
    { key: 'vegetable', label: 'শাকসবজি' },
    { key: 'fruit', label: 'ফলমূল' },
    { key: 'spice', label: 'মসলাপাতি' },
    { key: 'commercial', label: 'অর্থকরী' }
  ];

  // Filter crops for Handbook
  const filteredCrops = CROPS.filter(crop => {
    const matchesSearch = 
      crop.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientific_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate suitability for Matchmaker
  const handleMatchCrops = () => {
    const results = CROPS.filter(crop => {
      const matchesSoil = crop.soil_preference.some(pref => pref.includes(soilType));
      const matchesSeason = crop.seasons.some(s => s.includes(season));
      return matchesSoil && matchesSeason;
    });
    // Sort results by average profit (descending)
    results.sort((a, b) => b.profit_avg - a.profit_avg);
    setMatchedCrops(results);
    setMatchedCalculated(true);
  };

  const toggleExpand = (id: string) => {
    if (expandedCropId === id) {
      setExpandedCropId(null);
    } else {
      setExpandedCropId(id);
    }
  };

  const toggleMatchExpand = (id: string) => {
    if (expandedMatchId === id) {
      setExpandedMatchId(null);
    } else {
      setExpandedMatchId(id);
    }
  };

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const getWaterLabel = (req: string) => {
    switch (req) {
      case 'high': return 'অধিক পানি';
      case 'medium': return 'মাঝারি পানি';
      case 'low': return 'কম পানি';
      default: return req;
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      
      {/* Top Premium Header with dynamic safe area insets */}
      <View style={[
        styles.headerContainer, 
        { 
          borderBottomColor: themeColors.border,
          paddingTop: insets.top + 6,
          paddingBottom: 12,
          backgroundColor: themeColors.cardBackground
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
        >
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.title, { color: themeColors.text }]}>ফসলের চাষ নির্দেশিকা 📖</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            সকল ফসলের আধুনিক চাষাবাদ পদ্ধতি, সারের নিয়ম ও লাভজনক ফসল চক্র
          </Text>
        </View>
      </View>

      {/* 3-Tab Navigator */}
      <View style={[styles.tabsContainer, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('handbook')}
          style={[styles.tabBtn, activeTab === 'handbook' && [styles.activeTabBtn, { borderBottomColor: themeColors.primary }]]}
        >
          <Text style={[styles.tabBtnText, { color: activeTab === 'handbook' ? themeColors.primary : themeColors.textSecondary }]}>
            ফসলের বই
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('matchmaker')}
          style={[styles.tabBtn, activeTab === 'matchmaker' && [styles.activeTabBtn, { borderBottomColor: themeColors.primary }]]}
        >
          <Text style={[styles.tabBtnText, { color: activeTab === 'matchmaker' ? themeColors.primary : themeColors.textSecondary }]}>
            ম্যাচমেকার 📊
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('rotation')}
          style={[styles.tabBtn, activeTab === 'rotation' && [styles.activeTabBtn, { borderBottomColor: themeColors.primary }]]}
        >
          <Text style={[styles.tabBtnText, { color: activeTab === 'rotation' ? themeColors.primary : themeColors.textSecondary }]}>
            ফসল চক্র 🔄
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: CROPS HANDBOOK */}
      {activeTab === 'handbook' && (
        <View style={{ flex: 1 }}>
          {/* Search Input Card */}
          <View style={styles.searchSection}>
            <View style={[styles.searchBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <Search size={18} color={themeColors.textSecondary} style={styles.searchIcon} />
              <TextInput
                placeholder="ফসল বা বৈজ্ঞানিক নাম দিয়ে খুঁজুন..."
                placeholderTextColor={themeColors.textSecondary}
                style={[styles.searchInput, { color: themeColors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Categories Horizontal Scroll */}
          <View style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => {
                      setSelectedCategory(cat.key);
                      setExpandedCropId(null);
                    }}
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
                      isActive && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                    ]}
                  >
                    <Text style={[
                      styles.categoryText, 
                      { color: themeColors.textSecondary },
                      isActive && { color: '#fff', fontWeight: 'bold' }
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Crops Accordion List */}
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {filteredCrops.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Sprout size={48} color={themeColors.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>কোনো ফসল খুঁজে পাওয়া যায়নি।</Text>
              </View>
            ) : (
              filteredCrops.map((crop) => {
                const isExpanded = expandedCropId === crop.id;
                return (
                  <View 
                    key={crop.id} 
                    style={[
                      styles.cropItemCard, 
                      { 
                        backgroundColor: themeColors.cardBackground, 
                        borderColor: themeColors.border 
                      },
                      isExpanded && { borderColor: themeColors.primary, borderWidth: 1.5 }
                    ]}
                  >
                    {/* Header Row clickable to expand */}
                    <TouchableOpacity 
                      onPress={() => toggleExpand(crop.id)} 
                      style={styles.cropHeaderRow}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cropIconTitleColumn}>
                        <View style={[styles.cropIconCircle, { backgroundColor: 'rgba(46, 125, 50, 0.08)' }]}>
                          <Sprout size={22} color={themeColors.primary} />
                        </View>
                        <View style={styles.cropTitleColumn}>
                          <Text style={[styles.cropName, { color: themeColors.text }]}>{crop.name_bn}</Text>
                          <Text style={[styles.cropSciName, { color: themeColors.textSecondary }]}>{crop.scientific_name}</Text>
                        </View>
                      </View>
                      <View style={styles.expandIconWrapper}>
                        {isExpanded ? (
                          <ChevronUp size={20} color={themeColors.primary} />
                        ) : (
                          <ChevronDown size={20} color={themeColors.textSecondary} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Expanded Accordion Body */}
                    {isExpanded && (
                      <View style={[styles.accordionBody, { borderTopColor: themeColors.border }]}>
                        
                        {/* Basic Info Badges Grid */}
                        <View style={styles.metricsGrid}>
                          <View style={[styles.metricCell, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                            <Layers size={16} color={themeColors.primary} />
                            <Text style={[styles.cellVal, { color: themeColors.text }]} numberOfLines={1}>
                              {crop.soil_preference.join(', ')}
                            </Text>
                            <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>পছন্দনীয় মাটি</Text>
                          </View>
                          
                          <View style={[styles.metricCell, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                            <Calendar size={16} color={themeColors.primary} />
                            <Text style={[styles.cellVal, { color: themeColors.text }]} numberOfLines={1}>
                              {crop.seasons.join(', ')}
                            </Text>
                            <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>চাষের সময়</Text>
                          </View>

                          <View style={[styles.metricCell, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                            <Droplet size={16} color={themeColors.primary} />
                            <Text style={[styles.cellVal, { color: themeColors.text }]} numberOfLines={1}>
                              {getWaterLabel(crop.water_requirement)}
                            </Text>
                            <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>পানির চাহিদা</Text>
                          </View>

                          <View style={[styles.metricCell, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                            <Award size={16} color={themeColors.primary} />
                            <Text style={[styles.cellVal, { color: themeColors.text }]} numberOfLines={1}>
                              {translateToBanglaDigits(crop.yield_avg)} মণ
                            </Text>
                            <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>বিঘাপ্রতি ফলন</Text>
                          </View>
                        </View>

                        {/* Detailed Cultivation Method */}
                        {crop.cultivation_method_bn && (
                          <View style={styles.detailsBlock}>
                            <View style={styles.blockHeader}>
                              <ClipboardList size={16} color={themeColors.primary} />
                              <Text style={[styles.blockTitle, { color: themeColors.text }]}>১. চাষাবাদ পদ্ধতি</Text>
                            </View>
                            <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>
                              {crop.cultivation_method_bn}
                            </Text>
                          </View>
                        )}

                        {/* Spacing Info */}
                        {crop.spacing_info_bn && (
                          <View style={styles.detailsBlock}>
                            <View style={styles.blockHeader}>
                              <Info size={16} color={themeColors.primary} />
                              <Text style={[styles.blockTitle, { color: themeColors.text }]}>২. রোপণের দূরত্ব ও নিয়ম</Text>
                            </View>
                            <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>
                              {crop.spacing_info_bn}
                            </Text>
                          </View>
                        )}

                        {/* Fertilizers Doses Accordion Section */}
                        {crop.fertilizers && crop.fertilizers.length > 0 && (
                          <View style={styles.detailsBlock}>
                            <View style={styles.blockHeader}>
                              <Layers size={16} color={themeColors.primary} />
                              <Text style={[styles.blockTitle, { color: themeColors.text }]}>৩. সুষম সার মাত্রা (বিঘাপ্রতি)</Text>
                            </View>
                            {crop.fertilizers.map((rule, idx) => (
                              <View key={idx} style={[styles.fertilizerTable, { borderColor: themeColors.border, backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
                                <View style={styles.fertilizerTableRowHeader}>
                                  <Text style={[styles.tableHeadText, { color: themeColors.text }]}>মৌসুম/জাত: {rule.season}</Text>
                                  <Text style={[styles.tableSourceText, { color: themeColors.textSecondary }]}>উৎস: {rule.source_org}</Text>
                                </View>
                                <View style={[styles.tableBodyRow, { borderBottomColor: themeColors.border }]}>
                                  <View style={styles.tableCol}>
                                    <Text style={[styles.colValue, { color: themeColors.text }]}>{translateToBanglaDigits(rule.urea)} কেজি</Text>
                                    <Text style={[styles.colLabel, { color: themeColors.textSecondary }]}>ইউরিয়া</Text>
                                  </View>
                                  <View style={styles.tableCol}>
                                    <Text style={[styles.colValue, { color: themeColors.text }]}>{translateToBanglaDigits(rule.tsp)} কেজি</Text>
                                    <Text style={[styles.colLabel, { color: themeColors.textSecondary }]}>টিএসপি</Text>
                                  </View>
                                  <View style={styles.tableCol}>
                                    <Text style={[styles.colValue, { color: themeColors.text }]}>{translateToBanglaDigits(rule.mop)} কেজি</Text>
                                    <Text style={[styles.colLabel, { color: themeColors.textSecondary }]}>এমওপি</Text>
                                  </View>
                                  <View style={styles.tableCol}>
                                    <Text style={[styles.colValue, { color: themeColors.text }]}>{translateToBanglaDigits(rule.gypsum)} কেজি</Text>
                                    <Text style={[styles.colLabel, { color: themeColors.textSecondary }]}>জিপসাম</Text>
                                  </View>
                                  <View style={styles.tableCol}>
                                    <Text style={[styles.colValue, { color: themeColors.text }]}>{translateToBanglaDigits(rule.zinc)} কেজি</Text>
                                    <Text style={[styles.colLabel, { color: themeColors.textSecondary }]}>দস্তা/জিংক</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Harvesting Timeline */}
                        {crop.harvest_duration_bn && (
                          <View style={styles.detailsBlock}>
                            <View style={styles.blockHeader}>
                              <Calendar size={16} color={themeColors.primary} />
                              <Text style={[styles.blockTitle, { color: themeColors.text }]}>৪. ফসল সংগ্রহ ও সংরক্ষণ</Text>
                            </View>
                            <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>
                              {crop.harvest_duration_bn}
                            </Text>
                          </View>
                        )}

                        {/* Diseases & Treatments Section */}
                        {crop.diseases && crop.diseases.length > 0 && (
                          <View style={styles.detailsBlock}>
                            <View style={styles.blockHeader}>
                              <ShieldAlert size={16} color={themeColors.error} />
                              <Text style={[styles.blockTitle, { color: themeColors.text }]}>৫. রোগ ও বালাই দমন গাইড</Text>
                            </View>
                            {crop.diseases.map((dis, idx) => (
                              <View key={idx} style={[styles.diseaseCard, { borderColor: themeColors.border }]}>
                                <Text style={[styles.diseaseTitle, { color: themeColors.error }]}>• {dis.name_bn}</Text>
                                <Text style={[styles.diseaseSubLabel, { color: themeColors.textSecondary }]}>লক্ষণ: {dis.symptoms}</Text>
                                <Text style={[styles.diseaseSubLabel, { color: themeColors.textSecondary }]}>कारण: {dis.cause_bn}</Text>
                                <View style={[styles.treatmentBox, { backgroundColor: 'rgba(76, 175, 80, 0.05)' }]}>
                                  <Text style={[styles.treatmentTitle, { color: themeColors.primary }]}>চিকিৎসা/প্রতিকার:</Text>
                                  <Text style={[styles.treatmentText, { color: themeColors.text }]}>{dis.treatment_bn}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* TAB 2: CROP SUITABILITY MATCHMAKER */}
      {activeTab === 'matchmaker' && (
        <ScrollView contentContainerStyle={styles.tabScrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.panelCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.panelHeaderRow}>
              <Compass size={24} color={themeColors.primary} />
              <Text style={[styles.panelTitle, { color: themeColors.text }]}>উপযুক্ত ফসল ম্যাচমেকার 📊</Text>
            </View>
            <Text style={[styles.panelDescription, { color: themeColors.textSecondary }]}>
              আপনার জমির মাটির ধরণ ও চাষের মৌসুম সিলেক্ট করুন। বিজ্ঞানসম্মত ডাটাবেস যাচাই করে আপনার মাটির জন্য সর্বোচ্চ ফলনশীল লাভজনক ফসলের সুপারিশ দেওয়া হবে।
            </Text>

            {/* Selectable Soil Chips */}
            <Text style={[styles.inputLabel, { color: themeColors.text, marginTop: 12 }]}>মাটির প্রকার নির্বাচন করুন:</Text>
            <View style={styles.chipsContainer}>
              {['দোআঁশ', 'এঁটেল', 'বেলে', 'বেলে দোআঁশ', 'এঁটেল দোআঁশ'].map((type) => {
                const isSelected = soilType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setSoilType(type);
                      setMatchedCalculated(false);
                    }}
                    style={[
                      styles.chipItem,
                      { borderColor: themeColors.border, backgroundColor: themeColors.background },
                      isSelected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                    ]}
                  >
                    <Text style={[styles.chipText, { color: themeColors.text }, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selectable Season Chips */}
            <Text style={[styles.inputLabel, { color: themeColors.text, marginTop: 16 }]}>চাষের মৌসুম নির্বাচন করুন:</Text>
            <View style={styles.chipsContainer}>
              {['রবি', 'খরিপ', 'বোরো', 'আমন', 'আউশ'].map((s) => {
                const isSelected = season === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => {
                      setSeason(s);
                      setMatchedCalculated(false);
                    }}
                    style={[
                      styles.chipItem,
                      { borderColor: themeColors.border, backgroundColor: themeColors.background },
                      isSelected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                    ]}
                  >
                    <Text style={[styles.chipText, { color: themeColors.text }, isSelected && { color: '#fff', fontWeight: 'bold' }]}>
                      {s} (মৌসুম)
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Match Action Button */}
            <TouchableOpacity 
              onPress={handleMatchCrops} 
              style={[styles.matchActionBtn, { backgroundColor: themeColors.primary }]}
            >
              <Text style={styles.matchActionBtnText}>লাভজনক ফসলসমূহ খুঁজুন ⚡</Text>
            </TouchableOpacity>
          </View>

          {/* Suitability Match Results list */}
          {matchedCalculated && (
            <View style={styles.resultsWrapper}>
              <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12 }]}>
                ফলাফল: {translateToBanglaDigits(matchedCrops.length)}টি মানানসই ফসল পাওয়া গেছে
              </Text>

              {matchedCrops.length === 0 ? (
                <View style={[styles.noMatchCard, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
                  <HelpCircle size={40} color={themeColors.textSecondary} style={{ opacity: 0.5 }} />
                  <Text style={[styles.noMatchText, { color: themeColors.text }]}>
                    দুঃখিত, এই প্রকার মাটি এবং মৌসুমে কোনো মানানসই ফসল পাওয়া যায়নি। অন্য অপশন ট্রাই করুন!
                  </Text>
                </View>
              ) : (
                matchedCrops.map((crop, idx) => {
                  const isExpanded = expandedMatchId === crop.id;
                  // Profit scoring aesthetic badge
                  const suitabilityPercent = 100 - (idx * 5) > 70 ? 100 - (idx * 5) : 70;
                  return (
                    <View 
                      key={crop.id}
                      style={[styles.matchCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                    >
                      <View style={styles.matchCardHeader}>
                        <View style={styles.matchHeadingCol}>
                          <View style={styles.cropTitleRow}>
                            <Sprout size={18} color={themeColors.primary} />
                            <Text style={[styles.matchCropName, { color: themeColors.text }]}>{crop.name_bn}</Text>
                          </View>
                          <Text style={[styles.matchCropSci, { color: themeColors.textSecondary }]}>{crop.scientific_name}</Text>
                        </View>
                        <View style={[styles.suitabilityBadge, { backgroundColor: '#DCFCE7' }]}>
                          <Text style={styles.suitabilityBadgeText}>{translateToBanglaDigits(suitabilityPercent)}% উপযুক্ত</Text>
                        </View>
                      </View>

                      {/* Small Quick Metric Columns */}
                      <View style={styles.quickMetricsRow}>
                        <View style={styles.quickMetricCell}>
                          <TrendingUp size={14} color="#16A34A" />
                          <Text style={[styles.quickMetricVal, { color: themeColors.text }]}>
                            {translateToBanglaDigits(crop.profit_avg)} টাকা
                          </Text>
                          <Text style={styles.quickMetricLbl}>গড় লাভ (বিঘা)</Text>
                        </View>

                        <View style={styles.quickMetricCell}>
                          <Award size={14} color={themeColors.primary} />
                          <Text style={[styles.quickMetricVal, { color: themeColors.text }]}>
                            {translateToBanglaDigits(crop.yield_avg)} মণ
                          </Text>
                          <Text style={styles.quickMetricLbl}>গড় ফলন (বিঘা)</Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        onPress={() => toggleMatchExpand(crop.id)} 
                        style={[styles.expandDetailBtn, { borderTopColor: themeColors.border }]}
                      >
                        <Text style={[styles.expandDetailText, { color: themeColors.primary }]}>
                          {isExpanded ? 'সংক্ষিপ্ত করুন ▲' : 'চাষাবাদ পদ্ধতি ও নিয়মাবলী দেখুন ▼'}
                        </Text>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.matchDetailsBody, { borderTopColor: themeColors.border }]}>
                          <Text style={[styles.matchMethodTitle, { color: themeColors.text }]}>• চাষাবাদের সংক্ষিপ্ত গাইড:</Text>
                          <Text style={[styles.matchMethodText, { color: themeColors.textSecondary }]}>
                            {crop.cultivation_method_bn || 'উপযুক্ত পদ্ধতিতে মাটি চাষ দিয়ে চারা রোপণ ও নিয়মিত পানি সেচ বজায় রাখুন।'}
                          </Text>
                          {crop.spacing_info_bn && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={[styles.matchMethodTitle, { color: themeColors.text }]}>• রোপণ দূরত্ব ও নিয়ম:</Text>
                              <Text style={[styles.matchMethodText, { color: themeColors.textSecondary }]}>{crop.spacing_info_bn}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}

        </ScrollView>
      )}

      {/* TAB 3: CROP ROTATION PLANNER */}
      {activeTab === 'rotation' && (
        <ScrollView contentContainerStyle={styles.tabScrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.panelCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.panelHeaderRow}>
              <RotateCw size={24} color={themeColors.primary} />
              <Text style={[styles.panelTitle, { color: themeColors.text }]}>ফসল চক্র পরিকল্পনাকারী (Crop Rotation) 🔄</Text>
            </View>
            <Text style={[styles.panelDescription, { color: themeColors.textSecondary }]}>
              একই জমিতে বারবার একই ফসল চাষ করলে মাটির নির্দিষ্ট পুষ্টি উপাদান ফুরিয়ে যায় এবং রোগবালাই বৃদ্ধি পায়। মাটির প্রাকৃতিকভাবে উর্বরতা বাড়াতে ও পোকা দমনে নিচে আপনার বর্তমান ফসলটি নির্বাচন করে বিজ্ঞানসম্মত ফসল চক্র বা রোটেশন সিকোয়েন্স দেখুন।
            </Text>

            {/* Dropdown for Current Crop selection */}
            <Text style={[styles.inputLabel, { color: themeColors.text, marginTop: 12 }]}>আপনার বর্তমান চাষকৃত ফসল নির্বাচন করুন:</Text>
            <TouchableOpacity
              style={[styles.dropdownTrigger, { borderColor: themeColors.border }]}
              onPress={() => setShowRotationDropdown(!showRotationDropdown)}
            >
              <Text style={[styles.dropdownTriggerText, { color: themeColors.text }]}>{selectedRotationPlan.crop_name}</Text>
              <Sprout size={16} color={themeColors.primary} />
            </TouchableOpacity>

            {showRotationDropdown && (
              <View style={[styles.dropdownOptions, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
                {ROTATION_DATABASE.map((plan) => (
                  <TouchableOpacity
                    key={plan.crop_name}
                    style={[styles.dropdownOptionItem, { borderBottomColor: themeColors.border }]}
                    onPress={() => {
                      setSelectedRotationPlan(plan);
                      setShowRotationDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownOptionText, { color: themeColors.text }]}>{plan.crop_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Visual Rotation Flow Diagram */}
          <View style={styles.flowContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12 }]}>মাটি সুরক্ষার জন্য রোটেশন চক্র:</Text>

            {/* Step 1: Current Crop */}
            <View style={[styles.flowStepCard, { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary }]}>
              <Text style={[styles.flowStepLabel, { color: themeColors.primary }]}>১ম ফসল (বর্তমান চাষ)</Text>
              <Text style={[styles.flowStepValue, { color: themeColors.text }]}>{selectedRotationPlan.crop_name}</Text>
              <Text style={[styles.flowStepSub, { color: themeColors.textSecondary }]}>মৌসুম: {selectedRotationPlan.season_bn}</Text>
            </View>

            {/* Arrow Divider */}
            <View style={styles.arrowContainer}>
              <Text style={{ fontSize: 24, color: themeColors.primary }}>⬇️</Text>
              <Text style={[styles.arrowText, { color: themeColors.textSecondary }]}>পরবর্তী রোটেশন ফসলসমূহ (২য় বিকল্প)</Text>
            </View>

            {/* Recommended Follower options */}
            {selectedRotationPlan.ideal_followers.map((f, i) => (
              <View key={i} style={[styles.flowStepCardFollower, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#F0FDF4', borderColor: colorScheme === 'dark' ? themeColors.border : '#BBF7D0' }]}>
                <View style={styles.followerHeader}>
                  <CheckCircle size={16} color="#16A34A" />
                  <Text style={[styles.followerName, { color: '#16A34A' }]}>{f.name}</Text>
                </View>
                <Text style={[styles.followerBenefit, { color: themeColors.text }]}>{f.benefits}</Text>
              </View>
            ))}

            {/* Scientific Benefits Panel */}
            <View style={[styles.benefitsReportCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <Text style={[styles.benefitsReportTitle, { color: themeColors.text }]}>🔬 বৈজ্ঞানিক মাটি উর্বরতা পুনরুদ্ধার রিপোর্ট:</Text>
              
              <View style={styles.reportRow}>
                <View style={[styles.reportIndicator, { backgroundColor: themeColors.primary }]} />
                <View style={styles.reportTextColumn}>
                  <Text style={[styles.reportLbl, { color: themeColors.text }]}>মাটি সুরক্ষার উর্বরতা সুবিধা:</Text>
                  <Text style={[styles.reportVal, { color: themeColors.textSecondary }]}>{selectedRotationPlan.soil_benefit}</Text>
                </View>
              </View>

              <View style={styles.reportRow}>
                <View style={[styles.reportIndicator, { backgroundColor: themeColors.error }]} />
                <View style={styles.reportTextColumn}>
                  <Text style={[styles.reportLbl, { color: themeColors.text }]}>বালাইনাশক ও রোগ চক্র ধ্বংস সুবিধা:</Text>
                  <Text style={[styles.reportVal, { color: themeColors.textSecondary }]}>{selectedRotationPlan.pest_benefit}</Text>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 48,
    alignItems: 'stretch',
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomWidth: 3,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  categoriesWrapper: {
    paddingVertical: 6,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 10,
  },
  tabScrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  cropItemCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cropHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cropIconTitleColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropTitleColumn: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cropSciName: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  expandIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  accordionBody: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCell: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  cellVal: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellLbl: {
    fontSize: 9,
  },
  detailsBlock: {
    marginTop: 14,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  blockText: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 4,
  },
  fertilizerTable: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  fertilizerTableRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  tableHeadText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableSourceText: {
    fontSize: 10,
  },
  tableBodyRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tableCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  colValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  colLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  diseaseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  diseaseTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diseaseSubLabel: {
    fontSize: 11,
    marginBottom: 2,
    lineHeight: 16,
  },
  treatmentBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  treatmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  treatmentText: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Matchmaker & Rotation general styles
  panelCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  panelDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chipItem: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    marginTop: 4,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchActionBtn: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  matchActionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Matchmaker results styles
  resultsWrapper: {
    marginTop: 8,
  },
  noMatchCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noMatchText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: 'bold',
  },
  matchCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matchHeadingCol: {
    flex: 1,
    gap: 2,
  },
  matchCropName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  matchCropSci: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingLeft: 24,
  },
  suitabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  suitabilityBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quickMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  quickMetricCell: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  quickMetricVal: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quickMetricLbl: {
    fontSize: 9,
    color: '#71717A',
  },
  expandDetailBtn: {
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  expandDetailText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchDetailsBody: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
    gap: 6,
  },
  matchMethodTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchMethodText: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Rotation planner styles
  flowContainer: {
    marginTop: 8,
  },
  flowStepCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  flowStepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  flowStepValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  flowStepSub: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 4,
  },
  arrowText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  flowStepCardFollower: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    gap: 6,
  },
  followerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  followerBenefit: {
    fontSize: 12,
    lineHeight: 17,
  },
  benefitsReportCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  benefitsReportTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  reportRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reportIndicator: {
    width: 6,
    borderRadius: 3,
  },
  reportTextColumn: {
    flex: 1,
    gap: 2,
  },
  reportLbl: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportVal: {
    fontSize: 12,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 8,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }
});
