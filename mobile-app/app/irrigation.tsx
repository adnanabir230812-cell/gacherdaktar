import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useColorScheme
} from 'react-native';
import { ArrowLeft, MapPin, Droplets, CloudRain, ShieldCheck, HelpCircle, ChevronRight, Thermometer } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DISTRICTS, District } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api';

interface WeatherData {
  district: string;
  temp: number;
  condition: string;
  humidity?: number;
  advice: {
    rain: { status: string; title: string; msg: string; actions: string[] };
    disease_risk?: { status: string; title: string; msg: string; actions: string[] };
    spray_window?: { status: string; title: string; msg: string; actions: string[] };
    soil: { status: string; title: string; msg: string; actions: string[] };
    harvest: { status: string; title: string; msg: string; actions: string[] };
  };
}

export default function IrrigationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherAndAdvisory = async (districtNameEn: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather?district=${encodeURIComponent(districtNameEn)}`);
      if (!response.ok) throw new Error('Advisory fetch failed');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.warn("Failed to fetch weather advisory:", err);
      setError('লাইভ আবহাওয়া ও সেচ তথ্য লোড করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherAndAdvisory(selectedDistrict.name_en);
  }, [selectedDistrict]);

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
      '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      
      {/* Top Header */}
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
          <Text style={[styles.title, { color: themeColors.text }]}>সেচ ও নিষ্কাশন গাইড 💧</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            আবহাওয়া ও মাটির আর্দ্রতার লাইভ সেচ এ্যাডভাইজরি
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* District Selector Card */}
        <View style={[styles.districtCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={styles.locationHeader}>
            <MapPin size={18} color={themeColors.primary} />
            <Text style={[styles.locationLabel, { color: themeColors.textSecondary }]}>আপনার জেলা নির্বাচন করুন:</Text>
          </View>
          <TouchableOpacity onPress={() => setShowDistrictModal(true)} style={styles.districtSelector}>
            <Text style={[styles.districtText, { color: themeColors.text }]}>{selectedDistrict.name_bn} ({selectedDistrict.name_en})</Text>
            <ChevronRight size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={[styles.loaderText, { color: themeColors.textSecondary }]}>আবহাওয়া ও সেচ বিশ্লেষণ লোড হচ্ছে...</Text>
          </View>
        ) : error ? (
          <View style={[styles.errorCard, { backgroundColor: 'rgba(198, 40, 40, 0.04)', borderColor: 'rgba(198, 40, 40, 0.15)' }]}>
            <HelpCircle size={32} color={themeColors.error} />
            <Text style={[styles.errorTitle, { color: themeColors.error }]}>কোনো ডাটা পাওয়া যায়নি</Text>
            <Text style={[styles.errorDesc, { color: themeColors.textSecondary }]}>{error}</Text>
          </View>
        ) : weather ? (
          <View style={styles.advisoryContainer}>
            
            {/* Weather parameters cards row */}
            <View style={styles.weatherStatsRow}>
              <View style={[styles.statBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Thermometer size={20} color={themeColors.primary} />
                <Text style={[styles.statValue, { color: themeColors.text }]}>{translateToBanglaDigits(weather.temp)}°C</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>তাপমাত্রা</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Droplets size={20} color={themeColors.primary} />
                <Text style={[styles.statValue, { color: themeColors.text }]}>{translateToBanglaDigits(weather.humidity || 75)}%</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>আর্দ্রতা</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <CloudRain size={20} color={themeColors.primary} />
                <Text style={[styles.statValue, { color: themeColors.text }]} numberOfLines={1}>{weather.condition.split(' ')[0]}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>অবস্থা</Text>
              </View>
            </View>

            {/* Smart Irrigation Advice Box */}
            <View style={[styles.adviceCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.primary }]}>
              <View style={styles.adviceCardHeader}>
                <ShieldCheck size={22} color={themeColors.primary} />
                <Text style={[styles.adviceCardTitle, { color: themeColors.text }]}>সেচ ও নিষ্কাশন পরামর্শ</Text>
              </View>
              
              <View style={styles.adviceList}>
                {/* Rain/Irrigation Advice */}
                {weather.advice?.rain && (
                  <View style={[styles.adviceCategoryBlock, { marginBottom: 12 }]}>
                    <Text style={[styles.adviceCategoryTitle, { color: themeColors.primary }]}>🌧️ {weather.advice.rain.title}</Text>
                    <Text style={[styles.adviceCategoryMsg, { color: themeColors.text }]}>{weather.advice.rain.msg}</Text>
                    {weather.advice.rain.actions?.map((act, i) => (
                      <View key={i} style={styles.actionRow}>
                        <Text style={[styles.actionText, { color: themeColors.textSecondary }]}>• {act}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Soil advice */}
                {weather.advice?.soil && (
                  <View style={[styles.adviceCategoryBlock, { marginBottom: 12 }]}>
                    <Text style={[styles.adviceCategoryTitle, { color: '#8D6E63' }]}>🌱 {weather.advice.soil.title}</Text>
                    <Text style={[styles.adviceCategoryMsg, { color: themeColors.text }]}>{weather.advice.soil.msg}</Text>
                    {weather.advice.soil.actions?.map((act, i) => (
                      <View key={i} style={styles.actionRow}>
                        <Text style={[styles.actionText, { color: themeColors.textSecondary }]}>• {act}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Harvest advice */}
                {weather.advice?.harvest && (
                  <View style={styles.adviceCategoryBlock}>
                    <Text style={[styles.adviceCategoryTitle, { color: '#FFB300' }]}>🌾 {weather.advice.harvest.title}</Text>
                    <Text style={[styles.adviceCategoryMsg, { color: themeColors.text }]}>{weather.advice.harvest.msg}</Text>
                    {weather.advice.harvest.actions?.map((act, i) => (
                      <View key={i} style={styles.actionRow}>
                        <Text style={[styles.actionText, { color: themeColors.textSecondary }]}>• {act}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* General irrigation advice disclaimer */}
            <View style={[styles.infoCard, { backgroundColor: 'rgba(0,0,0,0.02)', borderColor: themeColors.border }]}>
              <HelpCircle size={18} color={themeColors.textSecondary} />
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                স্মার্ট সেচ এ্যাডভাইজরি মূলত বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) এর আধুনিক সেচ গাইড ও লাইভ স্যাটেলাইট বৃষ্টিপাতের সংকেত বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে প্রদান করা হয়ে থাকে।
              </Text>
            </View>

          </View>
        ) : null}

      </ScrollView>

      {/* District Selector Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>জেলা নির্বাচন করুন</Text>
            <ScrollView style={styles.districtList} showsVerticalScrollIndicator={false}>
              {DISTRICTS.map((d) => (
                <TouchableOpacity
                  key={d.name_en}
                  style={[styles.districtItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    setSelectedDistrict(d);
                    setShowDistrictModal(false);
                  }}
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  districtCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  districtSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  districtText: {
    fontSize: 17,
    fontWeight: '900',
  },
  loaderContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  errorDesc: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  advisoryContainer: {
    gap: 16,
  },
  weatherStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  adviceCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  adviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  adviceCardTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  adviceList: {
    gap: 12,
  },
  adviceCategoryBlock: {
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  adviceCategoryTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  adviceCategoryMsg: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  actionRow: {
    marginLeft: 8,
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 12,
    borderRadius: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
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
  }
}) as Record<string, any>;
