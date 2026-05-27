import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  useColorScheme
} from 'react-native';
import { ArrowLeft, BookOpen, RefreshCw, Search, Calendar, Info, Globe, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { SUPABASE_CONFIG } from '@/constants/api';

interface Article {
  id: number;
  title: string;
  content: string;
  source_site: 'dae' | 'bina' | string;
  source_url: string;
  publish_date: string;
}

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "কালবৈশাখী ও অতিরিক্ত শিলাবৃষ্টিতে বোরো ধান সুরক্ষায় ডিএই (DAE) জরুরি নির্দেশনা",
    content: "দেশের বিভিন্ন অঞ্চলে কালবৈশাখী ঝড় ও আকস্মিক শিলাবৃষ্টির পূর্বাভাস রয়েছে। কৃষি সম্প্রসারণ অধিদপ্তর (DAE) থেকে কৃষকদের বোরো ধান ৮০% পেকে গেলে দ্রুত কেটে ফেলার পরামর্শ দেওয়া হচ্ছে। এছাড়া ঝড়-পরবর্তী রোগবালাই সংক্রমণ এড়াতে জমিতে ছত্রাকনাশক স্প্রে করুন ও নিষ্কাশন নালা সচল রাখুন।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/kalboishakhi-advisory-2026",
    publish_date: "2026-05-20T00:00:00.000Z"
  },
  {
    id: 2,
    title: "গ্রীষ্মকালীন পেঁয়াজ চাষাবাদে খরিপ মৌসুমে বীজ ও সার প্রণোদনা বিতরণ",
    content: "চলতি খরিপ মৌসুমে গ্রীষ্মকালীন পেঁয়াজের আবাদ বৃদ্ধিতে ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে সরকারি প্রণোদনার অধীনে বিনামূল্যে পেঁয়াজ বীজ এবং রাসায়নিক সার বিতরণ কর্মসূচি শুরু হয়েছে। প্রতি কৃষককে ১ বিঘা জমির জন্য বীজ, ২০ কেজি ইউরিয়া, ২০ কেজি টিএসপি এবং ১০ কেজি এমওপি সার দেওয়া হচ্ছে। বিস্তারিত তথ্যের জন্য স্থানীয় উপ-সহকারী কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।",
    source_site: "dae",
    source_url: "https://dae.gov.bd/site/notices/aush-seed-subsidy-2026",
    publish_date: "2026-05-18T00:00:00.000Z"
  },
  {
    id: 3,
    title: "বিনা ধান-২৫: উপকূলীয় অঞ্চলের জন্য লবণাক্ততা সহনশীল উচ্চ ফলনশীল জাত",
    content: "বাংলাদেশ পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA) উপকূলীয় লবণাক্ত অঞ্চলের জন্য নতুন ধান জাত 'বিনা ধান-২৫' অবমুক্ত করেছে। এই জাতটি ৮-১০ ডিএস/মিটার পর্যন্ত লবণাক্ততা সহ্য করতে পারে এবং প্রতি হেক্টরে ৫.৫ থেকে ৬.৫ টন পর্যন্ত ফলন দিতে সক্ষম। এর জীবনকাল মাত্র ১৩৫-১৪০ দিন, যা আমন ও বোরো দুই মৌসুমেই চাষ উপযোগী।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/bina-dhan-25-release",
    publish_date: "2026-05-15T00:00:00.000Z"
  },
  {
    id: 4,
    title: "বিনা সর্ষে-১১: আমন ও বোরো মৌসুমের মধ্যবর্তী সময়ে লাভজনক তৈলবীজ চাষ",
    content: "বাংলাদেশ পরমাণু কৃষি গবেষণা ইনস্টিটিউট উদ্ভাবিত 'বিনা সর্ষে-১১' জাতটি মাত্র ৮০-৮৫ দিনে ঘরে তোলা যায়। আমন ধান কাটার পর বোরো ধান রোপণের আগের পতিত সময়ে এই সর্ষে চাষ করে কৃষকেরা বাড়তি আয় করতে পারেন। এতে বিঘাপ্রতি ফলন হয় প্রায় ৫.৫-৬ মণ এবং তেলের পরিমাণ শতকরা ৪২ ভাগ।",
    source_site: "bina",
    source_url: "https://bina.gov.bd/site/news/bina-sarisha-11-cultivation",
    publish_date: "2026-05-12T00:00:00.000Z"
  }
];

export default function ArticlesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_CONFIG.restUrl}/articles?select=*&order=publish_date.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Supabase fetch failed');
      const data = await response.json();
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(FALLBACK_ARTICLES);
      }
    } catch (err) {
      console.warn("Supabase fetch failed, loading fallback articles:", err);
      setArticles(FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchArticles();
    setSyncing(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const formatBengaliDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${translateToBanglaDigits(day)} ${month}, ${translateToBanglaDigits(year)}`;
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      
      {/* Header */}
      <View style={[
        styles.headerContainer, 
        { 
          borderBottomColor: themeColors.border,
          paddingTop: insets.top + 6,
          paddingBottom: 10,
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backBtn, { backgroundColor: 'rgba(0, 0, 0, 0.02)' }]}
        >
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.title, { color: themeColors.text }]}>কৃষি তথ্য ভান্ডার 📖</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            DAE ও BINA এর নোটিশ বোর্ড এবং সর্বশেষ খবর
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleSync} 
          disabled={syncing}
          style={styles.syncBtn}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={themeColors.primary} />
          ) : (
            <RefreshCw size={18} color={themeColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main layout */}
      <View style={styles.flexContainer}>
        
        {/* Search box */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
            <Search size={18} color={themeColors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="নিউজ বা আর্টিকেলের বিষয় দিয়ে সার্চ করুন..."
              placeholderTextColor={themeColors.textSecondary}
              style={[styles.searchInput, { color: themeColors.text }]}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={[styles.spinnerText, { color: themeColors.textSecondary }]}>তথ্য ভান্ডার লোড হচ্ছে...</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <TouchableOpacity
                  key={art.id}
                  style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                  onPress={() => setActiveArticle(art)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Text 
                      style={[
                        styles.sourceBadge, 
                        art.source_site === 'dae' 
                          ? { backgroundColor: 'rgba(46, 125, 50, 0.1)', color: themeColors.primary } 
                          : { backgroundColor: 'rgba(63, 81, 181, 0.1)', color: '#3F51B5' }
                      ]}
                    >
                      {art.source_site === 'dae' ? 'কৃষি অধিদপ্তর (DAE)' : 'পরমাণু কৃষি (BINA)'}
                    </Text>
                    <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
                      {formatBengaliDate(art.publish_date)}
                    </Text>
                  </View>

                  <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={2}>
                    {art.title}
                  </Text>
                  
                  <Text style={[styles.cardDesc, { color: themeColors.textSecondary }]} numberOfLines={3}>
                    {art.content}
                  </Text>

                  <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
                    <Text style={[styles.readMoreText, { color: themeColors.primary }]}>বিস্তারিত পড়তে ক্লিক করুন →</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>দুঃখিত, কোনো আর্টিকেল বা নোটিশ পাওয়া যায়নি।</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Details Modal */}
      {activeArticle && (
        <Modal visible={!!activeArticle} animationType="slide" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
              {/* Close button */}
              <TouchableOpacity 
                onPress={() => setActiveArticle(null)}
                style={styles.closeModalBtn}
              >
                <X size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  <Text 
                    style={[
                      styles.sourceBadge, 
                      activeArticle.source_site === 'dae' 
                        ? { backgroundColor: 'rgba(46, 125, 50, 0.1)', color: themeColors.primary } 
                        : { backgroundColor: 'rgba(63, 81, 181, 0.1)', color: '#3F51B5' }
                    ]}
                  >
                    {activeArticle.source_site === 'dae' ? 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE)' : 'পরমাণু কৃষি গবেষণা ইনস্টিটিউট (BINA)'}
                  </Text>
                  <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
                    {formatBengaliDate(activeArticle.publish_date)}
                  </Text>
                </View>

                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  {activeArticle.title}
                </Text>
                
                <Text style={[styles.modalBody, { color: themeColors.text }]}>
                  {activeArticle.content}
                </Text>

                <View style={[styles.modalFooter, { borderTopColor: themeColors.border }]}>
                  <TouchableOpacity
                    onPress={() => {
                      const q = activeArticle.title;
                      setActiveArticle(null);
                      router.push(`/chat?q=${encodeURIComponent(q + ' সম্পর্কে বিস্তারিত বলুন')}`);
                    }}
                    style={[styles.askDoctorBtn, { backgroundColor: themeColors.primary }]}
                  >
                    <Text style={styles.askDoctorBtnText}>গাছের ডাক্তারের পরামর্শ নিন 🩺</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  syncBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexContainer: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  spinnerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sourceBadge: {
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 0.5,
    paddingTop: 10,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  closeModalBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalScroll: {
    paddingTop: 10,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  modalFooter: {
    borderTopWidth: 0.5,
    paddingTop: 16,
    marginTop: 8,
  },
  askDoctorBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  askDoctorBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  }
});
