import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { ArrowLeft, BookOpen, ClipboardList, Info, HelpCircle, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

interface DirectoryItem {
  title: string;
  type: 'subsidy' | 'loan';
  provider: string;
  rate_or_amount: string;
  requirements: string[];
  documents: string[];
  contact: string;
}

const DIRECTORY_DATA: DirectoryItem[] = [
  {
    title: "খরিপ ফসলে সার ও বীজ প্রণোদনা কর্মসূচি",
    type: 'subsidy',
    provider: "কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও কৃষি মন্ত্রণালয়",
    rate_or_amount: "১০০% ভর্তুকি (সম্পূর্ণ বিনামূল্যে বীজ ও সার বিতরণ)",
    requirements: [
      "আবেদনকারীকে অবশ্যই একজন ক্ষুদ্র বা প্রান্তিক কৃষক হতে হবে।",
      "সর্বোচ্চ ১ বিঘা জমির আবাদের জন্য প্রণোদনা দেওয়া হবে।",
      "কৃষক নিবন্ধন কার্ড (কৃষি কার্ড) থাকতে হবে।"
    ],
    documents: [
      "জাতীয় পরিচয়পত্র (NID) এর ফটোকপি।",
      "কৃষি কার্ড (কৃষক সহকারী কার্ড)।",
      "১ কপি পাসপোর্ট সাইজ ছবি।"
    ],
    contact: "আপনার নিজ ব্লকের উপ-সহকারী কৃষি কর্মকর্তা (SAAO) অথবা উপজেলা কৃষি অফিস।"
  },
  {
    title: "৪% রেয়াতি সুদে শস্য ও ফসল উৎপাদন ঋণ",
    type: 'loan',
    provider: "বাংলাদেশ কৃষি ব্যাংক (BKB) ও রাজশাহী কৃষি উন্নয়ন ব্যাংক",
    rate_or_amount: "৪% রেয়াতি বা স্বল্প সুদের হার (স্বল্পমেয়াদী ঋণ)",
    requirements: [
      "আবেদনকারীকে প্রকৃত চাষী হতে হবে (নিজে চাষ করেন বা বর্গা চাষী)।",
      "ধান, গম, পেঁয়াজ, ডাল ও তৈলবীজ চাষের জন্য প্রযোজ্য।",
      "কোনো ব্যাংকে খেলাপি ঋণ থাকা যাবে না।"
    ],
    documents: [
      "NID ও পাসপোর্ট সাইজ ছবি।",
      "ভূমির মালিকানা সংক্রান্ত দলিল (খতিয়ান/পর্চা) অথবা বর্গা চাষের চুক্তিপত্র।",
      "কৃষি কার্ড এবং ইউপি চেয়ারম্যানের নাগরিকত্ব সনদ।"
    ],
    contact: "নিকটস্থ বাংলাদেশ কৃষি ব্যাংক (BKB) শাখা অথবা সোনালী/জনতা ব্যাংক শাখা।"
  },
  {
    title: "কৃষি যন্ত্রপাতি ক্রয়ে উন্নয়ন সহায়তা ভর্তুকি",
    type: 'subsidy',
    provider: "কৃষি সম্প্রসারণ অধিদপ্তর (সমন্বিত খামার ব্যবস্থাপনা প্রকল্প)",
    rate_or_amount: "৫০% থেকে ৭০% পর্যন্ত আর্থিক উন্নয়ন সহায়তা (ভর্তুকি)",
    requirements: [
      "কম্বাইন হারভেস্টার, রিপার বা সিডার ক্রয়ের জন্য প্রযোজ্য।",
      "কৃষক সমবায় বা ব্যক্তিগতভাবে বড় জমির মালিক হতে হবে।"
    ],
    documents: [
      "যান্ত্রিক প্রণোদনার আবেদন ফরম (উপজেলা অফিসে প্রাপ্ত)।",
      "কৃষি কার্ড ও NID ফটোকপি।",
      "জমির খতিয়ান ও ব্যাংক হিসাবের বিবরণী।"
    ],
    contact: "উপজেলা কৃষি কর্মকর্তা অথবা জেলা উপ-পরিচালকের কার্যালয় (DAE)।"
  },
  {
    title: "মসলা জাতীয় ফসল চাষাবাদে বিশেষ কৃষি ঋণ",
    type: 'loan',
    provider: "বাংলাদেশ ব্যাংক রিফাইন্যান্স স্কিম (সকল বাণিজ্যিক ব্যাংক)",
    rate_or_amount: "৪% বার্ষিক সরল সুদ",
    requirements: [
      "আদা, হলুদ, পেঁয়াজ, রসুন ও মরিচ চাষের জন্য বিশেষ প্রণোদনা ঋণ।",
      "অন্য কোনো মসলা প্রজেক্টের সাথে যুক্ত থাকতে হবে বা চাষের উপযুক্ত জমি থাকতে হবে।"
    ],
    documents: [
      "চাষী ঘোষণা ফরম ও NID।",
      "জমির পরচা অথবা লিজ চুক্তিপত্র।"
    ],
    contact: "সকল রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক অথবা বেসরকারি তফসিলি ব্যাংক।"
  }
];

export default function LoansScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [selectedType, setSelectedType] = useState<'all' | 'subsidy' | 'loan'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Default expand first item

  const insets = useSafeAreaInsets();

  const filteredItems = DIRECTORY_DATA.filter(item =>
    selectedType === 'all' || item.type === selectedType
  );

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
          <Text style={[styles.title, { color: themeColors.text }]}>ঋণ ও অনুদান সহায়িকা ৳</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            সরকারি ভর্তুকি ও স্বল্প সুদে ঋণ পাওয়ার অফিসিয়াল নির্দেশিকা
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Filters bar */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <TouchableOpacity
              onPress={() => { setSelectedType('all'); setExpandedIndex(0); }}
              style={[
                styles.filterChip,
                { borderColor: themeColors.border },
                selectedType === 'all' ? [styles.filterChipActive, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }] : null
              ]}
            >
              <Text style={[styles.filterChipText, selectedType === 'all' ? styles.filterChipTextActive : { color: themeColors.textSecondary }]}>সব স্কিম</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSelectedType('subsidy'); setExpandedIndex(0); }}
              style={[
                styles.filterChip,
                { borderColor: themeColors.border },
                selectedType === 'subsidy' ? [styles.filterChipActive, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }] : null
              ]}
            >
              <Text style={[styles.filterChipText, selectedType === 'subsidy' ? styles.filterChipTextActive : { color: themeColors.textSecondary }]}>ভর্তুকি ও প্রণোদনা</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSelectedType('loan'); setExpandedIndex(0); }}
              style={[
                styles.filterChip,
                { borderColor: themeColors.border },
                selectedType === 'loan' ? [styles.filterChipActive, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }] : null
              ]}
            >
              <Text style={[styles.filterChipText, selectedType === 'loan' ? styles.filterChipTextActive : { color: themeColors.textSecondary }]}>৪% কৃষি ঋণ</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Schemes Expandable list */}
        <View style={styles.listContainer}>
          {filteredItems.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <View 
                key={idx} 
                style={[
                  styles.card, 
                  { 
                    backgroundColor: themeColors.cardBackground, 
                    borderColor: isExpanded ? themeColors.primary : themeColors.border 
                  }
                ]}
              >
                {/* Accordion Trigger Header */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(idx)}
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.badgeRow}>
                      <Text 
                        style={[
                          styles.badge, 
                          item.type === 'subsidy' 
                            ? { backgroundColor: 'rgba(46, 125, 50, 0.1)', color: themeColors.primary } 
                            : { backgroundColor: 'rgba(141, 110, 99, 0.1)', color: themeColors.soilBrown }
                        ]}
                      >
                        {item.type === 'subsidy' ? 'প্রণোদনা/ভর্তুকি' : '৪% রেয়াতি ঋণ'}
                      </Text>
                      <Text style={[styles.providerText, { color: themeColors.textSecondary }]}>{item.provider.split(' ও ')[0]}</Text>
                    </View>
                    <Text style={[styles.schemeTitle, { color: themeColors.text }]}>{item.title}</Text>
                  </View>
                  <View style={styles.chevron}>
                    {isExpanded ? <ChevronUp size={20} color={themeColors.textSecondary} /> : <ChevronDown size={20} color={themeColors.textSecondary} />}
                  </View>
                </TouchableOpacity>

                {/* Accordion Collapsible Content */}
                {isExpanded && (
                  <View style={[styles.cardContent, { borderTopColor: themeColors.border }]}>
                    
                    {/* Amount / Rate Banner */}
                    <View style={[styles.amountBanner, { backgroundColor: 'rgba(255, 213, 79, 0.08)', borderColor: 'rgba(255, 213, 79, 0.2)' }]}>
                      <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>সুবিধার পরিমাণ / সুদের হার:</Text>
                      <Text style={[styles.amountValue, { color: themeColors.primary }]}>{item.rate_or_amount}</Text>
                    </View>

                    {/* Eligibility / Requirements */}
                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionTitleRow}>
                        <ClipboardList size={16} color={themeColors.primary} />
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>যোগ্যতার শর্তাবলী:</Text>
                      </View>
                      {item.requirements.map((req, i) => (
                        <View key={i} style={styles.listItemRow}>
                          <View style={[styles.bullet, { backgroundColor: themeColors.primary }]} />
                          <Text style={[styles.listItemText, { color: themeColors.text }]}>{req}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Paperwork / Documents */}
                    <View style={styles.sectionBlock}>
                      <View style={styles.sectionTitleRow}>
                        <BookOpen size={16} color={themeColors.primary} />
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>প্রয়োজনীয় কাগজপত্র:</Text>
                      </View>
                      {item.documents.map((doc, i) => (
                        <View key={i} style={styles.listItemRow}>
                          <View style={[styles.bullet, { backgroundColor: themeColors.soilBrown }]} />
                          <Text style={[styles.listItemText, { color: themeColors.text }]}>{doc}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Where to apply / Contact */}
                    <View style={[styles.contactBox, { backgroundColor: 'rgba(0, 0, 0, 0.02)', borderColor: themeColors.border }]}>
                      <Info size={16} color={themeColors.info} />
                      <View style={styles.contactDetails}>
                        <Text style={[styles.contactLabel, { color: themeColors.textSecondary }]}>আবেদনের যোগাযোগের ঠিকানা:</Text>
                        <Text style={[styles.contactText, { color: themeColors.text }]}>{item.contact}</Text>
                      </View>
                    </View>

                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Info Disclaimer Card */}
        <View style={[styles.disclaimerCard, { backgroundColor: 'rgba(46, 125, 50, 0.03)', borderColor: themeColors.border }]}>
          <HelpCircle size={20} color={themeColors.primary} />
          <Text style={[styles.disclaimerText, { color: themeColors.textSecondary }]}>
            ঋণ ও প্রণোদনা কর্মসূচিগুলোর নীতিমালা সরকারি নির্দেশনানুযায়ী সময় সময় পরিবর্তিত হতে পারে। আবেদনের পূর্বে আপনার নিকটস্থ কৃষি কর্মকর্তা অথবা সংশ্লিষ্ট ব্যাংক শাখায় যোগাযোগ করার জন্য অনুরোধ করা হলো।
          </Text>
        </View>

      </ScrollView>
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
  },
  filtersWrapper: {
    marginBottom: 16,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  listContainer: {
    gap: 12,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
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
    padding: 16,
    gap: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  providerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  schemeTitle: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  chevron: {
    padding: 2,
  },
  cardContent: {
    borderTopWidth: 1,
    padding: 16,
    gap: 16,
  },
  amountBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  contactBox: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  contactDetails: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  disclaimerCard: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 14,
    borderRadius: 18,
    gap: 10,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  }
});
