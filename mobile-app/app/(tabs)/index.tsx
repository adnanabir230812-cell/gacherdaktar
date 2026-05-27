import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  useColorScheme,
  Image,
  Dimensions,
  Animated,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sprout,
  Database,
  Sun,
  CloudRain,
  ShieldAlert,
  Wind,
  Thermometer,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Award,
  BookOpen,
  MessageSquare,
  Calculator as CalcIcon,
  HelpCircle,
  Menu,
  Bell,
  X,
  WifiOff,
  DollarSign,
  Droplets,
  Coins,
  RotateCw,
  Compass
} from 'lucide-react-native';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DISTRICTS, CROPS, Crop, District } from '@/constants/data';
import { Colors } from '@/constants/theme';

const GREGORIAN_MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

interface BanglaDateResult {
  day: number;
  month: string;
  year: number;
}

function getBanglaDateInfo(d: Date): BanglaDateResult {
  const gYear = d.getFullYear();
  const gMonth = d.getMonth() + 1; // 1-indexed (1: Jan, 12: Dec)
  const gDate = d.getDate();

  let bDay = 1;
  let bMonth = '';
  let bYear = gYear - 593; // Default for post-April 14

  if (gMonth === 1) { // Jan
    if (gDate < 15) {
      bMonth = 'পৌষ';
      bDay = gDate + 16;
      bYear = gYear - 594;
    } else {
      bMonth = 'মাঘ';
      bDay = gDate - 14;
      bYear = gYear - 594;
    }
  } else if (gMonth === 2) { // Feb
    if (gDate < 14) {
      bMonth = 'মাঘ';
      bDay = gDate + 17;
      bYear = gYear - 594;
    } else {
      bMonth = 'ফাল্গুন';
      bDay = gDate - 13;
      bYear = gYear - 594;
    }
  } else if (gMonth === 3) { // Mar
    if (gDate < 16) {
      bMonth = 'ফাল্গুন';
      bDay = gDate + 15;
      bYear = gYear - 594;
    } else {
      bMonth = 'চৈত্র';
      bDay = gDate - 15;
      bYear = gYear - 594;
    }
  } else if (gMonth === 4) { // Apr
    if (gDate < 14) {
      bMonth = 'চৈত্র';
      bDay = gDate + 15;
      bYear = gYear - 594;
    } else {
      bMonth = 'বৈশাখ';
      bDay = gDate - 13;
      bYear = gYear - 593;
    }
  } else if (gMonth === 5) { // May
    if (gDate < 15) {
      bMonth = 'বৈশাখ';
      bDay = gDate + 17;
      bYear = gYear - 593;
    } else {
      bMonth = 'জ্যৈষ্ঠ';
      bDay = gDate - 14;
      bYear = gYear - 593;
    }
  } else if (gMonth === 6) { // Jun
    if (gDate < 15) {
      bMonth = 'জ্যৈষ্ঠ';
      bDay = gDate + 17;
      bYear = gYear - 593;
    } else {
      bMonth = 'আষাঢ়';
      bDay = gDate - 14;
      bYear = gYear - 593;
    }
  } else if (gMonth === 7) { // Jul
    if (gDate < 16) {
      bMonth = 'আষাঢ়';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'শ্রাবণ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 8) { // Aug
    if (gDate < 16) {
      bMonth = 'শ্রাবণ';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'ভাদ্র';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 9) { // Sep
    if (gDate < 16) {
      bMonth = 'ভাদ্র';
      bDay = gDate + 16;
      bYear = gYear - 593;
    } else {
      bMonth = 'আশ্বিন';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 10) { // Oct
    if (gDate < 17) {
      bMonth = 'আশ্বিন';
      bDay = gDate + 15;
      bYear = gYear - 593;
    } else {
      bMonth = 'কার্তিক';
      bDay = gDate - 16;
      bYear = gYear - 593;
    }
  } else if (gMonth === 11) { // Nov
    if (gDate < 16) {
      bMonth = 'কার্তিক';
      bDay = gDate + 14;
      bYear = gYear - 593;
    } else {
      bMonth = 'অগ্রহায়ণ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  } else if (gMonth === 12) { // Dec
    if (gDate < 16) {
      bMonth = 'অগ্রহায়ণ';
      bDay = gDate + 15;
      bYear = gYear - 593;
    } else {
      bMonth = 'পৌষ';
      bDay = gDate - 15;
      bYear = gYear - 593;
    }
  }

  return { day: bDay, month: bMonth, year: bYear };
}

interface WeatherData {
  district: string;
  temp: number;
  condition: string;
  wind_speed: number;
  humidity: number;
  soil_temp: number;
  advice: {
    rain: { status: string; title: string; msg: string; actions: string[] };
    disease_risk: { status: string; title: string; msg: string; actions: string[] };
    spray_window: { status: string; title: string; msg: string; actions: string[] };
    soil: { status: string; title: string; msg: string; actions: string[] };
    harvest: { status: string; title: string; msg: string; actions: string[] };
  };
}

const translateNumberToBangla = (num: number | string): string => {
  const englishToBanglaMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    '.': '.', ',': ','
  };
  return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
};

const getCountrywideSummary = (): string => {
  const now = new Date();
  const month = now.getMonth(); // 0 is January, 4 is May, 5 is June
  if (month >= 10 || month <= 1) { // Nov, Dec, Jan, Feb (Winter)
    return "কুয়াশাচ্ছন্ন আবহাওয়া ও মৃদু ঠাণ্ডা পরিবেশ বিরাজ করতে পারে। রবি শস্যের চারা রক্ষা করতে রাতে বীজতলা পলিথিন দিয়ে ঢেকে রাখুন এবং বালাই দমনে প্রয়োজনীয় ব্যবস্থা নিন।";
  } else if (month >= 2 && month <= 4) { // Mar, Apr, May (Summer/Pre-monsoon)
    return "তীব্র রোদ ও ভ্যাপসা গরম থাকতে পারে এবং কিছু অঞ্চলে বজ্রবিদ্যুৎসহ ঝড়ো হাওয়া ও কালবৈশাখী ঝড়ের সম্ভাবনা রয়েছে। খরা পরিস্থিতি নিয়ন্ত্রণে নিয়মিত সেচ দিন এবং ঝড়ের সময় নিরাপদ আশ্রয়ে থাকুন।";
  } else { // Jun, Jul, Aug, Sep, Oct (Monsoon/Rainy)
    return "মাঝারি থেকে ভারী বৃষ্টিপাত এবং আকাশ মেঘলা থাকার সম্ভাবনা রয়েছে। নিচু জমিতে অতিরিক্ত পানি জমে ফসল যাতে পচে না যায় সেজন্য পানি নিষ্কাশন নালাগুলো পরিষ্কার ও উন্মুক্ত রাখুন এবং বৃষ্টির সময় কীটনাশক স্প্রে বন্ধ রাখুন।";
  }
};

const MarqueeText = ({ text, themeColors }: { text: string; themeColors: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      const startValue = containerWidth;
      const endValue = -textWidth;
      animatedValue.setValue(startValue);

      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: endValue,
          duration: Math.max(8000, textWidth * 15), // Highly optimized active scroll speed (doubled speed)
          useNativeDriver: true,
          isInteraction: false,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [textWidth, containerWidth, text]);

  return (
    <View 
      style={[styles.marqueeContainer, { backgroundColor: themeColors.primary + '15', borderBottomColor: themeColors.border }]} 
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView 
        horizontal 
        scrollEnabled={false} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [{ translateX: animatedValue }],
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="clip"
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setTextWidth(w);
            }}
            style={[
              styles.marqueeText,
              { 
                color: themeColors.primary,
              }
            ]}
          >
            {text}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const AGRI_CALENDAR = {
  season_bn: "গ্রীষ্ম-বর্ষা কাল",
  month_bn: "জ্যৈষ্ঠ - আষাঢ়",
  tips: [
    "আউশ ধানের ক্ষেতের আগাছা পরিষ্কার করুন এবং শেষ কিস্তির সার উপরি-প্রয়োগ করুন।",
    "রোপা আমন ধানের বীজতলা তৈরির কাজ শুরু করে দিন। নিষ্কাশনযুক্ত উঁচু জমি নির্বাচন করুন।",
    "আদা ও হলুদের জমিতে গোড়ার মাটি আলগা করে দিন এবং পানি নিষ্কাশনের ব্যবস্থা রাখুন।",
    "শাকসবজি যেমন চালকুমড়া, ঝিঙা ও চিচিঙ্গার মাচা তৈরি করুন এবং হালকা সেচ দিন।"
  ]
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  // Scroll ref & dynamic height for crop calendar redirect
  const scrollViewRef = useRef<ScrollView>(null);
  const [calendarY, setCalendarY] = useState(1100);

  // Dimensions & Drawer state
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(screenWidth * 0.8, 300);
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth)).current;

  // Notification center state
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(true);

  // Connection checker state
  const [isConnected, setIsConnected] = useState(true);
  const [checkingConn, setCheckingConn] = useState(false);

  // Weather & crop selections
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [marqueeDatePrefix, setMarqueeDatePrefix] = useState('');

  // Weather sub-advice tabs (to prevent content breaking or wrapping poorly)
  const [activeWeatherTab, setActiveWeatherTab] = useState<'all' | 'rain' | 'disease' | 'spray' | 'soil' | 'harvest'>('all');

  // Check network connectivity
  const checkConnection = async () => {
    setCheckingConn(true);
    try {
      const state = await Network.getNetworkStateAsync();
      const connected = state.isConnected === true;
      setIsConnected(connected);
    } catch (err) {
      console.warn('Network state fetch error:', err);
      setIsConnected(true); // Fallback
    } finally {
      setCheckingConn(false);
    }
  };

  // Auto IP Location Detection (No hardware GPS permission needed!)
  const detectIPLocation = async () => {
    try {
      const response = await fetch('https://ipwho.is/');
      if (!response.ok) return;
      const data = await response.json();
      if (data && data.success) {
        const city = data.city || '';
        const region = data.region || '';
        
        console.log('IP Location retrieved - City:', city, 'Region:', region);
        
        // 1st Layer: Match exact city name against our districts
        let matched = DISTRICTS.find(d => 
          d.name_en.toLowerCase() === city.toLowerCase() ||
          city.toLowerCase().includes(d.name_en.toLowerCase()) ||
          d.name_en.toLowerCase().includes(city.toLowerCase())
        );
        
        // 2nd Layer Fallback: If no direct city match, match divisional region names
        if (!matched && region) {
          const regionLower = region.toLowerCase();
          if (regionLower.includes('dhaka')) {
            matched = DISTRICTS.find(d => d.name_en === 'Dhaka');
          } else if (regionLower.includes('chittagong') || regionLower.includes('chattogram')) {
            matched = DISTRICTS.find(d => d.name_en === 'Chittagong');
          } else if (regionLower.includes('sylhet')) {
            matched = DISTRICTS.find(d => d.name_en === 'Sylhet');
          } else if (regionLower.includes('rajshahi')) {
            matched = DISTRICTS.find(d => d.name_en === 'Rajshahi');
          } else if (regionLower.includes('khulna')) {
            matched = DISTRICTS.find(d => d.name_en === 'Khulna');
          } else if (regionLower.includes('barisal') || regionLower.includes('barishal')) {
            matched = DISTRICTS.find(d => d.name_en === 'Barisal');
          } else if (regionLower.includes('rangpur')) {
            matched = DISTRICTS.find(d => d.name_en === 'Rangpur');
          } else if (regionLower.includes('mymensingh')) {
            matched = DISTRICTS.find(d => d.name_en === 'Mymensingh');
          }
        }
        
        if (matched) {
          setSelectedDistrict(matched);
          console.log('IP Location auto-detected and matched:', matched.name_bn);
          try {
            await AsyncStorage.setItem('detected_district', matched.name_bn);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('IP Location detection failed:', err);
    }
  };

  useEffect(() => {
    const initializeHome = async () => {
      try {
        const cached = await AsyncStorage.getItem('detected_district');
        if (cached) {
          const matched = DISTRICTS.find(d => d.name_bn === cached || d.name_en === cached);
          if (matched) {
            setSelectedDistrict(matched);
            console.log('Loaded cached district:', matched.name_bn);
          }
        }
      } catch (e) {
        console.warn('Failed to load cached district:', e);
      }
      
      checkConnection();
      detectIPLocation();
    };

    initializeHome();

    // Calculate and set dynamic date prefix on mount
    const now = new Date();
    const engDay = translateNumberToBangla(now.getDate());
    const engMonth = GREGORIAN_MONTHS_BN[now.getMonth()];
    const engYear = translateNumberToBangla(now.getFullYear());
    const englishDateString = `${engDay} ${engMonth}, ${engYear}`;
    
    const banglaDate = getBanglaDateInfo(now);
    const bgDayStr = translateNumberToBangla(banglaDate.day);
    const bgYearStr = translateNumberToBangla(banglaDate.year);
    const banglaDateString = `${bgDayStr} ${banglaDate.month} ${bgYearStr}`;
    
    setMarqueeDatePrefix(`আজ: ${englishDateString} (${banglaDateString}) | `);
  }, []);

  // Fetch weather data
  const fetchWeather = async (districtNameEn: string) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      const response = await fetch(
        `https://www.gacherdoctor.site/api/weather?district=${encodeURIComponent(districtNameEn)}`
      );
      if (!response.ok) {
        throw new Error('Weather forecast not available');
      }
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch failed:', err);
      setWeatherError('লাইভ আবহাওয়া তথ্য লোড করা যায়নি।');
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict.name_en);
  }, [selectedDistrict]);

  const handleSelectDistrict = async (district: District) => {
    setSelectedDistrict(district);
    setShowDistrictModal(false);
    try {
      await AsyncStorage.setItem('detected_district', district.name_bn);
    } catch (e) {}
  };

  // Toggle drawer animation
  const openDrawerMenu = () => {
    setShowDrawer(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawerMenu = () => {
    Animated.timing(drawerAnim, {
      toValue: -drawerWidth,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowDrawer(false);
    });
  };

  const navigateToService = (path: string, isTab: boolean = false) => {
    closeDrawerMenu();
    if (isTab) {
      // Swipe/push tab
      router.push(path as any);
    } else {
      router.push(path as any);
    }
  };

  const handleOpenBellAlerts = () => {
    setShowNotifications(true);
    setHasNewAlert(false);
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('বৃষ্টি') || condition.includes('ঝড়')) {
      return <CloudRain size={36} color={themeColors.primary} />;
    }
    return <Sun size={36} color={themeColors.accent} />;
  };

  const MOCK_NOTIFICATIONS = [
    {
      id: 1,
      title: '⛈️ আবহাওয়া সতর্কতা',
      msg: 'জ্যৈষ্ঠ মাসে উত্তর ও পূর্বাঞ্চলে শিলাবৃষ্টির সম্ভাবনা। ৮০% পাকা বোরো ধান থাকলে দ্রুত কেটে নেওয়ার পরামর্শ দেওয়া যাচ্ছে।',
      date: 'আজ দুপুর ১২:০০',
      type: 'warning'
    },
    {
      id: 2,
      title: '🦠 বালাই সতর্কতা',
      msg: 'আর্দ্র ও কুয়াশাচ্ছন্ন আবহাওয়ার কারণে ধানের ব্লাস্ট এবং আলুর লেট ব্লাইট রোগ দ্রুত ছড়াতে পারে। আগাম ছত্রাকনাশক স্প্রে করুন।',
      date: 'গতকাল বিকাল ৪:৩০',
      type: 'danger'
    },
    {
      id: 3,
      title: '🌾 নতুন সরকারি প্রণোদনা',
      msg: 'চলতি খরিপ মৌসুমে ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে বিনামূল্যে উন্নত বীজ ও ডিএপি সার বিতরণ কর্মসূচি উপজেলা কৃষি অফিসে শুরু হয়েছে।',
      date: '২৪ মে, ২০২৬',
      type: 'info'
    },
    {
      id: 4,
      title: '💧 সেচ ও পানি নিষ্কাশন পরামর্শ',
      msg: 'ভারী বৃষ্টির কারণে অতিরিক্ত পানি নিষ্কাশনের জন্য জমির আইল কেটে নিকাশি নালা সচল রাখুন। অতিরিক্ত সেচ সাময়িকভাবে বন্ধ রাখুন।',
      date: '২২ মে, ২০২৬',
      type: 'info'
    }
  ];

  const getTickerText = (): string => {
    if (!marqueeDatePrefix) {
      return "স্বাগতম প্রিয় কৃষক ভাই! আবহাওয়া ফোরকাস্ট ও নির্দিষ্ট জেলার কৃষি পরামর্শ লোড হচ্ছে...";
    }

    const countrywideSummary = getCountrywideSummary();
    
    // Select greeting & time-based countrywide warning based on current hour
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = 'স্বাগতম প্রিয় কৃষক ভাই!';
    let timeAdvisory = '';
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'শুভ সকাল কৃষক ভাই!';
      timeAdvisory = 'সকালের শান্ত বাতাসে ফসলে সেচ ও বালাইনাশক স্প্রে করার কাজ সম্পন্ন করুন এবং দুপুরের কড়া রোদে মাঠে কাজ করা থেকে বিরত থাকুন।';
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = 'শুভ অপরাহ্ন কৃষক ভাই!';
      timeAdvisory = 'দুপুরের কড়া রোদে ফসলে সেচ দেওয়া বা সার ছিটানো থেকে বিরত থাকুন। কিছু অঞ্চলে বিকালের দিকে ঝড়-বৃষ্টি ও বজ্রপাতের সম্ভাবনা রয়েছে, তাই সতর্ক থাকুন।';
    } else {
      timeGreeting = 'শুভ রাত্রি কৃষক ভাই!';
      timeAdvisory = 'আজ রাতে দেশের কোথাও কোথাও গুঁড়ি গুঁড়ি বৃষ্টি বা তাপমাত্রা কিছুটা হ্রাস পেতে পারে। রাতের অতিরিক্ত আর্দ্রতার কারণে ছত্রাকের আক্রমণ ঠেকাতে সজাগ থাকুন এবং আগামীকাল সকালের কৃষি কাজের প্রস্তুতি নিন।';
    }
    
    const timeBasedCountrywideText = `${marqueeDatePrefix}${timeGreeting} আজ সারাদেশে ${countrywideSummary} ${timeAdvisory}`;
    const fallbackBulletins = " [আজকের বিশেষ কৃষি সতর্কবার্তা ও পরামর্শ: কালবৈশাখী ঝড় ও ভারী শিলাবৃষ্টির কারণে ফসলের ক্ষতি এড়াতে জমিতে পর্যাপ্ত নিকাশি নালা তৈরি করে রাখুন। বোরো ধান ৮০% পেকে গেলে কালক্ষেপণ না করে দ্রুত কেটে মাড়াই করুন। রোপা আমন ধানের চারা তৈরির জন্য নিষ্কাশনযুক্ত ও উর্বর বীজতলা প্রস্তুত করুন। যেকোনো কৃষি ও ফসলের চিকিৎসায় আমাদের চ্যাটবক্সে গাছের ডাক্তারের পরামর্শ নিন। উর্বরতা রক্ষায় জমিতে পর্যায়ক্রমে ফসল রোটেশন চক্র অনুসরণ করুন।]";
    
    if (loadingWeather) {
      return timeBasedCountrywideText + fallbackBulletins + " (লাইভ আবহাওয়া তথ্য লোড হচ্ছে...)";
    }
    if (!weather) {
      return timeBasedCountrywideText + fallbackBulletins;
    }
    
    let weatherAlert = ` [লাইভ আবহাওয়া - ${weather.district} জেলা]: আজকের তাপমাত্রা ${translateNumberToBangla(weather.temp)}°C, অবস্থা: ${weather.condition}। `;
    
    const advices = [];
    if (weather.advice.rain && weather.advice.rain.msg) {
      advices.push(weather.advice.rain.msg);
    }
    if (weather.advice.disease_risk && weather.advice.disease_risk.msg) {
      advices.push(weather.advice.disease_risk.msg);
    }
    if (weather.advice.soil && weather.advice.soil.msg) {
      advices.push(weather.advice.soil.msg);
    }
    if (weather.advice.harvest && weather.advice.harvest.msg) {
      advices.push(weather.advice.harvest.msg);
    }
    
    return timeBasedCountrywideText + weatherAlert + advices.join(" ") + fallbackBulletins;
  };

  const marqueeHeadline = getTickerText();

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      
      {/* Top dynamic scrolling marquee (website style banner) */}
      <View style={{ paddingTop: insets.top, backgroundColor: themeColors.cardBackground }}>
        <MarqueeText text={marqueeHeadline} themeColors={themeColors} />
      </View>

      {/* 1. Header Toolbar */}
      <View style={[
        styles.toolbar, 
        { 
          borderBottomColor: themeColors.border, 
          backgroundColor: themeColors.cardBackground,
          paddingTop: 8,
          paddingBottom: 10,
        }
      ]}>
        <TouchableOpacity onPress={openDrawerMenu} style={styles.menuIconWrapper}>
          <Menu size={24} color={themeColors.primary} />
        </TouchableOpacity>
        
        {/* App Logo and Title */}
        <View style={styles.appBranding}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.brandingLogo} 
            resizeMode="contain"
          />
          <Text style={[styles.appTitle, { color: themeColors.text }]}>গাছের ডাক্তার</Text>
        </View>

        <TouchableOpacity onPress={handleOpenBellAlerts} style={styles.bellIconWrapper}>
          <Bell size={24} color={themeColors.primary} />
          {hasNewAlert && <View style={styles.bellBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 2. Agricultural Hero Paddy Field Section */}
        <View style={styles.heroWrapper}>
          <Image 
            source={require('@/assets/images/hero_paddy_field.jpg')} 
            style={styles.heroBackground} 
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🌾 প্রযুক্তি ও উর্বর মাটির মহামিলন</Text>
            </View>
            <Text style={styles.heroTitle}>গাছের ডাক্তার</Text>
            <Text style={styles.heroSubtitle}>ডিজিটাল কৃষি সেবা</Text>
            <Text style={styles.heroDescription}>
              ফসলের রোগ নির্ণয়, সুষম সারের হিসাব ও নির্দিষ্ট জেলার লাইভ কৃষি আবহাওয়া পরামর্শ নিয়ে পাশে আছি সবসময়।
            </Text>
          </View>
        </View>

        {/* 3. Service Categories Grid (8 services mapping website directly) */}
        <View style={styles.servicesSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>আমাদের সেবাসমূহ</Text>
          
          <View style={styles.servicesGrid}>
            
            {/* Service 1: Leaf Scanner (রোগ নির্ণয়) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/leaf-scanner')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                <Sprout size={24} color={Colors.light.secondary} />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>রোগ নির্ণয়</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>রোগ নির্ণয় ও প্রতিকার</Text>
            </TouchableOpacity>

            {/* Service 2: Soil Doctor (মাটি পরীক্ষা) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/soil-scanner')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(141, 110, 99, 0.15)' }]}>
                <Database size={24} color={themeColors.soilBrown} />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>মাটি পরীক্ষা</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>সার সুপারিশ গাইড</Text>
            </TouchableOpacity>

            {/* Service 3: Gacher Doctor (Agro Chatbot) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/chat')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(2, 136, 209, 0.15)' }]}>
                <MessageSquare size={24} color={themeColors.info} />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>গাছের ডাক্তার</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>কৃষি জিজ্ঞাসা ও চ্যাটবক্স</Text>
            </TouchableOpacity>

            {/* Service 4: Fertilizer Calculator */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/calculator')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(255, 160, 0, 0.15)' }]}>
                <CalcIcon size={24} color={themeColors.warning} />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>সঠিক সার হিসাব</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>সার হিসাব ক্যালকুলেটর</Text>
            </TouchableOpacity>

            {/* Service 5: Crops Book (ফসলের বই) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/crops')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(205, 220, 57, 0.15)' }]}>
                <BookOpen size={24} color="#827717" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>ফসলের বই</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>চাষ নির্দেশিকা ও সারের পরিমাণ</Text>
            </TouchableOpacity>

            {/* Service 6: Agri Loans */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/loans')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(129, 199, 132, 0.15)' }]}>
                <Coins size={24} color={themeColors.primary} />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>কৃষি ঋণ ও সরকারি অনুদান</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>সহায়তা ও আবেদন</Text>
            </TouchableOpacity>

            {/* Service 7: Agri Articles (তথ্য ভান্ডার) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/articles')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(103, 58, 183, 0.15)' }]}>
                <BookOpen size={24} color="#673AB7" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>তথ্য ভান্ডার</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>নোটিশ ও পরামর্শ</Text>
            </TouchableOpacity>

            {/* Service 8: Smart Irrigation Advisor */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/irrigation')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(0, 188, 212, 0.15)' }]}>
                <Droplets size={24} color="#00BCD4" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>সেচ ও নিষ্কাশন গাইড</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>স্মার্ট সেচ গাইড</Text>
            </TouchableOpacity>

            {/* Service 9: Live Market Prices */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push('/explore')}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(233, 30, 99, 0.15)' }]}>
                <DollarSign size={24} color="#E91E63" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>পাইকারি বাজার দর</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>বাজার দর মনিটর</Text>
            </TouchableOpacity>

            {/* Service 10: Seasonal Agri Calendar (মৌসুমি কৃষি দিনপঞ্জি) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => {
                scrollViewRef.current?.scrollTo({ y: calendarY - 20, animated: true });
              }}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
                <Calendar size={24} color="#FFA000" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>মৌসুমি দিনপঞ্জি</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>মৌসুমি কৃষি কাজ ও টিপস</Text>
            </TouchableOpacity>

            {/* Service 11: Crop Matchmaker (ফসলের ম্যাচমেকার) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push({ pathname: '/crops', params: { tab: 'matchmaker' } } as any)}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
                <Compass size={24} color="#9C27B0" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>ফসলের ম্যাচমেকার</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>উপযুক্ত ও লাভজনক ফসল</Text>
            </TouchableOpacity>

            {/* Service 12: Crop Rotation (ফসল চক্র Plans) */}
            <TouchableOpacity 
              style={[styles.serviceCell, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
              onPress={() => router.push({ pathname: '/crops', params: { tab: 'rotation' } } as any)}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: 'rgba(0, 150, 136, 0.15)' }]}>
                <RotateCw size={24} color="#009688" />
              </View>
              <Text style={[styles.serviceCellTitle, { color: themeColors.text }]}>ফসল চক্র পরিকল্পক</Text>
              <Text style={[styles.serviceCellDesc, { color: themeColors.textSecondary }]}>মাটির উর্বরতা রক্ষা চক্র</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* 4. Weather Forecast Widget */}
        <View style={[styles.weatherSection, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={styles.weatherHeader}>
            <View>
              <Text style={[styles.weatherLabel, { color: themeColors.textSecondary }]}>কৃষি আবহাওয়া পূর্বাভাস ও পরামর্শ</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(true)} style={styles.districtSelector}>
                <Text style={[styles.districtText, { color: themeColors.text }]}>{selectedDistrict.name_bn}</Text>
                <ChevronRight size={18} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.weatherIndicator}>
              <Image 
                source={require('@/assets/images/weather_3d.jpg')} 
                style={styles.weather3dImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {loadingWeather ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={styles.spinner} />
          ) : weatherError ? (
            <Text style={[styles.errorText, { color: themeColors.error }]}>{weatherError}</Text>
          ) : weather ? (
            <View style={styles.weatherDetails}>
              {/* Temperature & details rows */}
              <View style={styles.weatherStatsRow}>
                <View style={styles.statChip}>
                  <Thermometer size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.statValue, { color: themeColors.text }]}>{weather.temp}°C</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>তাপমাত্রা</Text>
                </View>
                <View style={styles.statChip}>
                  <CloudRain size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.statValue, { color: themeColors.text }]}>{weather.humidity}%</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>আর্দ্রতা</Text>
                </View>
                <View style={styles.statChip}>
                  <Wind size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.statValue, { color: themeColors.text }]}>{weather.wind_speed} km/h</Text>
                  <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>বাতাস</Text>
                </View>
              </View>

              <Text style={[styles.conditionText, { color: themeColors.text }]}>আজকের অবস্থা: {weather.condition}</Text>

              {/* Advisory Sub-Tabs to prevent content breaks */}
              <View style={styles.advisorySubTabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(['all', 'rain', 'disease', 'spray', 'soil', 'harvest'] as const).map((tab) => {
                    const tabLabels: Record<string, string> = {
                      all: 'সব তথ্য',
                      rain: '🌧️ সেচ সূচি',
                      disease: '🦠 বালাই ঝুঁকি',
                      spray: '💨 স্প্রে সময়',
                      soil: '🌱 মাটি তাপ',
                      harvest: '🌾 ফসল সংগ্রহ'
                    };
                    const isActive = activeWeatherTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveWeatherTab(tab)}
                        style={[
                          styles.advisoryTabButton,
                          isActive && { backgroundColor: themeColors.primary }
                        ]}
                      >
                        <Text style={[styles.advisoryTabBtnText, { color: isActive ? '#fff' : themeColors.textSecondary }]}>
                          {tabLabels[tab]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Dynamic detailed weather instructions */}
              <View style={styles.advisoriesList}>
                {(activeWeatherTab === 'all' || activeWeatherTab === 'rain') && (
                  <View style={[styles.adviceCard, { borderLeftColor: themeColors.info }]}>
                    <Text style={[styles.adviceCardTitle, { color: themeColors.info }]}>🌧️ {weather.advice.rain.title}</Text>
                    <Text style={[styles.adviceCardMsg, { color: themeColors.text }]}>{weather.advice.rain.msg}</Text>
                    <View style={styles.actionsBox}>
                      {weather.advice.rain.actions.map((act, i) => (
                        <Text key={i} style={[styles.actionItem, { color: themeColors.textSecondary }]}>• {act}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {(activeWeatherTab === 'all' || activeWeatherTab === 'disease') && (
                  <View style={[styles.adviceCard, { borderLeftColor: themeColors.error }]}>
                    <Text style={[styles.adviceCardTitle, { color: themeColors.error }]}>🦠 {weather.advice.disease_risk.title}</Text>
                    <Text style={[styles.adviceCardMsg, { color: themeColors.text }]}>{weather.advice.disease_risk.msg}</Text>
                    <View style={styles.actionsBox}>
                      {weather.advice.disease_risk.actions.map((act, i) => (
                        <Text key={i} style={[styles.actionItem, { color: themeColors.textSecondary }]}>• {act}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {(activeWeatherTab === 'all' || activeWeatherTab === 'spray') && (
                  <View style={[styles.adviceCard, { borderLeftColor: themeColors.primary }]}>
                    <Text style={[styles.adviceCardTitle, { color: themeColors.primary }]}>💨 {weather.advice.spray_window.title}</Text>
                    <Text style={[styles.adviceCardMsg, { color: themeColors.text }]}>{weather.advice.spray_window.msg}</Text>
                    <View style={styles.actionsBox}>
                      {weather.advice.spray_window.actions.map((act, i) => (
                        <Text key={i} style={[styles.actionItem, { color: themeColors.textSecondary }]}>• {act}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {(activeWeatherTab === 'all' || activeWeatherTab === 'soil') && (
                  <View style={[styles.adviceCard, { borderLeftColor: themeColors.soilBrown }]}>
                    <Text style={[styles.adviceCardTitle, { color: themeColors.soilBrown }]}>🌱 {weather.advice.soil.title}</Text>
                    <Text style={[styles.adviceCardMsg, { color: themeColors.text }]}>{weather.advice.soil.msg}</Text>
                    <View style={styles.actionsBox}>
                      {weather.advice.soil.actions.map((act, i) => (
                        <Text key={i} style={[styles.actionItem, { color: themeColors.textSecondary }]}>• {act}</Text>
                      ))}
                    </View>
                  </View>
                )}

                {(activeWeatherTab === 'all' || activeWeatherTab === 'harvest') && (
                  <View style={[styles.adviceCard, { borderLeftColor: themeColors.warning }]}>
                    <Text style={[styles.adviceCardTitle, { color: themeColors.warning }]}>🌾 {weather.advice.harvest.title}</Text>
                    <Text style={[styles.adviceCardMsg, { color: themeColors.text }]}>{weather.advice.harvest.msg}</Text>
                    <View style={styles.actionsBox}>
                      {weather.advice.harvest.actions.map((act, i) => (
                        <Text key={i} style={[styles.actionItem, { color: themeColors.textSecondary }]}>• {act}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>

            </View>
          ) : null}
        </View>

        {/* 5. Crops Guide Catalog */}
        <View style={styles.cropsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>ফসল চাষ নির্দেশিকা</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScrollView}>
            {CROPS.map((crop) => (
              <TouchableOpacity
                key={crop.id}
                style={[styles.cropCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                onPress={() => router.push('/crops')}
              >
                <View style={[styles.cropIconWrapper, { backgroundColor: 'rgba(46, 125, 50, 0.08)' }]}>
                  <Sprout size={20} color={themeColors.primary} />
                </View>
                <Text style={[styles.cropName, { color: themeColors.text }]}>{crop.name_bn}</Text>
                <Text style={[styles.cropSciName, { color: themeColors.textSecondary }]}>{crop.scientific_name}</Text>
                <View style={styles.cropMetricRow}>
                  <Text style={[styles.cropLabel, { color: themeColors.textSecondary }]}>ফলন (বিঘা):</Text>
                  <Text style={[styles.cropValue, { color: themeColors.text }]}>{crop.yield_avg} মণ</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Website Feature: 5.5. Seasonal Crop Calendar (মৌসুমি কৃষি দিনপঞ্জি) */}
        <View 
          onLayout={(e) => setCalendarY(e.nativeEvent.layout.y)}
          style={[styles.calendarCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
        >
          <View style={[styles.calendarHeader, { borderBottomColor: themeColors.border }]}>
            <View style={[styles.calendarBadge, { backgroundColor: themeColors.primary + '15' }]}>
              <Calendar size={16} color={themeColors.primary} />
              <Text style={[styles.calendarBadgeText, { color: themeColors.primary }]}>মৌসুমি কৃষি দিনপঞ্জি</Text>
            </View>
            <Text style={[styles.calendarTitle, { color: themeColors.text }]}>
              চলতি ঋতু: {AGRI_CALENDAR.season_bn} ({AGRI_CALENDAR.month_bn} মাস)
            </Text>
          </View>
          <View style={styles.calendarBody}>
            <Text style={[styles.calendarIntro, { color: themeColors.textSecondary }]}>
              {AGRI_CALENDAR.month_bn} মাসে দেশের কৃষি জলবায়ু অনুযায়ী নিচের খামার কাজগুলো অত্যন্ত জরুরি:
            </Text>
            <View style={styles.tipsList}>
              {AGRI_CALENDAR.tips.map((tip, idx) => (
                <View key={idx} style={[styles.tipItem, { borderColor: themeColors.border, backgroundColor: themeColors.primary + '05' }]}>
                  <View style={[styles.tipIndex, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.tipIndexText}>{translateNumberToBangla(idx + 1)}</Text>
                  </View>
                  <Text style={[styles.tipText, { color: themeColors.text }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Smart Footer Attribution */}
        <View style={styles.footerAttribution}>
          <Text style={[styles.footerAttributionText, { color: themeColors.textSecondary }]}>
            Developed by Adnan Shah Abir
          </Text>
          <Text style={[styles.footerAppLink, { color: themeColors.primary }]}>
            www.gacherdoctor.site
          </Text>
        </View>

      </ScrollView>

      {/* 6. Custom Animated Side Drawer overlay */}
      {showDrawer && (
        <View style={styles.drawerBackdrop}>
          {/* Backdrop clickable overlay */}
          <TouchableOpacity 
            style={styles.drawerBackdropClickable} 
            activeOpacity={1} 
            onPress={closeDrawerMenu}
          />
          
          <Animated.View style={[
            styles.drawerContent, 
            { 
              width: drawerWidth,
              backgroundColor: themeColors.background,
              transform: [{ translateX: drawerAnim }]
            }
          ]}>
            {/* Header info */}
            <View style={[styles.drawerHeader, { borderBottomColor: themeColors.border }]}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.drawerLogo} 
                resizeMode="contain"
              />
              <View style={styles.drawerHeaderTitles}>
                <Text style={[styles.drawerAppTitle, { color: themeColors.text }]}>কৃষিসাথী</Text>
                <Text style={[styles.drawerAppSubtitle, { color: themeColors.textSecondary }]}>ডিজিটাল কৃষি সেবা</Text>
              </View>
              <TouchableOpacity onPress={closeDrawerMenu} style={styles.closeDrawerBtn}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* List of 8 Services */}
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.drawerCategoryLabel}>সেবাসমূহ (Services)</Text>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/leaf-scanner', true)}
              >
                <Sprout size={20} color={themeColors.primary} />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>রোগ নির্ণয়</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>রোগ নির্ণয় ও প্রতিকার</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/soil-scanner', true)}
              >
                <Database size={20} color={themeColors.soilBrown} />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>মাটি পরীক্ষা</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>সার সুপারিশ গাইড</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/explore', true)}
              >
                <DollarSign size={20} color="#E91E63" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>পাইকারি বাজার দর</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>বাজার দর মনিটর</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/chat')}
              >
                <MessageSquare size={20} color={themeColors.info} />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>গাছের ডাক্তার</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>কৃষি জিজ্ঞাসা ও চ্যাটবক্স</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/calculator')}
              >
                <CalcIcon size={20} color={themeColors.warning} />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>সঠিক সার হিসাব</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>সার হিসাব ক্যালকুলেটর</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/crops')}
              >
                <BookOpen size={20} color="#827717" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>ফসলের বই</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>চাষ নির্দেশিকা ও সারের পরিমাণ</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => {
                  closeDrawerMenu();
                  router.push({ pathname: '/crops', params: { tab: 'matchmaker' } } as any);
                }}
              >
                <Compass size={20} color="#9C27B0" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>ফসলের ম্যাচমেকার</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>উপযুক্ত ও লাভজনক ফসল</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => {
                  closeDrawerMenu();
                  router.push({ pathname: '/crops', params: { tab: 'rotation' } } as any);
                }}
              >
                <RotateCw size={20} color="#009688" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>ফসল চক্র পরিকল্পক</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>মাটির উর্বরতা রক্ষা চক্র</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/loans')}
              >
                <Coins size={20} color={themeColors.primary} />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>কৃষি ঋণ ও সরকারি অনুদান</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>সহায়তা ও আবেদন</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/articles')}
              >
                <BookOpen size={20} color="#673AB7" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>তথ্য ভান্ডার</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>নোটিশ ও পরামর্শ</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.drawerItem} 
                onPress={() => navigateToService('/irrigation')}
              >
                <Droplets size={20} color="#00BCD4" />
                <View style={styles.drawerItemTexts}>
                  <Text style={[styles.drawerItemName, { color: themeColors.text }]}>সেচ ও নিষ্কাশন গাইড</Text>
                  <Text style={[styles.drawerItemDesc, { color: themeColors.textSecondary }]}>স্মার্ট সেচ গাইড</Text>
                </View>
              </TouchableOpacity>

            </ScrollView>

            {/* Bottom info footer */}
            <View style={[styles.drawerFooter, { borderTopColor: themeColors.border }]}>
              <Text style={[styles.drawerFooterText, { color: themeColors.textSecondary }]}>সংস্করণ ১.০.০ (SDK 54) • Developed by Adnan Shah Abir</Text>
              <Text style={[styles.drawerFooterTextLink, { color: themeColors.primary }]}>www.gacherdoctor.site</Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* 7. Notification alerts Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>কৃষি সতর্কবার্তা ও নোটিশ 🔔</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeBellBtn}>
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsScroll} showsVerticalScrollIndicator={false}>
              {MOCK_NOTIFICATIONS.map((n) => (
                <View 
                  key={n.id} 
                  style={[
                    styles.notifCard, 
                    { 
                      borderColor: themeColors.border,
                      backgroundColor: n.type === 'danger' ? 'rgba(239, 83, 80, 0.05)' : n.type === 'warning' ? 'rgba(255, 179, 0, 0.05)' : 'rgba(46, 125, 50, 0.03)'
                    }
                  ]}
                >
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, { color: n.type === 'danger' ? themeColors.error : n.type === 'warning' ? themeColors.warning : themeColors.primary }]}>
                      {n.title}
                    </Text>
                    <Text style={[styles.notifDate, { color: themeColors.textSecondary }]}>{n.date}</Text>
                  </View>
                  <Text style={[styles.notifMsg, { color: themeColors.text }]}>{n.msg}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setShowNotifications(false)} style={[styles.closeButton, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 8. Offline Blocker Alert Modal */}
      <Modal visible={!isConnected} animationType="fade" transparent={true}>
        <View style={styles.offlineBackground}>
          <View style={[styles.offlineContent, { backgroundColor: themeColors.cardBackground }]}>
            <WifiOff size={64} color={themeColors.error} style={styles.offlineIcon} />
            <Text style={[styles.offlineTitle, { color: themeColors.text }]}>আপনার ইন্টারনেট সংযোগ চালু করুন</Text>
            <Text style={[styles.offlineMsg, { color: themeColors.textSecondary }]}>
              গাছের ডাক্তার অ্যাপের সকল লাইভ ফিচার, রোগবালাই শনাক্তকরণ ও এআই চ্যাটবটের পরামর্শ পেতে সচল ইন্টারনেট সংযোগ (মোবাইল ডাটা বা ওয়াই-ফাই) প্রয়োজন।
            </Text>
            <TouchableOpacity 
              onPress={checkConnection} 
              disabled={checkingConn}
              style={[styles.retryBtn, { backgroundColor: themeColors.primary }]}
            >
              {checkingConn ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.retryBtnText}>পুনরায় চেষ্টা করুন</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 9. District Selector Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>আপনার জেলা নির্বাচন করুন</Text>
            <ScrollView style={styles.districtList}>
              {DISTRICTS.map((d) => (
                <TouchableOpacity
                  key={d.name_en}
                  style={[styles.districtItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => handleSelectDistrict(d)}
                >
                  <Text style={[styles.districtItemText, { color: themeColors.text }]}>{d.name_bn} ({d.name_en})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowDistrictModal(false)} style={[styles.closeButton, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 10. Crop details modal */}
      <Modal visible={!!selectedCrop} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContentWide, { backgroundColor: themeColors.cardBackground }]}>
            {selectedCrop && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>{selectedCrop.name_bn}</Text>
                <Text style={[styles.cropSciNameBig, { color: themeColors.textSecondary }]}>{selectedCrop.scientific_name}</Text>

                <View style={styles.infoGrid}>
                  <View style={styles.infoCell}>
                    <Layers size={18} color={themeColors.primary} />
                    <Text style={[styles.cellVal, { color: themeColors.text }]}>{selectedCrop.soil_preference.join(', ')}</Text>
                    <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>পছন্দনীয় মাটি</Text>
                  </View>
                  <View style={styles.infoCell}>
                    <Calendar size={18} color={themeColors.primary} />
                    <Text style={[styles.cellVal, { color: themeColors.text }]}>{selectedCrop.seasons.join(', ')}</Text>
                    <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>চাষের সময়</Text>
                  </View>
                  <View style={styles.infoCell}>
                    <Award size={18} color={themeColors.primary} />
                    <Text style={[styles.cellVal, { color: themeColors.text }]}>৳{selectedCrop.profit_avg} / বিঘা</Text>
                    <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>গড় লাভ</Text>
                  </View>
                </View>

                {/* Spacing & Cultivation guide */}
                <View style={styles.guideBlock}>
                  <Text style={[styles.guideTitle, { color: themeColors.text }]}><BookOpen size={16} color={themeColors.primary} /> চাষ পদ্ধতি</Text>
                  <Text style={[styles.guideText, { color: themeColors.textSecondary }]}>{selectedCrop.cultivation_method_bn}</Text>
                </View>

                <View style={styles.guideBlock}>
                  <Text style={[styles.guideTitle, { color: themeColors.text }]}><Layers size={16} color={themeColors.primary} /> রোপণ দূরত্ব ও গভীরতা</Text>
                  <Text style={[styles.guideText, { color: themeColors.textSecondary }]}>{selectedCrop.spacing_info_bn}</Text>
                </View>

                <View style={styles.guideBlock}>
                  <Text style={[styles.guideTitle, { color: themeColors.text }]}><Calendar size={16} color={themeColors.primary} /> সংগ্রহ ও সংরক্ষণ</Text>
                  <Text style={[styles.guideText, { color: themeColors.textSecondary }]}>{selectedCrop.harvest_duration_bn}</Text>
                </View>

                {/* Fertilizers guidelines */}
                <View style={styles.guideBlock}>
                  <Text style={[styles.guideTitle, { color: themeColors.text }]}>🌾 বিঘা প্রতি সার সুপারিশ</Text>
                  {selectedCrop.fertilizers.map((f, i) => (
                    <View key={i} style={styles.fertilizerTable}>
                      <Text style={[styles.fertRow, { color: themeColors.text }]}>ইউরিয়া: {f.urea} কেজি</Text>
                      <Text style={[styles.fertRow, { color: themeColors.text }]}>টিএসপি (TSP): {f.tsp} কেজি</Text>
                      <Text style={[styles.fertRow, { color: themeColors.text }]}>এমওপি (MOP): {f.mop} কেজি</Text>
                      <Text style={[styles.fertRow, { color: themeColors.text }]}>জিপসাম: {f.gypsum} কেজি</Text>
                      <Text style={[styles.fertRow, { color: themeColors.text }]}>দস্তা (Zinc): {f.zinc} কেজি</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setSelectedCrop(null)} style={[styles.closeButton, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIconWrapper: {
    padding: 6,
  },
  appBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandingLogo: {
    width: 28,
    height: 28,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  bellIconWrapper: {
    padding: 6,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C62828',
  },
  container: {
    padding: 16,
    paddingBottom: 130, // Generous padding to prevent bottom tab bar overlaps
  },
  
  // Agricultural Hero Image Header
  heroWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 58, 43, 0.8)', // Deep rustic green overlay
  },
  heroContent: {
    padding: 18,
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 213, 79, 0.25)',
    borderColor: 'rgba(255, 213, 79, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#FFD54F',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    color: '#FFD54F',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
    fontWeight: '600',
  },

  // Services Grid Layout
  servicesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCell: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  serviceIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceCellTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  serviceCellDesc: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },

  // Weather Section
  weatherSection: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 12,
    marginBottom: 12,
  },
  weatherLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  districtSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  districtText: {
    fontSize: 18,
    fontWeight: '900',
    marginRight: 4,
  },
  weatherIndicator: {
    padding: 2,
  },
  weather3dImage: {
    width: 50,
    height: 50,
  },
  spinner: {
    marginVertical: 20,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: 'bold',
    fontSize: 14,
  },
  weatherDetails: {
    marginTop: 4,
  },
  weatherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: 'bold',
  },
  conditionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  advisorySubTabs: {
    marginBottom: 14,
  },
  advisoryTabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginRight: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  advisoryTabBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  advisoriesList: {
    gap: 12,
  },
  adviceCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderLeftWidth: 4,
    gap: 4,
  },
  adviceCardTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  adviceCardMsg: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  actionsBox: {
    marginTop: 4,
    gap: 2,
  },
  actionItem: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },

  // Crops Guide List
  cropsSection: {
    marginBottom: 24,
  },
  cropsScrollView: {
    paddingVertical: 4,
  },
  cropCard: {
    width: 140,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cropIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 14,
    fontWeight: '800',
  },
  cropSciName: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '500',
  },
  cropMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 8,
  },
  cropLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  cropValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Custom Animated Drawer Styles
  drawerBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    flexDirection: 'row',
  },
  drawerBackdropClickable: {
    flex: 1,
  },
  drawerContent: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
    paddingTop: RNStatusBar.currentHeight || 40,
    zIndex: 1001,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  drawerLogo: {
    width: 38,
    height: 38,
  },
  drawerHeaderTitles: {
    flex: 1,
  },
  drawerAppTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  drawerAppSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  closeDrawerBtn: {
    padding: 6,
  },
  drawerScroll: {
    flex: 1,
    padding: 16,
  },
  drawerCategoryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8D6E63',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  drawerItemTexts: {
    flex: 1,
    gap: 2,
  },
  drawerItemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  drawerItemDesc: {
    fontSize: 10,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  drawerFooterText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  drawerFooterTextLink: {
    fontSize: 11,
    fontWeight: '900',
  },

  // Modal Dialogs General
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalContentWide: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  cropSciNameBig: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  closeBellBtn: {
    padding: 4,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Notification center alerts styles
  notificationsScroll: {
    maxHeight: 380,
  },
  notifCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  notifDate: {
    fontSize: 9,
    fontWeight: '600',
  },
  notifMsg: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  // Offline Blocker Alert Modal Styles
  offlineBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offlineContent: {
    width: '100%',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  offlineIcon: {
    marginBottom: 8,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  offlineMsg: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },

  // Crop guide inner details modal styles
  districtList: {
    marginVertical: 12,
  },
  districtItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  districtItemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  infoCell: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cellVal: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },
  cellLbl: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  guideBlock: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  fertilizerTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    borderRadius: 16,
    marginTop: 6,
    gap: 4,
  },
  fertRow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  marqueeContainer: {
    height: 42,
    overflow: 'hidden',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  marqueeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  calendarCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  calendarHeader: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 12,
  },
  calendarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  calendarBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  calendarBody: {
    gap: 8,
  },
  calendarIntro: {
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
    marginBottom: 6,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipIndexText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  footerAttribution: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
    gap: 4,
  },
  footerAttributionText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerAppLink: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
