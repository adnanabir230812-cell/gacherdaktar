'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DiagnosticRule {
  crop_id: string;
  part: 'leaf' | 'stem' | 'root' | 'fruit';
  symptom_bn: string;
  disease_bn: string;
  cause_bn: string;
  treatment_bn: string;
  dosage_bn: string;
}

const CROPS_LIST = [
  { id: 'rice', name: 'ধান (Rice)' },
  { id: 'wheat', name: 'গম (Wheat)' },
  { id: 'potato', name: 'আলু (Potato)' },
  { id: 'tomato', name: 'টমেটো (Tomato)' },
  { id: 'eggplant', name: 'বেগুন (Eggplant)' },
  { id: 'chilli', name: 'মরিচ (Chilli)' },
  { id: 'onion', name: 'পেঁয়াজ (Onion)' },
  { id: 'garlic', name: 'রসুন (Garlic)' },
  { id: 'mustard', name: 'সরিষা (Mustard)' },
  { id: 'maize', name: 'ভুট্টা (Maize)' },
  { id: 'jute', name: 'পাট (Jute)' },
  { id: 'mango', name: 'আম (Mango)' },
  { id: 'banana', name: 'কলা (Banana)' },
  { id: 'citrus', name: 'লেবু (Citrus)' },
  { id: 'sweet_gourd', name: 'মিষ্টি কুমড়া (Sweet Gourd)' },
  { id: 'bottle_gourd', name: 'লাউ (Bottle Gourd)' },
  { id: 'cucumber', name: 'শসা (Cucumber)' },
  { id: 'papaya', name: 'পেঁপে (Papaya)' },
  { id: 'lentil', name: 'মসুর ডাল (Lentil)' },
  { id: 'sesame', name: 'তিল (Sesame)' },
];

const DIAGNOSTIC_DATABASE: DiagnosticRule[] = [
  // 1. Rice (ধান)
  {
    crop_id: 'rice',
    part: 'leaf',
    symptom_bn: "পাতায় চোখাকৃতি বা উপবৃত্তাকার বাদামী দাগ এবং কেন্দ্র ধূসর বর্ণ ধারণ করা",
    disease_bn: "ধানের ব্লাস্ট রোগ (Blast Disease)",
    cause_bn: "পাইরিকুলারিয়া অরাইজি নামক ছত্রাক",
    treatment_bn: "ক্ষেতের পানি ধরে রাখতে হবে। নাইট্রোজেন সারের অতিরিক্ত প্রয়োগ বন্ধ করতে হবে। রোগ দেখা দিলে ট্রাইসাইক্লাজোল বা ডাইфেনোকোনাজল গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "বিঘাপ্রতি ৮০ গ্রাম অথবা প্রতি লিটার পানিতে ০.৮ গ্রাম।"
  },
  {
    crop_id: 'rice',
    part: 'leaf',
    symptom_bn: "পাতার ডগা বা কিনারা থেকে ঢেউখেলানো হলুদাভ বাদামী দাগ শুরু হয়ে নিচের দিকে নেমে আসা",
    disease_bn: "ব্যাকটেরিয়াজনিত পাতা ধসা রোগ (Bacterial Leaf Blight)",
    cause_bn: "জ্যান্থোমোনাস অরাইজি ব্যাকটেরিয়া",
    treatment_bn: "ঝড়-বৃষ্টির পর জমিতে কোনো নাইট্রোজেন সার দেওয়া যাবে না। বিঘাপ্রতি অতিরিক্ত ৫ কেজি পটাশ প্রয়োগ করুন। কপসিন বা থিওভিট স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম থিওভিট মিশিয়ে স্প্রে করুন।"
  },
  {
    crop_id: 'rice',
    part: 'stem',
    symptom_bn: "পানির স্তরের কাছে ধানের খাপে ডিম্বাকৃতি বা ডোরাকাটা ধূসর দাগ এবং কান্ড পচে যাওয়া",
    disease_bn: "ধানের খাপ পচা রোগ (Sheath Rot)",
    cause_bn: "ছত্রাকজনিত সংক্রমণ",
    treatment_bn: "গাছ পাতলা করে রোপণ করতে হবে। আক্রান্ত কান্ড সরিয়ে পুড়িয়ে ফেলুন। কার্বেন্ডাজিম বা প্রোপিকোনাজল গ্রুপের ওষুধ স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ১ মিলি লিকুইড কার্বেন্ডাজিম মিশিয়ে স্প্রে করতে হবে।"
  },
  // 2. Wheat (গম)
  {
    crop_id: 'wheat',
    part: 'leaf',
    symptom_bn: "পাতার ওপর মরিচার মতো হলুদাভ বা তামাটে রঙের ছোট ছোট গোল দাগ বা ফোসকা পড়া",
    disease_bn: "গমের মরচে রোগ (Rust Disease)",
    cause_bn: "পাকসিনিয়া রিঅ্যাকটিটা ছত্রাক",
    treatment_bn: "প্রতিরোধী জাতের গম চাষ করুন। প্রাথমিক অবস্থায় প্রোপিকোনাজল (যেমন টিল্ট ২৫০ ইসি) স্প্রে করুন। সুষম সার ব্যবহার করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ১ মিলি টিল্ট মিশিয়ে স্প্রে করুন।"
  },
  // 3. Potato (আলু)
  {
    crop_id: 'potato',
    part: 'leaf',
    symptom_bn: "পাতার ডগায় বা কিনারায় পানি-ভেজা দাগ যা কুয়াশাচ্ছন্ন আবহাওয়ায় দ্রুত কালো বর্ণ নিয়ে পুরো গাছ পচিয়ে দেয়",
    disease_bn: "আলুর নাবি ধসা রোগ (Late Blight)",
    cause_bn: "ফাইটোফথোরা ইনফেসট্যান্স ছত্রাক",
    treatment_bn: "কুয়াশাচ্ছন্ন আবহাওয়ায় আগাম প্রতিরোধক হিসেবে ম্যানকোজেব স্প্রে করুন। রোগ দেখা দিলে সিকিউর বা মেটালাক্সিল গ্রুপের ছত্রাকনাশক ৭ দিন পর পর স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২.৫ গ্রাম মেটালাক্সিল মিশিয়ে ৭ দিন পর পর স্প্রে করুন।"
  },
  {
    crop_id: 'potato',
    part: 'root',
    symptom_bn: "আলুর গায়ে কালো বা কালচে খসখসে ক্ষতের সৃষ্টি হওয়া এবং আলু কাটলে ভেতরে কালো দাগ দেখা যাওয়া",
    disease_bn: "আলুর সাধারণ স্কেব রোগ (Common Scab)",
    cause_bn: "স্ট্রেপ্টোমাইসিস ব্যাকটেরিয়া",
    treatment_bn: "ক্ষারীয় মাটিতে এটি বেশি হয়। আলু রোপণের সময় মাটিতে অতিরিক্ত চুন দেওয়া বন্ধ রাখুন। বীজ আলু শোধন করে রোপণ করুন।",
    dosage_bn: "বীজ আলু রোপণের পূর্বে ১% ফরমালিন সলিউশন দিয়ে ২০ মিনিট শোধন করুন।"
  },
  // 4. Tomato (টমেটো)
  {
    crop_id: 'tomato',
    part: 'leaf',
    symptom_bn: "নিচের পাতায় চক্রাকার বা গোল গোল গাঢ় বাদামী দাগ এবং কান্ডে কালো দাগ পড়া",
    disease_bn: "টমেটোর আগাম ধসা রোগ (Early Blight)",
    cause_bn: "অলটারনারিয়া সোলানি ছত্রাক",
    treatment_bn: "আক্রান্ত পাতা ও ডাল ছেঁটে পুড়িয়ে ফেলুন। মাটির গোড়ায় মালচিং পেপার ব্যবহার করুন। ম্যানকোজেব বা মেটালাক্সিল গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব পাউডার মিশিয়ে স্প্রে করতে হবে।"
  },
  {
    crop_id: 'tomato',
    part: 'fruit',
    symptom_bn: "টমেটো ফলের নিচের অংশে বা বোঁটার চারধারে কালো পানি-ভেজা স্পট পড়ে চামড়ার মতো শক্ত হওয়া",
    disease_bn: "ফলের গোড়া পচা রোগ (Blossom End Rot)",
    cause_bn: "ক্যালসিয়ামের অভাব এবং অনিয়মিত সেচ",
    treatment_bn: "নিয়মিত সেচ দিতে হবে এবং মাটিতে অতিরিক্ত নাইট্রোজেন সার দেওয়া বন্ধ করতে হবে। ক্যালসিয়াম সমৃদ্ধ জিপসাম সার মাটিতে মেশাতে হবে।",
    dosage_bn: "প্রতি লিটার পানিতে ৫ গ্রাম ক্যালসিয়াম ক্লোরাইড মিশিয়ে গাছে স্প্রে করুন।"
  },
  // 5. Eggplant (বেগুন)
  {
    crop_id: 'eggplant',
    part: 'fruit',
    symptom_bn: "বেগুনের কচি ডগা নুইয়ে পড়া এবং ফলের গায়ে ছোট ছোট ছিদ্র ও ভেতরে সাদা পোকা দেখা যাওয়া",
    disease_bn: "বেগুনের ডগা ও ফল ছিদ্রকারী পোকা (Shoot and Fruit Borer)",
    cause_bn: "লুসিলোডিস অরবোনালিস পোকা",
    treatment_bn: "আক্রান্ত ডগা ও ফল কেটে মাটি চাপা দিন। সেক্স ফেরোমন ফাঁদ ব্যবহার করুন। তীব্র আক্রমণে স্পিনোস্যাড বা ক্লোরপায়রিফস স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ০.৪ মিলি স্পিনোস্যাড মিশিয়ে স্প্রে করুন।"
  },
  {
    crop_id: 'eggplant',
    part: 'root',
    symptom_bn: "বেগুন গাছের পাতা হঠাৎ হলুদ হয়ে শুকিয়ে যাওয়া এবং গাছের কান্ড কাটলে ভেতর কালো দেখা যাওয়া",
    disease_bn: "বেগুনের ব্যাকটেরিয়াজনিত ঢলে পড়া রোগ (Bacterial Wilt)",
    cause_bn: "রালস্টোনিয়া সোলানেসিয়ারাম ব্যাকটেরিয়া",
    treatment_bn: "আক্রান্ত গাছ শিকড়সহ তুলে পুড়িয়ে ফেলুন। জমিতে চুন প্রয়োগ করুন। রোপণের পূর্বে স্ট্রেপ্টোসাইক্লিন দিয়ে চারা শোধন করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ০.৫ গ্রাম স্ট্রেপ্টোসাইক্লিন গুলে চারা ভিজিয়ে রাখুন।"
  },
  // 6. Chilli (মরিচ)
  {
    crop_id: 'chilli',
    part: 'fruit',
    symptom_bn: "মরিচ ফলের গায়ে গোল খসখসে দাগ ও ফল পচে কালো হয়ে যাওয়া",
    disease_bn: "মরিচের এনথ্রাকনোজ বা ফল পচা রোগ (Anthracnose)",
    cause_bn: "কোলেটোট্রিকাম ক্যাপসিকি নামক ছত্রাক",
    treatment_bn: "আক্রান্ত ফল দ্রুত তুলে ফেলুন। গাছে প্রোপিকোনাজল বা কার্বেন্ডাজিম গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ১ মিলি প্রোপিকোনাজল মিশিয়ে ১০ দিন অন্তর স্প্রে করুন।"
  },
  // 7. Onion (পেঁয়াজ)
  {
    crop_id: 'onion',
    part: 'leaf',
    symptom_bn: "পেঁয়াজের পাতায় বেগুনি বা তামাটে রঙের উপবৃত্তাকার বসে যাওয়া দাগ দেখা দেওয়া",
    disease_bn: "পেঁয়াজের পার্পল ব্লচ বা বেগুনি দাগ রোগ",
    cause_bn: "অলটারনারিয়া পোরি ছত্রাক",
    treatment_bn: "জমি শুষ্ক রাখুন এবং অতিরিক্ত সেচ বর্জন করুন। রোপণের আগে বীজ শোধন করুন। রোগ দেখা দিলে রোভরাল বা প্রোপিনেব স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম রোভরাল বা ডাইথেন এম-৪৫ স্প্রে করুন।"
  },
  // 8. Garlic (রসুন)
  {
    crop_id: 'garlic',
    part: 'leaf',
    symptom_bn: "রসুনের পাতার আগা হলুদ হয়ে শুকিয়ে যাওয়া এবং পাতায় সাদাটে দাগ পড়া",
    disease_bn: "রসুনের পাতা ঝলসানো রোগ (Leaf Blight)",
    cause_bn: "অলটারনারিয়া ও স্টেমফাইলিয়াম ছত্রাক",
    treatment_bn: "বীজ শোধন করে রোপণ করুন। রসুনের জমিতে সেচ ও সুষম সার প্রয়োগ নিশ্চিত করুন। প্রোপিকোনাজল বা কপার অক্সিক্লোরাইড স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব বা ১ মিলি প্রোপিকোনাজল স্প্রে করুন।"
  },
  // 9. Mustard (সরিষা)
  {
    crop_id: 'mustard',
    part: 'leaf',
    symptom_bn: "সরিষার পাতায় গোল গোল গাঢ় বাদামী বা কালো দাগ পড়া এবং পাতা মরে যাওয়া",
    disease_bn: "সরিষার অলটারনারিয়া পাতা ঝলসানো রোগ",
    cause_bn: "অলটারনারিয়া ব্রাসিকি ছত্রাক",
    treatment_bn: "সঠিক সময়ে রোপণ করুন। রোগ প্রতিরোধী জাতের সরিষা চাষ করুন। রোগের লক্ষণ দেখা দিলে রোভরাল বা ডাইথেন এম-৪৫ স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম রোভরাল মিশিয়ে ২-৩ বার স্প্রে করুন।"
  },
  // 10. Maize (ভুট্টা)
  {
    crop_id: 'maize',
    part: 'leaf',
    symptom_bn: "ভুট্টার পাতায় লম্বাটে ধূসর বা হালকা বাদামী দাগ এবং পাতা শুকিয়ে যাওয়া",
    disease_bn: "ভুট্টার পাতা ঝলসানো রোগ (Leaf Blight)",
    cause_bn: "হেলমিনথোস্পোরিয়াম টারসিকাম ছত্রাক",
    treatment_bn: "সুষম সার প্রয়োগ করুন। আক্রান্ত ফসলের অবশিষ্টাংশ পুড়িয়ে ফেলুন। ম্যানকোজেব বা টিল্ট স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব গুলে ১০-১২ দিন পর পর স্প্রে করুন।"
  },
  // 11. Jute (পাট)
  {
    crop_id: 'jute',
    part: 'stem',
    symptom_bn: "পাটের কান্ডে গাঢ় বাদামী বা কালো দাগ, কান্ড পচে আঁশ কালো হয়ে যাওয়া",
    disease_bn: "পাটের কান্ড পচা রোগ (Stem Rot)",
    cause_bn: "ম্যাক্রোফমিনা ফেসিওলিনা ছত্রাক",
    treatment_bn: "জল নিষ্কাশন ব্যবস্থা ভালো রাখুন। জমিতে পটাশ সার সুষম মাত্রায় ব্যবহার করুন। কার্বেন্ডাজিম জাতীয় ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম কার্বেন্ডাজিম মিশিয়ে গোড়ায় স্প্রে করুন।"
  },
  // 12. Mango (আম)
  {
    crop_id: 'mango',
    part: 'fruit',
    symptom_bn: "আমের গায়ে কালো ছোট ছোট বসে যাওয়া দাগ পড়া এবং আম পচে যাওয়া",
    disease_bn: "আমের এনথ্রাকনোজ রোগ (Anthracnose)",
    cause_bn: "কোলেটোট্রিকাম গ্লোইওস্পোরিঅয়েডস ছত্রাক",
    treatment_bn: "মুকুল আসার পূর্বে এবং ফল মটর দানার মতো হলে কপার অক্সিক্লোরাইড বা ডাইফেনোকোনাজল স্প্রে করুন। আক্রান্ত আম ও ডাল ভেঙে ফেলুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম কপার অক্সিক্লোরাইড মিশিয়ে স্প্রে করুন।"
  },
  {
    crop_id: 'mango',
    part: 'leaf',
    symptom_bn: "আমের পাতার ওপর সাদাটে পাউডারের মতো আবরণ পড়া এবং পাতার বিকৃতি ঘটা",
    disease_bn: "আমের পাউডারি মিলডিউ রোগ (Powdery Mildew)",
    cause_bn: "ওডিইয়াম ম্যানগিফেরি নামক ছত্রাক",
    treatment_bn: "মুকুল ফোটার সময় সালফার ছত্রাকনাশক স্প্রে করুন। আক্রান্ত কান্ড ও পাতা ছাঁটাই করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম থিওভিট স্প্রে করুন।"
  },
  // 13. Banana (কলা)
  {
    crop_id: 'banana',
    part: 'leaf',
    symptom_bn: "কলা পাতায় লম্বাটে তামাটে দাগ, দাগের চারধারে হলুদাভ আভা এবং পাতা পুড়ে যাওয়া",
    disease_bn: "কলার সিগাটোকা রোগ (Sigatoka Leaf Spot)",
    cause_bn: "মাইকোসফারেলা মিউজিকোলা ছত্রাক",
    treatment_bn: "আক্রান্ত পাতা কেটে পুড়িয়ে ফেলুন। বাগানে অতিরিক্ত জল জমতে দেবেন না। প্রোপিকোনাজল গ্রুপের ছত্রাকনাশক স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ১ মিলি প্রোপিকোনাজল স্প্রে করুন।"
  },
  // 14. Citrus (লেবু)
  {
    crop_id: 'citrus',
    part: 'fruit',
    symptom_bn: "লেবুর পাতা, কান্ড ও ফলের ওপর খসখসে তামাটে বা ধূসর রঙের গোল দাগ বা ক্ষত দেখা দেওয়া",
    disease_bn: "লেবুর ক্যাঙ্কার রোগ (Citrus Canker)",
    cause_bn: "জ্যান্থোমোনাস এক্সোনোপোডিস ব্যাকটেরিয়া",
    treatment_bn: "আক্রান্ত ডাল ও পাতা ছেঁটে পুড়িয়ে ফেলুন। এরপর বোর্দো মিক্সচার বা কপার অক্সিক্লোরাইড স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ৩ গ্রাম কপার অক্সিক্লোরাইড বা বোর্দো মিক্সচার স্প্রে করুন।"
  },
  // 15. Sweet Gourd (মিষ্টি কুমড়া)
  {
    crop_id: 'sweet_gourd',
    part: 'leaf',
    symptom_bn: "মিষ্টি কুমড়ার পাতার ওপর পাউডারের মতো সাদা সাদা আস্তরণ পড়ে পাতা শুকিয়ে যাওয়া",
    disease_bn: "কুমড়ার পাউডারি মিলডিউ রোগ (Powdery Mildew)",
    cause_bn: "ছত্রাকজনিত রোগ সংক্রমণ",
    treatment_bn: "আক্রান্ত লতা-পাতা ধ্বংস করুন। রোদের আলো ভালোভাবে লাগার ব্যবস্থা করুন। সালফার গ্রুপের ঔষধ স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম থিওভিট বা ০.৫ মিলি হেক্সাকোনাজল স্প্রে করুন।"
  },
  // 16. Bottle Gourd (লাউ)
  {
    crop_id: 'bottle_gourd',
    part: 'leaf',
    symptom_bn: "পাতার নিচের অংশে ধূসর বা বেগুনি রঙের ছাতার মতো দাগ এবং ওপরের পাতা হলুদ হয়ে যাওয়া",
    disease_bn: "লাউয়ের ডাউনি মিলডিউ রোগ (Downy Mildew)",
    cause_bn: "সিউডোপেরোনোস্পোরা কিউবেনসিস ছত্রাক",
    treatment_bn: "আর্দ্রতা নিয়ন্ত্রণে রাখুন। রোগ দেখা দেওয়ার সাথে সাথে ম্যানকোজেব + মেটালাক্সিল (যেমন রিডোমিল গোল্ড) স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম রিডোমিল গোল্ড মিশিয়ে স্প্রে করুন।"
  },
  // 17. Cucumber (শসা)
  {
    crop_id: 'cucumber',
    part: 'fruit',
    symptom_bn: "শসার গায়ে জলছাপের মতো দাগ এবং ফল নরম হয়ে পচে গন্ধ বের হওয়া",
    disease_bn: "শসার ফল পচা রোগ (Fruit Rot)",
    cause_bn: "পাইথিয়াম ছত্রাক সংক্রমণ",
    treatment_bn: "জল নিষ্কাশন নিশ্চিত করুন। ফল যেন ভেজা মাটিতে স্পর্শ না করে তার জন্য মাচায় চাষ করুন। মেটালাক্সিল গ্রুপের ঔষধ স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম মেটালাক্সিল গুলে ফলের চারধারে স্প্রে করুন।"
  },
  // 18. Papaya (পেঁপে)
  {
    crop_id: 'papaya',
    part: 'leaf',
    symptom_bn: "পেঁপে পাতায় গাঢ় সবুজ ও হলুদের মোজাইক নকশা এবং পাতাগুলো ছোট ও কুঁকড়ে যাওয়া",
    disease_bn: "পেঁপের রিং স্পট মোজাইক রোগ",
    cause_bn: "পেঁপে রিং স্পট ভাইরাস (বাহক এফিড পোকা)",
    treatment_bn: "আক্রান্ত গাছ উপড়ে মাটি চাপা দিন। এফিড পোকা দমনে ইমিডাক্লোপ্রিড স্প্রে করুন। প্রতিরোধী জাতের বীজ বপন করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ০.৫ মিলি ইমিডাক্লোপ্রিড স্প্রে করুন বাহক পোকা দমনে।"
  },
  // 19. Lentil (মসুর ডাল)
  {
    crop_id: 'lentil',
    part: 'leaf',
    symptom_bn: "মসুর গাছের পাতায় বাদামী বা কালচে দাগ পড়া যা ধীরে ধীরে পুরো গাছে ছড়িয়ে কান্ড শুকিয়ে দেয়",
    disease_bn: "মসুর ডালের স্টেমফাইলিয়াম ব্লাইট রোগ",
    cause_bn: "স্টেমফাইলিয়াম বোট্রিоসাম ছত্রাক",
    treatment_bn: "সুস্থ বীজ ব্যবহার করুন। রোগ দেখা দেওয়ার প্রাথমিক লক্ষণ পেলেই রোভরাল বা প্রোপিকোনাজল স্প্রে করতে হবে।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম রোভরাল বা ১ মিলি টিল্ট স্প্রে করুন।"
  },
  // 20. Sesame (তিল)
  {
    crop_id: 'sesame',
    part: 'root',
    symptom_bn: "তিল গাছের গোড়া পচে কালো হয়ে যাওয়া, গাছ নেতিয়ে পড়া ও মারা যাওয়া",
    disease_bn: "তিলের গোড়া ও কান্ড পচা রোগ",
    cause_bn: "ম্যাক্রোফমিনা ফেসিওলিনা ছত্রাক",
    treatment_bn: "তিল চাষের জমি তৈরি করার সময় সুষম সার ব্যবহার করুন। জলাবদ্ধতা বর্জন করুন। কার্বেন্ডাজিম বা প্রোপিনেব স্প্রে করুন।",
    dosage_bn: "প্রতি লিটার পানিতে ২ গ্রাম কার্বেন্ডাজিম গুলে গাছের গোড়ায় স্প্রে করুন।"
  }
];

export default function DiagnosticsPage() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>('rice');
  const [selectedPart, setSelectedPart] = useState<'leaf' | 'stem' | 'root' | 'fruit' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResult, setActiveResult] = useState<DiagnosticRule | null>(null);

  const filteredRules = DIAGNOSTIC_DATABASE.filter(rule => {
    const matchesCrop = rule.crop_id === selectedCrop;
    const matchesPart = selectedPart === 'all' || rule.part === selectedPart;
    const matchesSearch = rule.symptom_bn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rule.disease_bn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesPart && matchesSearch;
  });

  const partLabels = {
    leaf: 'পাতা',
    stem: 'কান্ড ও ডাল',
    root: 'গোড়া ও শিকড়',
    fruit: 'ফল বা শস্যদানা'
  };

  const currentCropName = CROPS_LIST.find(c => c.id === selectedCrop)?.name || '';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-green-primary/10 pb-6">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-green-primary/10 rounded-full transition-colors text-text-secondary cursor-pointer"
          title="ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            ফসলের রোগ নির্ণয় নির্দেশিকা
          </h1>
          <p className="text-text-secondary text-sm font-semibold">
            আপনার আক্রান্ত ফসলের স্থান ও লক্ষণ সিলেক্ট করে রোগ শনাক্ত করুন এবং DAE/BARI/BRRI নির্দেশিত বৈজ্ঞানিক ও জৈব প্রতিকার জেনে নিন।
          </p>
        </div>
      </div>

      {/* Select Crop Dropdown (Replaces old tabs for 20 crops) */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-soft-white p-4 rounded-2xl border border-green-primary/10 shadow-sm animate-fade-in">
        <label htmlFor="crop-select" className="text-sm font-extrabold text-text-primary shrink-0">
          ফসল নির্বাচন করুন:
        </label>
        <select
          id="crop-select"
          value={selectedCrop}
          onChange={(e) => {
            setSelectedCrop(e.target.value);
            setSelectedPart('all');
            setActiveResult(null);
          }}
          className="flex-1 bg-soft-white border border-green-primary/20 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary cursor-pointer"
        >
          {CROPS_LIST.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {crop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Part Filter */}
      <div className="flex flex-wrap gap-2 border-b border-green-primary/5 pb-4">
        <span className="text-xs font-bold text-text-secondary self-center mr-2">আক্রান্ত অংশ:</span>
        {(['all', 'leaf', 'stem', 'root', 'fruit'] as const).map(part => (
          <button
            key={part}
            onClick={() => {
              setSelectedPart(part);
              setActiveResult(null);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedPart === part
                ? 'bg-green-primary/15 border-green-primary text-green-primary shadow-sm'
                : 'bg-soft-white border-green-primary/10 text-text-secondary hover:bg-green-primary/5'
            }`}
          >
            {part === 'all' ? 'সম্পূর্ণ গাছ' : partLabels[part]}
          </button>
        ))}
      </div>

      {/* Symptoms Search and Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Symptoms List (Left 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="লক্ষণ বা রোগের নাম দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-primary/20 bg-soft-white focus:outline-none focus:ring-2 focus:ring-green-primary text-text-primary text-sm shadow-sm"
            />
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-text-secondary/60" />
          </div>

          <div className="space-y-3">
            {filteredRules.length > 0 ? (
              filteredRules.map((rule, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveResult(rule)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-start gap-4 ${
                    activeResult?.disease_bn === rule.disease_bn
                      ? 'bg-green-primary/5 border-green-primary shadow-md'
                      : 'bg-soft-white border-green-primary/10 hover:border-green-primary/20 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-green-primary/10 text-green-primary">
                      {partLabels[rule.part]}
                    </span>
                    <p className="text-sm font-bold text-text-primary leading-relaxed">
                      {rule.symptom_bn}
                    </p>
                  </div>
                  <HelpCircle className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-secondary font-medium">
                দুঃখিত, {currentCropName} এর জন্য কোনো ম্যাচিং লক্ষণ বা রোগ তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis & Solutions Output (Right 2 Columns) */}
        <div className="lg:col-span-2">
          {activeResult ? (
            <div className="glass-card p-6 space-y-6 border-2 border-green-primary/30 animate-fade-in">
              <div className="border-b border-green-primary/10 pb-4">
                <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                  সনাক্তকৃত রোগবালাই
                </span>
                <h3 className="text-xl font-black text-text-primary mt-3">
                  {activeResult.disease_bn}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  <strong>কারণ:</strong> {activeResult.cause_bn}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 text-sm text-text-primary bg-green-primary/5 p-4 rounded-xl border border-green-primary/10">
                  <ShieldCheck className="w-5 h-5 text-green-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-green-primary text-xs uppercase mb-1">অফিশিয়াল দমন ও প্রতিকার পদ্ধতি:</h4>
                    <p className="font-medium leading-relaxed">{activeResult.treatment_bn}</p>
                  </div>
                </div>

                <div className="flex gap-3 text-sm text-text-primary bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-700 text-xs uppercase mb-1">প্রস্তাবিত মাত্রা (Dosage):</h4>
                    <p className="font-extrabold text-text-primary leading-relaxed">{activeResult.dosage_bn}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-green-primary/20 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4 bg-soft-white/40">
              <HelpCircle className="w-12 h-12 text-green-primary/40" />
              <div>
                <h4 className="font-bold text-text-primary">রোগ নির্ণয়ের ফলাফল দেখতে</h4>
                <p className="text-xs text-text-secondary max-w-xs mt-1 font-semibold">
                  বাঁদিকের প্যানেল থেকে আপনার ফসলের যেকোনো একটি লক্ষণের ওপর ক্লিক করুন। সঠিক বৈজ্ঞানিক দমন গাইড এখানে ভেসে উঠবে।
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 💡 AI Doctor Call-To-Action (CTA) Banner */}
      <div className="bg-gradient-to-r from-green-primary/10 via-emerald-700/5 to-amber-500/10 border border-green-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-extrabold text-text-primary text-base">ফসলের কোনো নতুন বা অপরিচিত সমস্যা দেখা দিয়েছে?</h4>
          <p className="text-xs text-text-secondary font-bold">লক্ষণ লিখে বা গাছের বর্ণনা দিয়ে সরাসরি এআই ডাক্তারের সাথে চ্যাট করুন ও তাত্ক্ষণিক পরামর্শ পান।</p>
        </div>
        <button 
          onClick={() => {
            const cropName = CROPS_LIST.find(c => c.id === selectedCrop)?.name || '';
            router.push(`/chat?q=${encodeURIComponent(`${cropName} গাছের রোগবালাই নিয়ে সাহায্য করুন।`)}`);
          }}
          className="px-6 py-3 bg-green-primary hover:bg-green-soft text-soft-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer text-center"
        >
          গাছের ডাক্তারের পরামর্শ নিন →
        </button>
      </div>
    </div>
  );
}
