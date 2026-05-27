import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { Calculator as CalcIcon, Sprout, Layers, Scale, Info, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CROPS, Crop } from '@/constants/data';
import { Colors } from '@/constants/theme';

export default function CalculatorScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedCrop, setSelectedCrop] = useState<Crop>(CROPS[0]);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [landSize, setLandSize] = useState<string>('');
  const [landUnit, setLandUnit] = useState<'bigha' | 'decimal'>('bigha');
  const [calculated, setCalculated] = useState<boolean>(false);

  // Calculation outputs
  const [ureaNeeded, setUreaNeeded] = useState<number>(0);
  const [tspNeeded, setTspNeeded] = useState<number>(0);
  const [mopNeeded, setMopNeeded] = useState<number>(0);
  const [gypsumNeeded, setGypsumNeeded] = useState<number>(0);
  const [zincNeeded, setZincNeeded] = useState<number>(0);

  const handleCalculate = () => {
    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) {
      alert('দয়া করে জমির সঠিক পরিমাণ ইনপুট দিন!');
      return;
    }

    // Convert decimal to bigha (1 bigha = 33 decimal)
    const bighaMultiplier = landUnit === 'decimal' ? size / 33 : size;

    // Get fertilizer rule (defaulting to first rule in the list)
    const rule = selectedCrop.fertilizers[0];
    if (!rule) {
      alert('এই ফসলের জন্য কোনো সারের তথ্য পাওয়া যায়নি।');
      return;
    }

    setUreaNeeded(parseFloat((rule.urea * bighaMultiplier).toFixed(1)));
    setTspNeeded(parseFloat((rule.tsp * bighaMultiplier).toFixed(1)));
    setMopNeeded(parseFloat((rule.mop * bighaMultiplier).toFixed(1)));
    setGypsumNeeded(parseFloat((rule.gypsum * bighaMultiplier).toFixed(1)));
    setZincNeeded(parseFloat((rule.zinc * bighaMultiplier).toFixed(2)));
    setCalculated(true);
  };

  const translateToBanglaDigits = (num: number | string): string => {
    const englishToBanglaMap: { [key: string]: string } = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '.': '.'
    };
    return String(num).split('').map(char => englishToBanglaMap[char] || char).join('');
  };

  const formatWeight = (weightInKg: number): string => {
    if (weightInKg < 1) {
      const grams = Math.round(weightInKg * 1000);
      return `${translateToBanglaDigits(grams)} গ্রাম`;
    } else {
      const kg = Math.floor(weightInKg);
      const grams = Math.round((weightInKg - kg) * 1000);
      if (grams === 0) {
        return `${translateToBanglaDigits(kg)} কেজি`;
      }
      return `${translateToBanglaDigits(kg)} কেজি ${translateToBanglaDigits(grams)} গ্রাম`;
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      {/* Premium Dynamic Header */}
      <View style={[
        styles.headerContainer, 
        { 
          borderBottomColor: themeColors.border,
          paddingTop: insets.top + 6,
          paddingBottom: 10,
          backgroundColor: themeColors.cardBackground
        }
      ]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backBtn, { backgroundColor: 'rgba(0, 0, 0, 0.02)' }]}
        >
          <ArrowLeft size={20} color={themeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.title, { color: themeColors.text }]}>সঠিক সার হিসাব 🧮</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            ফসলের প্রকার ও জমির পরিমাপ অনুযায়ী সঠিক সারের পরিমাণ বের করুন
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          
          {/* Crop Selector */}
          <Text style={[styles.inputLabel, { color: themeColors.text }]}>ফসল নির্বাচন করুন:</Text>
          <TouchableOpacity
            style={[styles.dropdownTrigger, { borderColor: themeColors.border }]}
            onPress={() => setShowCropDropdown(!showCropDropdown)}
          >
            <Text style={[styles.dropdownTriggerText, { color: themeColors.text }]}>{selectedCrop.name_bn}</Text>
            <Sprout size={16} color={themeColors.primary} />
          </TouchableOpacity>

          {showCropDropdown && (
            <View style={[styles.dropdownOptions, { borderColor: themeColors.border }]}>
              {CROPS.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={[styles.dropdownOptionItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    setSelectedCrop(crop);
                    setShowCropDropdown(false);
                    setCalculated(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, { color: themeColors.text }]}>{crop.name_bn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Land Size Input */}
          <Text style={[styles.inputLabel, { color: themeColors.text, marginTop: 16 }]}>জমির পরিমাণ লিখুন:</Text>
          <View style={styles.inputRow}>
            <TextInput
              keyboardType="numeric"
              value={landSize}
              onChangeText={(text) => {
                setLandSize(text);
                setCalculated(false);
              }}
              placeholder="যেমন: ১০"
              placeholderTextColor={themeColors.textSecondary}
              style={[styles.textInput, { color: themeColors.text, borderColor: themeColors.border }]}
            />
            
            {/* Unit Toggle */}
            <View style={styles.unitSelector}>
              <TouchableOpacity
                onPress={() => {
                  setLandUnit('bigha');
                  setCalculated(false);
                }}
                style={[
                  styles.unitBtn,
                  landUnit === 'bigha' ? [styles.unitBtnActive, { backgroundColor: themeColors.primary }] : null
                ]}
              >
                <Text style={[styles.unitBtnText, landUnit === 'bigha' ? styles.unitBtnTextActive : { color: themeColors.text }]}>বিঘা</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLandUnit('decimal');
                  setCalculated(false);
                }}
                style={[
                  styles.unitBtn,
                  landUnit === 'decimal' ? [styles.unitBtnActive, { backgroundColor: themeColors.primary }] : null
                ]}
              >
                <Text style={[styles.unitBtnText, landUnit === 'decimal' ? styles.unitBtnTextActive : { color: themeColors.text }]}>শতক</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity onPress={handleCalculate} style={[styles.calculateBtn, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.calculateBtnText}>সারের পরিমাণ হিসাব করুন ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Calculated Results */}
        {calculated && (
          <View style={[styles.resultCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            
            <View style={styles.resultHeader}>
              <CheckCircle size={20} color={themeColors.success} />
              <Text style={[styles.resultTitle, { color: themeColors.text }]}>মোট সারের হিসাব তালিকা</Text>
            </View>

            {/* Bags Visual Layout (Website Parity) */}
            <View style={styles.bagsGrid}>
              <Text style={[styles.bagsGridTitle, { color: themeColors.text }]}>🛍️ প্রয়োজনীয় সারের বস্তা ও পরিমাপ (৫০ কেজি বস্তা হিসেবে):</Text>
              
              <View style={styles.gridRow}>
                {/* Urea Bag */}
                <View style={[styles.bagCard, { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderColor: themeColors.border }]}>
                  <Text style={styles.bagEmoji}>🟢</Text>
                  <Text style={[styles.bagName, { color: themeColors.text }]}>ইউরিয়া</Text>
                  <Text style={[styles.bagWeight, { color: themeColors.primary }]}>{formatWeight(ureaNeeded)}</Text>
                  <Text style={[styles.bagEstimate, { color: themeColors.textSecondary }]}>
                    ~{translateToBanglaDigits((ureaNeeded / 50).toFixed(1))} বস্তা
                  </Text>
                </View>

                {/* TSP Bag */}
                <View style={[styles.bagCard, { backgroundColor: 'rgba(141, 110, 99, 0.05)', borderColor: themeColors.border }]}>
                  <Text style={styles.bagEmoji}>🟤</Text>
                  <Text style={[styles.bagName, { color: themeColors.text }]}>টিএসপি</Text>
                  <Text style={[styles.bagWeight, { color: '#8D6E63' }]}>{formatWeight(tspNeeded)}</Text>
                  <Text style={[styles.bagEstimate, { color: themeColors.textSecondary }]}>
                    ~{translateToBanglaDigits((tspNeeded / 50).toFixed(1))} বস্তা
                  </Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                {/* MOP Bag */}
                <View style={[styles.bagCard, { backgroundColor: 'rgba(255, 152, 0, 0.05)', borderColor: themeColors.border }]}>
                  <Text style={styles.bagEmoji}>🟠</Text>
                  <Text style={[styles.bagName, { color: themeColors.text }]}>এমওপি (পটাশ)</Text>
                  <Text style={[styles.bagWeight, { color: '#E65100' }]}>{formatWeight(mopNeeded)}</Text>
                  <Text style={[styles.bagEstimate, { color: themeColors.textSecondary }]}>
                    ~{translateToBanglaDigits((mopNeeded / 50).toFixed(1))} বস্তা
                  </Text>
                </View>

                {/* Gypsum Bag */}
                <View style={[styles.bagCard, { backgroundColor: 'rgba(120, 120, 120, 0.05)', borderColor: themeColors.border }]}>
                  <Text style={styles.bagEmoji}>⚪</Text>
                  <Text style={[styles.bagName, { color: themeColors.text }]}>জিপসাম</Text>
                  <Text style={[styles.bagWeight, { color: '#616161' }]}>{formatWeight(gypsumNeeded)}</Text>
                  <Text style={[styles.bagEstimate, { color: themeColors.textSecondary }]}>
                    ~{translateToBanglaDigits((gypsumNeeded / 50).toFixed(1))} বস্তা
                  </Text>
                </View>
              </View>

              <View style={[styles.gridRow, { justifyContent: 'center' }]}>
                {/* Zinc Bag */}
                <View style={[styles.bagCard, { backgroundColor: 'rgba(2, 136, 209, 0.05)', borderColor: themeColors.border, width: '48%' }]}>
                  <Text style={styles.bagEmoji}>🔵</Text>
                  <Text style={[styles.bagName, { color: themeColors.text }]}>দস্তা (Zinc)</Text>
                  <Text style={[styles.bagWeight, { color: '#0288D1' }]}>{formatWeight(zincNeeded)}</Text>
                  <Text style={[styles.bagEstimate, { color: themeColors.textSecondary }]}>
                    ~{translateToBanglaDigits((zincNeeded / 50).toFixed(1))} বস্তা
                  </Text>
                </View>
              </View>

            </View>

            {/* DAE Steps Timeline */}
            <View style={[styles.timelineCard, { borderColor: themeColors.border }]}>
              <View style={styles.infoTitleRow}>
                <Scale size={18} color={themeColors.primary} />
                <Text style={[styles.infoTitleText, { color: themeColors.text }]}>
                  সার প্রয়োগের সময় ও কিস্তির বিবরণ (DAE গাইডলাইন):
                </Text>
              </View>
              
              <View style={styles.timelineList}>
                <View style={[styles.timelineStep, { borderBottomColor: themeColors.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                    <Text style={[styles.stepNumberText, { color: themeColors.primary }]}>১</Text>
                  </View>
                  <Text style={[styles.stepText, { color: themeColors.text }]}>
                    ইউরিয়া সার ({formatWeight(ureaNeeded)}) ৩টি কিস্তিতে সমানভাগে প্রয়োগ করুন। ১ম কিস্তি চারা রোপণের ১৫ দিন পর, ২য় কিস্তি ৩০ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে দিতে হবে।
                  </Text>
                </View>

                <View style={[styles.timelineStep, { borderBottomColor: themeColors.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                    <Text style={[styles.stepNumberText, { color: themeColors.primary }]}>২</Text>
                  </View>
                  <Text style={[styles.stepText, { color: themeColors.text }]}>
                    জমি শেষ চাষের সময় সমস্ত টিএসপি ({formatWeight(tspNeeded)}), জিপসাম ({formatWeight(gypsumNeeded)}) এবং দস্তা ({formatWeight(zincNeeded)}) সার মাটির সাথে ভালো করে মিশিয়ে দিন।
                  </Text>
                </View>

                <View style={styles.timelineStep}>
                  <View style={[styles.stepNumber, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                    <Text style={[styles.stepNumberText, { color: themeColors.primary }]}>৩</Text>
                  </View>
                  <Text style={[styles.stepText, { color: themeColors.text }]}>
                    এমওপি সার ({formatWeight(mopNeeded)}) ২ কিস্তিতে প্রয়োগ করতে হবে: অর্ধেক জমি শেষ চাষের সময় এবং বাকি অর্ধেক চারা রোপণের ৩৫-৪০ দিন পর (২য় বার ইউরিয়া দেওয়ার সময়)।
                  </Text>
                </View>
              </View>
            </View>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 120,
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
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  dropdownTriggerText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownOptionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1.2,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  unitBtnActive: {
    backgroundColor: '#2E7D32',
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  unitBtnTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  calculateBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  calculateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  resultCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 10,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  bagsGrid: {
    marginBottom: 20,
    gap: 12,
  },
  bagsGridTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
    lineHeight: 18,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  bagCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  bagEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  bagName: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bagWeight: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  bagEstimate: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    opacity: 0.8,
  },
  timelineCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.02)',
    gap: 12,
    marginTop: 10,
  },
  timelineList: {
    gap: 12,
  },
  timelineStep: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTitleText: {
    fontSize: 13,
    fontWeight: '900',
  }
});
