import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  useColorScheme
} from 'react-native';
import { Send, MapPin, Calendar, CornerDownRight, Info, Sparkles, User, Sprout, Volume2, VolumeX, ChevronDown, ArrowLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DISTRICTS } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
  followUpQuestions?: string[];
  actionSuggestions?: Array<{
    label: string;
    action: string;
    params: any;
  }>;
  loading?: boolean;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ঢাকা');
  const [selectedSeason, setSelectedSeason] = useState<string>('বোরো');
  
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Suggested Prompts
  const welcomeSuggestions = [
    { text: "ধানের পাতা হলুদ কেন?", label: "পাতা হলুদ" },
    { text: "বোরো ধানের সারের পরিমাণ", label: "বোরো সার" },
    { text: "টমেটোর নাবি ধসা রোগ", label: "টমেটো রোগ" },
    { text: "আলু চাষের সেচ পদ্ধতি", label: "আলুর সেচ" }
  ];

  const SEASONS = ['বোরো', 'আমন', 'আউশ', 'রবি', 'খরিপ'];

  useEffect(() => {
    // Initial welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! আমি গাছের ডাক্তার।\n\nআমি আপনাকে ফসল চাষাবাদে সারের সঠিক অনুপাত প্রয়োগ, মাটি উর্বর রাখার কৌশল, এবং ফসলের বিভিন্ন রোগবালাই প্রতিকার ও প্রতিরোধের উপায় সম্পর্কে বিস্তারিত পরামর্শ দিতে পারি।\n\nআপনার ফসলের যেকোনো সমস্যা নিচে বাংলায় বিস্তারিত লিখুন।'
    };
    setMessages([welcomeMsg]);

    return () => {
      Speech.stop();
    };
  }, []);

  const speakText = async (text: string, messageId: string) => {
    try {
      if (currentlySpeakingId === messageId) {
        await Speech.stop();
        setCurrentlySpeakingId(null);
        return;
      }

      await Speech.stop();
      setCurrentlySpeakingId(messageId);

      // Clean markdown bold tags and bullet points for clean speech synthesis
      const cleaned = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/[`#_\-]/g, '')
        .replace(/[\n\r]+/g, ' । ')
        .trim();

      await Speech.speak(cleaned, {
        language: 'bn-BD',
        rate: 0.9,
        onDone: () => setCurrentlySpeakingId(null),
        onError: (err) => {
          console.warn('Speech synthesis error:', err);
          setCurrentlySpeakingId(null);
        }
      });
    } catch (err) {
      console.warn(err);
      setCurrentlySpeakingId(null);
    }
  };

  const sendMessageToAPI = async (textToSend: string, currentHistory: Message[]) => {
    if (!textToSend.trim()) return;

    // Stop speaking if new message is sent
    await Speech.stop();
    setCurrentlySpeakingId(null);

    const userMsgId = 'user-' + Date.now();
    const botMsgId = 'bot-' + Date.now();

    const userMessage: Message = { id: userMsgId, sender: 'user', text: textToSend };
    const loadingBotMessage: Message = { id: botMsgId, sender: 'bot', text: '', loading: true };

    const updatedHistory = [...currentHistory, userMessage, loadingBotMessage];
    setMessages(updatedHistory);
    setInput('');
    
    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    const chatHistory = currentHistory
      .filter(m => m.id !== 'welcome' && !m.loading)
      .map(m => ({
        sender: m.sender,
        text: m.text
      }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: textToSend,
          history: chatHistory,
          district: selectedDistrict,
          season: selectedSeason
        })
      });

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const data = await response.json();

      setMessages(prev => prev.map(m => {
        if (m.id === botMsgId) {
          return {
            id: botMsgId,
            sender: 'bot',
            text: data.answer_bn || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
            sources: data.sources || [],
            followUpQuestions: data.follow_up_questions || [],
            actionSuggestions: data.action_suggestions || [],
            loading: false
          };
        }
        return m;
      }));
    } catch (error) {
      console.warn(error);
      setMessages(prev => prev.map(m => {
        if (m.id === botMsgId) {
          return {
            id: botMsgId,
            sender: 'bot',
            text: 'দুঃখিত, সার্ভার সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।',
            loading: false
          };
        }
        return m;
      }));
    } finally {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageToAPI(input, messages);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      const boldRegex = /\*\*(.*?)\*\*/g;

      const parseBold = (str: string) => {
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(str)) !== null) {
          if (match.index > lastIndex) {
            parts.push(str.substring(lastIndex, match.index));
          }
          parts.push(<Text key={match.index} style={styles.boldText}>{match[1]}</Text>);
          lastIndex = boldRegex.lastIndex;
        }

        if (lastIndex < str.length) {
          parts.push(str.substring(lastIndex));
        }

        return parts.length > 0 ? parts : str;
      };

      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const itemContent = trimmedLine.substring(1).trim();
        return (
          <Text key={idx} style={[styles.bulletLine, { color: themeColors.text }]}>
            • {parseBold(itemContent)}
          </Text>
        );
      }

      return (
        <Text key={idx} style={[styles.messageText, { color: themeColors.text }]}>
          {parseBold(line)}
        </Text>
      );
    });
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
          <Text style={[styles.title, { color: themeColors.text }]}>গাছের ডাক্তার 🩺</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            ফসল চাষাবাদ ও রোগ প্রতিকারে লাইভ সমাধান
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.flexContainer}
      >
        {/* Localized selectors bar - Clickable and interactive */}
        <View style={[styles.selectorBar, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity 
            style={styles.selectorItem}
            onPress={() => setShowDistrictModal(true)}
            activeOpacity={0.7}
          >
            <MapPin size={16} color={themeColors.primary} />
            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>জেলা:</Text>
            <Text style={[styles.selectorValue, { color: themeColors.text }]}>{selectedDistrict}</Text>
            <ChevronDown size={12} color={themeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.selectorItem}
            onPress={() => setShowSeasonModal(true)}
            activeOpacity={0.7}
          >
            <Calendar size={16} color={themeColors.primary} />
            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>ঋতু:</Text>
            <Text style={[styles.selectorValue, { color: themeColors.text }]}>{selectedSeason}</Text>
            <ChevronDown size={12} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.botRow
              ]}
            >
              {msg.sender === 'bot' && (
                <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
                  <Sprout size={14} color="#fff" />
                </View>
              )}

              <View style={styles.bubbleWrapper}>
                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user'
                      ? [styles.userBubble, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]
                      : [styles.botBubble, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]
                  ]}
                >
                  {msg.loading ? (
                    <View style={styles.loadingWrapper}>
                      <ActivityIndicator size="small" color={themeColors.primary} />
                      <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>গাছের ডাক্তার ভাবছেন...</Text>
                    </View>
                  ) : (
                    <View style={styles.messageTextContainer}>
                      {formatText(msg.text)}

                      {/* TTS voice trigger button */}
                      {msg.sender === 'bot' && msg.id !== 'welcome' && (
                        <View style={[styles.voiceBtnRow, { borderTopColor: themeColors.border }]}>
                          <TouchableOpacity
                            onPress={() => speakText(msg.text, msg.id)}
                            style={[
                              styles.voiceBtn,
                              currentlySpeakingId === msg.id 
                                ? { backgroundColor: themeColors.primary } 
                                : { backgroundColor: 'rgba(46, 125, 50, 0.08)' }
                            ]}
                          >
                            {currentlySpeakingId === msg.id ? (
                              <>
                                <VolumeX size={13} color="#fff" />
                                <Text style={[styles.voiceBtnText, { color: '#fff' }]}>পজ করুন</Text>
                              </>
                            ) : (
                              <>
                                <Volume2 size={13} color={themeColors.primary} />
                                <Text style={[styles.voiceBtnText, { color: themeColors.primary }]}>পড়ুন (ভয়েস)</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Meta: Sources and Follow-ups */}
                {!msg.loading && msg.sender === 'bot' && (
                  <View style={styles.metaContainer}>
                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <View style={styles.sourcesRow}>
                        <Info size={12} color={themeColors.primary} />
                        <Text style={[styles.sourcesLabel, { color: themeColors.textSecondary }]}>উৎস:</Text>
                        {msg.sources.map((src, i) => (
                          <View key={i} style={styles.sourceTag}>
                            <Text style={[styles.sourceTagText, { color: themeColors.primary }]}>{src}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Follow-up Questions */}
                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <View style={styles.followUpContainer}>
                        <View style={styles.followUpTitleRow}>
                          <CornerDownRight size={12} color={themeColors.primary} />
                          <Text style={[styles.followUpTitle, { color: themeColors.textSecondary }]}>জিজ্ঞেস করুন:</Text>
                        </View>
                        {msg.followUpQuestions.map((q, i) => (
                          <TouchableOpacity
                            key={i}
                            style={styles.followUpBtn}
                            onPress={() => sendMessageToAPI(q, messages)}
                          >
                            <Text style={[styles.followUpBtnText, { color: themeColors.primary }]}>• {q}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {msg.sender === 'user' && (
                <View style={[styles.avatar, { backgroundColor: themeColors.soilBrown }]}>
                  <User size={14} color="#fff" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Suggestion Chips (only initially) */}
        {messages.length === 1 && (
          <View style={styles.suggestionsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
              {welcomeSuggestions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.suggestionChip, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
                  onPress={() => sendMessageToAPI(item.text, messages)}
                >
                  <Sparkles size={12} color={themeColors.primary} style={styles.suggestionIcon} />
                  <Text style={[styles.suggestionText, { color: themeColors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat Input Area */}
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: themeColors.cardBackground, 
            borderTopColor: themeColors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 12
          }
        ]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="রোগ বা চাষ পদ্ধতি নিয়ে প্রশ্ন করুন..."
            placeholderTextColor={themeColors.textSecondary}
            style={[styles.textInput, { color: themeColors.text }]}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() ? themeColors.primary : 'rgba(0, 0, 0, 0.05)' }
            ]}
          >
            <Send size={18} color={input.trim() ? '#fff' : themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

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
                    setSelectedDistrict(d.name_bn);
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

      {/* Season Selector Modal */}
      <Modal visible={showSeasonModal} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>ঋতু নির্বাচন করুন</Text>
            <ScrollView style={styles.districtList} showsVerticalScrollIndicator={false}>
              {SEASONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.districtItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => {
                    setSelectedSeason(s);
                    setShowSeasonModal(false);
                  }}
                >
                  <Text style={[styles.districtItemText, { color: themeColors.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowSeasonModal(false)} style={[styles.closeButton, { backgroundColor: themeColors.primary }]}>
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
  flexContainer: {
    flex: 1,
  },
  selectorBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectorValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  botRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleWrapper: {
    flex: 1,
    gap: 6,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    borderTopRightRadius: 2,
  },
  botBubble: {
    borderTopLeftRadius: 2,
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  messageTextContainer: {
    gap: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bulletLine: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    paddingLeft: 8,
    marginVertical: 1,
  },
  boldText: {
    fontWeight: '900',
    color: '#2E7D32',
  },
  voiceBtnRow: {
    borderTopWidth: 0.5,
    paddingTop: 8,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  voiceBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  metaContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  sourcesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  sourcesLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sourceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(46, 125, 50, 0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(46, 125, 50, 0.12)',
  },
  sourceTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  followUpContainer: {
    marginTop: 4,
    gap: 4,
  },
  followUpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followUpTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  followUpBtn: {
    paddingVertical: 2,
  },
  followUpBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestionsWrapper: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestionIcon: {
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
});
