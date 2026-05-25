import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white p-6 md:p-12 max-w-4xl mx-auto rounded-2xl shadow-sm border border-gray-100 my-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">Privacy Policy (গোপনীয়তা নীতি)</h1>
      <p className="text-gray-500 text-xs mb-8 text-center">সর্বশেষ আপডেট: ২৬ মে, ২০২৬</p>
      
      <section className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">১. ভূমিকা (Introduction)</h2>
          <p>
            "গাছের ডাক্তার" (Trees Doctor) মোবাইল অ্যাপ্লিকেশনে আপনাকে স্বাগত। আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতির মাধ্যমে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি তা ব্যাখ্যা করা হলো।
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">২. তথ্য সংগ্রহ (Information Collection)</h2>
          <p>
            আমাদের অ্যাপ্লিকেশনের মূল ফিচারসমূহ (যেমন: ফসলের রোগ নির্ণয় স্ক্যানার, চ্যাটবট এবং আবহাওয়ার তথ্য) ব্যবহারের জন্য আমরা কোনো ধরনের ব্যক্তিগত তথ্য (যেমন: নাম, ইমেল বা মোবাইল নম্বর) সংগ্রহ করি না।
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>লোকেশন তথ্য:</strong> আপনার জেলা ভিত্তিক সঠিক আবহাওয়ার তথ্য দেখানোর জন্য আমরা আপনার আইপি (IP) ঠিকানা ব্যবহার করি। আমরা কোনো জিপিএস (GPS) ডাটা সংগ্রহ বা ট্র্যাক করি না।</li>
            <li><strong>ক্যামেরা পারমিশন:</strong> পাতার রোগ সনাক্তকরণের জন্য শুধুমাত্র ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন হয়। আপনার তোলা ছবি আমাদের সার্ভারে স্থায়ীভাবে সংরক্ষিত হয় না।</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">৩. তথ্যের ব্যবহার (Use of Information)</h2>
          <p>
            সংগৃহীত সাময়িক তথ্যগুলো শুধুমাত্র অ্যাপ্লিকেশনের কার্যকারিতা উন্নয়ন এবং আপনাকে সঠিক সেবা (যেমন: আবহাওয়া এবং ফসলের দাম) প্রদানের জন্য ব্যবহৃত হয়।
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">৪. তথ্য ভাগাভাগি (Data Sharing)</h2>
          <p>
            আমরা কোনো তৃতীয় পক্ষের সাথে আপনার কোনো তথ্য বিক্রি, বিনিময় বা হস্তান্তর করি না।
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-700 mb-2">৫. যোগাযোগ (Contact Us)</h2>
          <p>
            গোপনীয়তা নীতি সংক্রান্ত কোনো প্রশ্ন বা জিজ্ঞাসার জন্য যোগাযোগ করুন:
            <br />
            ইমেল: <a href="mailto:info@gacherdoctor.site" className="text-green-600 underline font-semibold">info@gacherdoctor.site</a>
          </p>
        </div>
      </section>
    </div>
  );
}
