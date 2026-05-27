import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, MapPin, ChevronRight, CheckCircle, AlertTriangle, ShieldCheck, HeartPulse, Layers, Droplet, Sprout, HelpCircle, Sparkles } from 'lucide-react-native';

import * as ImageManipulator from 'expo-image-manipulator';
import { DISTRICTS, District } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api';

interface SoilResult {
  is_valid: boolean;
  error_message: string | null;
  need_clarification?: boolean;
  questions?: Array<{
    id: string;
    text: string;
    options: string[];
  }>;
  soil_type: string;
  estimated_ph: number;
  color_texture: string;
  suitable_crops: string;
  organic_advice: string;
  chemical_advice: string;
  preventive_measures: string;
  confidence: number;
}

const cleanText = (txt: any): string => {
  if (txt === null || txt === undefined) return '';
  if (Array.isArray(txt)) {
    return txt.map(item => String(item).replace(/\*\*/g, '')).join('\n');
  }
  if (typeof txt === 'object') {
    return JSON.stringify(txt);
  }
  return String(txt).replace(/\*\*/g, '');
};

const compressImage = async (uri: string) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize width to 800px (preserves aspect ratio)
      { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return {
      uri: manipResult.uri,
      base64: manipResult.base64 || null,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
};

export default function SoilScannerScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<any[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Request permissions and open camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('ক্যামেরা ব্যবহারের পারমিশন প্রয়োজন!');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: false, // Don't generate base64 in picker (saves memory)
    });

    if (!pickerResult.canceled && pickerResult.assets?.[0]) {
      setLoading(true);
      try {
        const compressed = await compressImage(pickerResult.assets[0].uri);
        setImageUri(compressed.uri);
        setImageBase64(compressed.base64);
        setResult(null);
        setClarifyingQuestions(null);
        setAnswers({});
        setError(null);
      } catch (err) {
        console.error(err);
        setError('ছবিটি প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    }
  };

  // Request permissions and open gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('গ্যালারি ব্যবহারের পারমিশন প্রয়োজন!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: false, // Don't generate base64 in picker (saves memory)
    });

    if (!pickerResult.canceled && pickerResult.assets?.[0]) {
      setLoading(true);
      try {
        const compressed = await compressImage(pickerResult.assets[0].uri);
        setImageUri(compressed.uri);
        setImageBase64(compressed.base64);
        setResult(null);
        setClarifyingQuestions(null);
        setAnswers({});
        setError(null);
      } catch (err) {
        console.error(err);
        setError('ছবিটি প্রসেস করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    }
  };

  // Send request to live backend server API
  const handleAnalyze = async (userAnswers: Record<string, string> = {}) => {
    if (!imageBase64) {
      alert('দয়া করে আগে একটি মাটির ছবি তুলুন বা গ্যালারি থেকে নির্বাচন করুন!');
      return;
    }

    setLoading(true);
    setError(null);

    // Only clear result if not submitting clarifications
    if (Object.keys(userAnswers).length === 0) {
      setResult(null);
      setClarifyingQuestions(null);
      setAnswers({});
    }

    try {
      const payload = {
        image: `data:image/jpeg;base64,${imageBase64}`,
        type: 'soil',
        location: selectedDistrict.name_bn,
        answers: userAnswers
      };

      const response = await fetch(`${API_BASE_URL}/api/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Soil classification failed');
      }

      const responseData = await response.json();
      if (responseData.success && responseData.result) {
        const res = responseData.result;
        if (res.is_valid === false) {
          setError(res.error_message || 'এটি মাটির কোনো ছবি নয়। দয়া করে পরীক্ষার জন্য মাটির একটি স্পষ্ট ছবি আপলোড করুন।');
        } else if (res.need_clarification === true) {
          setClarifyingQuestions(res.questions || []);
          setResult(null);
        } else {
          setResult(res);
          setClarifyingQuestions(null);
        }
      } else {
        throw new Error(responseData.error || 'ভুল ডাটা ফরম্যাট');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'মাটি পরীক্ষা করা সম্ভব হয়নি। সার্ভার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>মাটি পরীক্ষা 🟫</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>মাটির ছবি তুলুন এবং মাটির ধরণ, পিএইচ (pH) লেভেল ও সার সুপারিশ জানুন</Text>
        </View>

        {/* Location Selection */}
        <View style={[styles.districtCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <View style={styles.locationHeader}>
            <MapPin size={20} color={themeColors.primary} />
            <Text style={[styles.locationLabel, { color: themeColors.text }]}>আপনার অবস্থান (জেলা):</Text>
          </View>
          <TouchableOpacity onPress={() => setShowDistrictModal(true)} style={styles.districtSelector}>
            <Text style={[styles.districtText, { color: themeColors.primary }]}>{selectedDistrict.name_bn} ({selectedDistrict.name_en})</Text>
            <ChevronRight size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Image Preview Box */}
        <View style={[styles.imageCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderBox}>
              <Layers size={64} color="rgba(141, 110, 99, 0.2)" />
              <Text style={[styles.placeholderText, { color: themeColors.textSecondary }]}>পরীক্ষার মাটির ছবি আপলোড করুন</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.imageActionRow}>
            <TouchableOpacity onPress={takePhoto} style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}>
              <Camera size={20} color="#fff" />
              <Text style={styles.actionBtnText}>ছবি তুলুন</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={[styles.actionBtn, { backgroundColor: themeColors.primary }]}>
              <ImageIcon size={20} color="#fff" />
              <Text style={styles.actionBtnText}>গ্যালারি</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Diagnose/Analyze Button */}
        {imageUri && !clarifyingQuestions && (
          <TouchableOpacity
            onPress={() => handleAnalyze()}
            disabled={loading}
            style={[styles.analyzeBtn, { backgroundColor: themeColors.accent }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1B3A2B" />
            ) : (
              <Text style={styles.analyzeBtnText}>মাটি পরীক্ষা করুন 🔍</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Clarifying Questions Panel */}
        {clarifyingQuestions && (
          <View style={[styles.questionsCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.questionsHeader}>
              <HelpCircle size={24} color={themeColors.warning} />
              <View style={styles.questionsHeaderTextWrapper}>
                <Text style={[styles.questionsTitle, { color: themeColors.text }]}>অতিরিক্ত কিছু তথ্য প্রয়োজন</Text>
                <Text style={[styles.questionsSubtitle, { color: themeColors.textSecondary }]}>মাটি পরীক্ষা শতভাগ নিশ্চিত করতে নিচের সহজ প্রশ্নগুলোর উত্তর দিন:</Text>
              </View>
            </View>

            <View style={styles.questionsList}>
              {clarifyingQuestions.map((q) => (
                <View key={q.id} style={[styles.questionItem, { borderBottomColor: themeColors.border }]}>
                  <Text style={[styles.questionText, { color: themeColors.text }]}>🌱 {q.text}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt: string) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => setAnswers({ ...answers, [q.id]: opt })}
                          style={[
                            styles.optionButton,
                            { borderColor: themeColors.border },
                            isSelected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                          ]}
                        >
                          <Text style={[styles.optionText, { color: isSelected ? '#fff' : themeColors.textSecondary }]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => handleAnalyze(answers)}
              disabled={loading || Object.keys(answers).length < clarifyingQuestions.length}
              style={[
                styles.confirmBtn,
                { backgroundColor: themeColors.primary },
                (loading || Object.keys(answers).length < clarifyingQuestions.length) && { opacity: 0.5 }
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>ফলাফল নিশ্চিত করুন 🌾</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.3)' }]}>
            <AlertTriangle size={20} color={themeColors.error} />
            <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
          </View>
        )}

        {/* Diagnostic Results Display */}
        {result && (
          <View>
            {!result.is_valid ? (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.3)' }]}>
                <AlertTriangle size={24} color={themeColors.error} />
                <Text style={[styles.invalidText, { color: themeColors.text }]}>{result.error_message}</Text>
              </View>
            ) : (
              <View style={[styles.resultCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                
                {/* Result header */}
                <View style={styles.resultHeader}>
                  <CheckCircle size={24} color={themeColors.success} />
                  <Text style={[styles.resultTitle, { color: themeColors.text }]}>মাটি পরীক্ষা সম্পন্ন হয়েছে</Text>
                </View>

                {/* Soil Metrics */}
                <View style={styles.resultDetails}>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>মাটির ধরণ:</Text>
                    <Text style={[styles.resultValue, { color: themeColors.primary, fontSize: 16 }]}>{cleanText(result.soil_type)}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>পিএইচ (pH):</Text>
                    <Text style={[styles.resultValue, { color: themeColors.text, fontSize: 16 }]}>{result.estimated_ph}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>রঙ ও কণা:</Text>
                    <Text style={[styles.resultValueText, { color: themeColors.text }]}>{cleanText(result.color_texture)}</Text>
                  </View>
                </View>

                {/* Suitable crops */}
                <View style={styles.block}>
                  <Text style={[styles.blockTitle, { color: themeColors.text }]}><Sprout size={16} color={themeColors.primary} /> চাষের উপযোগী লাভজনক ফসলসমূহ</Text>
                  <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>{cleanText(result.suitable_crops)}</Text>
                </View>

                {/* Organic Fertilization Advice */}
                <View style={styles.block}>
                  <Text style={[styles.blockTitle, { color: themeColors.text }]}><ShieldCheck size={16} color={themeColors.success} /> জৈব সার ও উর্বরতা বৃদ্ধি গাইড</Text>
                  <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>{cleanText(result.organic_advice)}</Text>
                </View>

                {/* Chemical Fertilization & pH Advice */}
                <View style={styles.block}>
                  <Text style={[styles.blockTitle, { color: themeColors.text }]}><HeartPulse size={16} color={themeColors.error} /> অম্লত্ব/ক্ষারত্ব সংশোধন ও রাসায়নিক সার হিসাব</Text>
                  <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>{cleanText(result.chemical_advice)}</Text>
                </View>

                {/* Preventive measures / long term */}
                <View style={styles.blockLast}>
                  <Text style={[styles.blockTitle, { color: themeColors.text }]}><Droplet size={16} color={themeColors.info} /> মাটির আর্দ্রতা ও ক্ষয়রোধ করার পরামর্শ</Text>
                  <Text style={[styles.blockText, { color: themeColors.textSecondary }]}>{cleanText(result.preventive_measures)}</Text>
                </View>

                {/* Confidence chip */}
                <View style={styles.confidenceRow}>
                  <Text style={[styles.confidenceText, { color: themeColors.textSecondary }]}>নিশ্চয়তা সূচক (Confidence): {(result.confidence * 100).toFixed(0)}%</Text>
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* District Selector Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>আপনার জেলা নির্বাচন করুন</Text>
            <ScrollView style={styles.districtList}>
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

    </SafeAreaView>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '600',
  },
  districtCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: '800',
  },
  imageCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },
  placeholderBox: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(141, 110, 99, 0.2)',
  },
  placeholderText: {
    fontSize: 13,
    marginTop: 12,
    fontWeight: 'bold',
  },
  imageActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyzeBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeBtnText: {
    color: '#1B3A2B',
    fontSize: 16,
    fontWeight: '900',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  invalidText: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 20,
  },
  resultCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  resultDetails: {
    gap: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    borderRadius: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    width: 90,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },
  resultValueText: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  block: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  blockLast: {
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  confidenceRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
    marginTop: 12,
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 11,
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
  },
  questionsCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  questionsHeaderTextWrapper: {
    flex: 1,
  },
  questionsTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  questionsSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
    lineHeight: 15,
  },
  questionsList: {
    marginBottom: 16,
  },
  questionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  }
});
