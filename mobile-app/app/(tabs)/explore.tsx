import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  MapPin,
  Activity,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

import { Colors } from '@/constants/theme';
import { SUPABASE_CONFIG } from '@/constants/api';

interface MarketPrice {
  id: number;
  crop_name: string;
  price_range: string;
  trend: 'up' | 'down' | 'stable';
  change_val: string;
  market_date: string;
}

interface CropAnalysis {
  sourceRegion: string;
  supplyLevel: 'উচ্চ' | 'স্বাভাবিক' | 'স্বল্প';
  retailForecast: string;
  advisory: string;
  advisoryType: 'sell' | 'hold' | 'monitor';
  reason: string;
  history: number[];
}

export default function MarketPricesScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  // Fetch prices from Supabase REST API
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${SUPABASE_CONFIG.restUrl}/market_prices?select=*&order=market_date.desc&limit=60`;
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Database query failed');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setPrices(data);
      } else {
        setPrices(FALLBACK_PRICES);
      }
    } catch (err) {
      console.warn("Failed fetching live market prices, using local cache:", err);
      setPrices(FALLBACK_PRICES);
    } finally {
      setLoading(false);
    }
  };

  // Sync market prices via Vercel Scraper endpoint
  const handleSyncPrices = async () => {
    setSyncing(true);
    try {
      const res = await fetch('https://www.gacherdoctor.site/api/sync/prices');
      const data = await res.json();
      if (data.success) {
        await fetchPrices();
        alert('বাজার দর সফলভাবে আপডেট করা হয়েছে!');
      } else {
        alert('সার্ভার থেকে বাজার দর সিঙ্ক করা সম্ভব হয়নি।');
      }
    } catch (err) {
      alert('ইন্টারনেট সংযোগ সংযোগ ত্রুটি।');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const silentSyncAndFetch = async () => {
      try {
        // Trigger a silent sync with the website backend
        await fetch('https://www.gacherdoctor.site/api/sync/prices');
      } catch (err) {
        console.warn('Silent sync on mount failed:', err);
      }
      // Fetch the updated prices from Supabase
      fetchPrices();
    };

    silentSyncAndFetch();
  }, []);

  const filteredPrices = prices.filter(p =>
    p.crop_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSortPriority = (name: string): number => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ধান') || lowerName.includes('গম') || lowerName.includes('চাল') || lowerName.includes('wheat') || lowerName.includes('rice') || lowerName.includes('paddy')) {
      return 1;
    }
    if (lowerName.includes('মুরগি') || lowerName.includes('মুরগী') || lowerName.includes('মাছ') || lowerName.includes('মাংস') || lowerName.includes('খাসি') || lowerName.includes('গরু') || lowerName.includes('ইলিশ') || lowerName.includes('রুই') || lowerName.includes('কাতলা') || lowerName.includes('চিকেন') || lowerName.includes('বিফ') || lowerName.includes('মাংস') || lowerName.includes('fish') || lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('meat') || lowerName.includes('mutton') || lowerName.includes('egg')) {
      return 3;
    }
    return 2;
  };

  const sortedPrices = [...filteredPrices].sort((a, b) => {
    const priorityA = getSortPriority(a.crop_name);
    const priorityB = getSortPriority(b.crop_name);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.crop_name.localeCompare(b.crop_name);
  });

  const translateToBanglaDigits = (num: number): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const getAnalysis = (cropName: string, currentPriceRange: string): CropAnalysis => {
    const template = CROP_ANALYSIS_TEMPLATES[cropName];
    if (template) return template;

    // Default dynamic mock values if not in template
    return {
      sourceRegion: "দেশীয় আড়ত",
      supplyLevel: "স্বাভাবিক",
      retailForecast: "৪০ - ৫০ ৳ / কেজি",
      advisory: "বাজার পর্যবেক্ষণ",
      advisoryType: "monitor",
      reason: "বাজারের চাহিদা ও যোগান স্বাভাবিক রয়েছে। আপনার নিকটস্থ আড়তে খোঁজ নিয়ে বিক্রি করুন।",
      history: [1100, 1120, 1140, 1130, 1160, 1150, 1180]
    };
  };

  const renderTrendChip = (item: MarketPrice) => {
    const isUp = item.trend === 'up';
    const isDown = item.trend === 'down';
    
    let bgColor = 'rgba(120, 120, 120, 0.1)';
    let textColor = themeColors.textSecondary;
    let Icon = Minus;

    if (isUp) {
      bgColor = 'rgba(198, 40, 40, 0.1)';
      textColor = themeColors.error;
      Icon = TrendingUp;
    } else if (isDown) {
      bgColor = 'rgba(46, 125, 50, 0.1)';
      textColor = themeColors.success;
      Icon = TrendingDown;
    }

    return (
      <View style={[styles.trendChip, { backgroundColor: bgColor }]}>
        <Icon size={12} color={textColor} style={styles.trendIcon} />
        <Text style={[styles.trendText, { color: textColor }]}>
          {item.change_val !== '০ ৳' ? item.change_val : 'স্থির'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeColors.text }]}>পাইকারি বাজার দর ৳</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>কৃষি বিপণন অধিদপ্তর (DAM) তথ্যের গড় পাইকারি মূল্য</Text>
        </View>
        <TouchableOpacity
          onPress={handleSyncPrices}
          disabled={syncing}
          style={[styles.syncBtn, { backgroundColor: themeColors.primary }]}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <RefreshCw size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
        <Search size={18} color={themeColors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ফসলের নাম দিয়ে সার্চ করুন..."
          placeholderTextColor={themeColors.textSecondary}
          style={[styles.searchInput, { color: themeColors.text }]}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={sortedPrices}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isExpanded = expandedCrop === item.crop_name;
            const analysis = getAnalysis(item.crop_name, item.price_range);
            
            // Calculate history values for the spark chart
            const history = analysis.history;
            const minH = Math.min(...history);
            const maxH = Math.max(...history);
            const rangeH = (maxH - minH) || 1;

            return (
              <View style={[styles.priceCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <TouchableOpacity
                  onPress={() => setExpandedCrop(isExpanded ? null : item.crop_name)}
                  style={styles.cardHeader}
                >
                  <View style={styles.cropTitleRow}>
                    {isExpanded ? (
                      <ChevronUp size={20} color={themeColors.primary} />
                    ) : (
                      <ChevronDown size={20} color={themeColors.textSecondary} />
                    )}
                    <Text style={[styles.cropNameText, { color: themeColors.text }]}>{item.crop_name}</Text>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={[styles.priceRangeText, { color: themeColors.primary }]}>{item.price_range}</Text>
                    {renderTrendChip(item)}
                  </View>
                </TouchableOpacity>

                {/* Expanded Details section */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    
                    {/* Advisory tag */}
                    <View style={styles.advisoryHeader}>
                      <Text style={[styles.detailTitle, { color: themeColors.text }]}>বাজার বিশ্লেষণ ও পূর্বাভাস</Text>
                      <View style={[styles.advisoryBadge, { backgroundColor: analysis.advisoryType === 'hold' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)' }]}>
                        <Text style={[styles.advisoryBadgeText, { color: analysis.advisoryType === 'hold' ? themeColors.success : themeColors.warning }]}>
                          {analysis.advisory}
                        </Text>
                      </View>
                    </View>

                    {/* Stats cells */}
                    <View style={styles.detailsStatsRow}>
                      <View style={[styles.detailCell, { backgroundColor: 'rgba(0,0,0,0.02)' }]}>
                        <MapPin size={14} color={themeColors.primary} />
                        <Text style={[styles.cellVal, { color: themeColors.text }]}>{analysis.sourceRegion}</Text>
                        <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>উৎস অঞ্চল</Text>
                      </View>
                      <View style={[styles.detailCell, { backgroundColor: 'rgba(0,0,0,0.02)' }]}>
                        <Activity size={14} color={themeColors.primary} />
                        <Text style={[styles.cellVal, { color: themeColors.text }]}>{analysis.supplyLevel}</Text>
                        <Text style={[styles.cellLbl, { color: themeColors.textSecondary }]}>সরবরাহ মাত্রা</Text>
                      </View>
                    </View>

                    <View style={[styles.detailCellFull, { backgroundColor: 'rgba(0,0,0,0.02)' }]}>
                      <Info size={14} color={themeColors.primary} />
                      <Text style={[styles.cellValFull, { color: themeColors.text }]}>{analysis.retailForecast}</Text>
                      <Text style={[styles.cellLblFull, { color: themeColors.textSecondary }]}>আনুমানিক খুচরা বাজার দর (প্রতি কেজি/আঁটি)</Text>
                    </View>

                    {/* Forecast text */}
                    <View style={styles.reasonBox}>
                      <Text style={[styles.reasonTitle, { color: themeColors.text }]}>পূর্বাভাস ও পরামর্শ:</Text>
                      <Text style={[styles.reasonText, { color: themeColors.textSecondary }]}>{analysis.reason}</Text>
                    </View>

                    {/* 7-Day Trend Chart using pure Views */}
                    <Text style={[styles.chartTitle, { color: themeColors.text }]}>📈 ৭ দিনের পাইকারি মূল্যের গতিধারা</Text>
                    <View style={styles.chartContainer}>
                      <View style={styles.chartBarsRow}>
                        {history.map((val, idx) => {
                          // Proportional height
                          const heightPercent = ((val - minH) / rangeH) * 55 + 15; // Min 15% Max 70%
                          return (
                            <View key={idx} style={styles.chartCol}>
                              <Text style={[styles.chartBarVal, { color: themeColors.text }]}>{translateToBanglaDigits(val)}</Text>
                              <View style={styles.chartBarWrapper}>
                                <View style={[styles.chartBar, { height: `${heightPercent}%`, backgroundColor: idx === 6 ? themeColors.primary : themeColors.primaryLight }]} />
                              </View>
                              <Text style={[styles.chartBarLabel, { color: themeColors.textSecondary }]}>{idx === 6 ? 'আজ' : `${translateToBanglaDigits(7 - idx)}দিন`}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const FALLBACK_PRICES: MarketPrice[] = [
  { id: 1, crop_name: 'ব্রি ধান ২৯ (ধান)', price_range: '১,২৮০ - ১,৩৫০ ৳ / মণ', trend: 'up', change_val: '১২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 2, crop_name: 'রোপা আমন ধান', price_range: '১,২০০ - ১,২৭০ ৳ / মণ', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 3, crop_name: 'ধান (আউশ)', price_range: '১,০৫০ - ১,১০০ ৳ / মণ', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 4, crop_name: 'নাজিরশাইল চাল', price_range: '৭১ - ৭৫ ৳ / কেজি', trend: 'up', change_val: '২ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 5, crop_name: 'মিনিকেট চাল', price_range: '৬৫ - ৬৮ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 6, crop_name: 'আলু (ডায়মন্ড)', price_range: '২৮ - ৩২ ৳ / কেজি', trend: 'down', change_val: '১ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 7, crop_name: 'দেশি পেঁয়াজ', price_range: '৬৫ - ৭০ ৳ / কেজি', trend: 'up', change_val: '৫ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 8, crop_name: 'কাঁচা মরিচ', price_range: '৮০ - ৯০ ৳ / কেজি', trend: 'up', change_val: '১০ ৳', market_date: new Date().toISOString().split('T')[0] },
  { id: 9, crop_name: 'দেশি রসুন', price_range: '১২০ - ১৩৫ ৳ / কেজি', trend: 'stable', change_val: '০ ৳', market_date: new Date().toISOString().split('T')[0] }
];

const CROP_ANALYSIS_TEMPLATES: { [key: string]: CropAnalysis } = {
  "ব্রি ধান ২৯ (ধান)": {
    sourceRegion: "নওগাঁ, দিনাজপুর, কুষ্টিয়া",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৪০ - ৪৫ ৳ / কেজি",
    advisory: "ধীরে ধীরে বিক্রি করুন",
    advisoryType: "hold",
    reason: "বোরো মৌসুমের ধান গুদামজাতকরণ বৃদ্ধির কারণে বাজারে ধানের যোগান কিছুটা নিয়ন্ত্রিত। আগামী ২ মাসে দাম বৃদ্ধির উজ্জ্বল সম্ভাবনা রয়েছে, তাই ধীরে ধীরে বাজারে ছাড়ুন।",
    history: [1220, 1240, 1260, 1250, 1280, 1300, 1315]
  },
  "রোপা আমন ধান": {
    sourceRegion: "দিনাজপুর, শেরপুর, ময়মনসিংহ",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩৮ - ৪২ ৳ / কেজি",
    advisory: "বাজার পর্যবেক্ষণ করুন",
    advisoryType: "monitor",
    reason: "সরকারি ধান সংগ্রহ অভিযান শুরু হওয়ায় চালকল মালিকদের সক্রিয়তা বেড়েছে। বাজার দর বর্তমানে লাভজনক সীমার মধ্যে রয়েছে।",
    history: [1150, 1170, 1180, 1200, 1220, 1235, 1250]
  },
  "ধান (আউশ)": {
    sourceRegion: "কুমিল্লা, সিলেট, নেত্রকোনা",
    supplyLevel: "স্বাভাবিক",
    retailForecast: "৩৫ - ৩৮ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "আউশ ধান দীর্ঘদিন গুদামজাত করে রাখা কঠিন ও গুণগত মান দ্রুত নষ্ট হয়। বর্তমানে আড়তের যে মূল্য তাতেই বিক্রি করে ফেলা লাভজনক হবে।",
    history: [980, 1000, 1010, 1020, 1030, 1050, 1070]
  },
  "আলু (ডায়মন্ড)": {
    sourceRegion: "মুন্সিগঞ্জ, বগুড়া, রংপুর",
    supplyLevel: "উচ্চ",
    retailForecast: "৩৫ - ৩৮ ৳ / কেজি",
    advisory: "দ্রুত বাজারে সরবরাহ করুন",
    advisoryType: "sell",
    reason: "কোল্ড স্টোরেজ থেকে পর্যাপ্ত আলু বাজারে আসার কারণে দাম কিছুটা পড়তির দিকে। পচনশীলতা এড়াতে এখনই বিক্রি করা নিরাপদ।",
    history: [34, 33, 32, 31, 31, 30, 30]
  },
  "দেশি পেঁয়াজ": {
    sourceRegion: "পাবনা, ফরিদপুর, রাজবাড়ী",
    supplyLevel: "স্বল্প",
    retailForecast: "৮০ - ৮৫ ৳ / কেজি",
    advisory: "মজুত ধরে রাখুন",
    advisoryType: "hold",
    reason: "হাটে নতুন পেঁয়াজের যোগান কমে আসায় দাম দ্রুত গতিতে বাড়ছে। আগামী সপ্তাহে দাম আরও ৫-১০ টাকা বৃদ্ধি পেতে পারে।",
    history: [58, 60, 62, 65, 66, 68, 67]
  },
  "কাঁচা মরিচ": {
    sourceRegion: "বগুড়া, কুষ্টিয়া, জামালপুর",
    supplyLevel: "স্বল্প",
    retailForecast: "১২ো - ১৪০ ৳ / কেজি",
    advisory: "দ্রুত বিক্রি করুন",
    advisoryType: "sell",
    reason: "অতিবৃষ্টির কারণে মরিচ ক্ষেত ক্ষতিগ্রস্ত থাকায় বাজারে যোগান অত্যন্ত কম এবং দাম রেকর্ড চড়া। দেরি না করে আড়তে মরিচ পৌঁছে দিন।",
    history: [65, 70, 75, 80, 85, 82, 85]
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  syncBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  priceCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  cropNameText: {
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 110,
  },
  priceRangeText: {
    fontSize: 14,
    fontWeight: '900',
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendIcon: {
    marginRight: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '900',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  advisoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  advisoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  advisoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  detailCell: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
  },
  detailCellFull: {
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  cellVal: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  cellLbl: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cellValFull: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  cellLblFull: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  reasonBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },
  chartContainer: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#fff',
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 16,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarVal: {
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 4,
  },
  chartBarWrapper: {
    height: 60,
    justifyContent: 'flex-end',
    width: 14,
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 6,
  }
});
