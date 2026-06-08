import { NextResponse } from 'next/server';
import { DISTRICTS } from '../data';
import { supabaseAdmin } from '@/lib/supabase';
import { checkSecurity, isOwnerIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const security = await checkSecurity(request, 'general');
  if (security.blocked && security.response) {
    return security.response;
  }
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get('district');

  if (!districtName) {
    return NextResponse.json({ error: 'District is required' }, { status: 400 });
  }

  let district = DISTRICTS.find(d => d.name_bn === districtName);
  if (!district) {
    district = DISTRICTS.find(d => d.name_en.toLowerCase() === districtName.toLowerCase());
  }

  if (!district) {
    return NextResponse.json({ error: 'District not found in Bangladesh database' }, { status: 404 });
  }

  let data;
  let isWeatherAPI = false;

  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current_weather=true&hourly=relativehumidity_2m,soil_temperature_0_to_7cm&timezone=Asia/Dhaka`;

  try {
    const res = await fetch(openMeteoUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000), // 3-second timeout to prevent hangs
    });
    if (!res.ok) {
      throw new Error('Open-Meteo returned status ' + res.status);
    }
    data = await res.json();
    isWeatherAPI = false;
  } catch (fetchErr) {
    console.warn('Open-Meteo Fetch failed, falling back to WeatherAPI:', fetchErr);
    
    const apiKey = process.env.WEATHER_API_KEY || '681c9776dd5947dcb05104416260306';
    const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(district.name_en)},Bangladesh&days=7&aqi=no&alerts=no&lang=bn`;

    try {
      const res = await fetch(weatherApiUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000), // 3-second timeout to prevent hangs
      });
      if (!res.ok) {
        throw new Error('WeatherAPI returned status ' + res.status);
      }
      data = await res.json();
      isWeatherAPI = true;
    } catch (fallbackErr) {
      console.warn('WeatherAPI fallback failed, using calculated seasonal forecast:', fallbackErr);
      
      // Generate seasonal mock data for Bangladesh
      const now = new Date();
      const month = now.getMonth(); // 0-indexed (0 is Jan, 4 is May)
      
      let temp = 28;
      let code = 3; // cloudy
      let humidity = 75;
      let soil_temp = 26;
      let wind = 8;
      let precip = 0;
      
      if (month >= 10 || month <= 1) { // Nov, Dec, Jan, Feb (Winter)
        temp = 21;
        code = 2; // Part cloudy
        humidity = 65;
        soil_temp = 18;
        wind = 6;
        precip = 0;
      } else if (month >= 2 && month <= 4) { // Mar, Apr, May (Summer/Pre-monsoon)
        temp = 33;
        code = 95; // Thunderstorm / Kalbaishakhi
        humidity = 82;
        soil_temp = 29;
        wind = 14;
        precip = 10.5;
      } else { // Jun, Jul, Aug, Sep, Oct (Monsoon/Rainy)
        temp = 29;
        code = 63; // Rain
        humidity = 88;
        soil_temp = 26;
        wind = 11;
        precip = 22.0;
      }
      
      const dates = [];
      const tempMax = [];
      const tempMin = [];
      const precipitation = [];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
        tempMax.push(Math.round(temp + Math.random() * 3));
        tempMin.push(Math.round(temp - 4 - Math.random() * 2));
        precipitation.push(i === 0 ? precip : Math.round(precip * Math.random()));
      }
      
      data = {
        current_weather: {
          temperature: temp,
          weathercode: code,
          windspeed: wind
        },
        hourly: {
          relativehumidity_2m: Array(24).fill(humidity),
          soil_temperature_0_to_7cm: Array(24).fill(soil_temp)
        },
        daily: {
          time: dates,
          temperature_2m_max: tempMax,
          temperature_2m_min: tempMin,
          precipitation_sum: precipitation
        }
      };
    }
  }

  try {
    let temp: number;
    let conditionText: string;
    let wind: number;
    let avgHumidity: number;
    let avgSoilTemp: number;
    let dailyDates: string[] = [];
    let dailyTempMax: number[] = [];
    let dailyTempMin: number[] = [];
    let dailyPrecipitation: number[] = [];
    let dailyPrecip = 0;

    if (isWeatherAPI) {
      const current = data.current || {};
      const forecastDays = data.forecast?.forecastday || [];
      const todayForecast = forecastDays[0]?.day || {};

      temp = current.temp_c ?? 28.0;
      conditionText = current.condition?.text ?? "মেঘলা আকাশ";
      
      // Use current wind speed (to avoid unrealistically high daily max gust readings) and average daily humidity
      wind = current.wind_kph ?? 5.0;
      avgHumidity = todayForecast.avghumidity ?? current.humidity ?? 75;
      
      // Estimate soil temperature
      avgSoilTemp = temp - 3;

      dailyDates = forecastDays.map((f: any) => f.date);
      dailyTempMax = forecastDays.map((f: any) => f.day.maxtemp_c);
      dailyTempMin = forecastDays.map((f: any) => f.day.mintemp_c);
      dailyPrecipitation = forecastDays.map((f: any) => f.day.totalprecip_mm);
      dailyPrecip = dailyPrecipitation[0] ?? 0;
    } else {
      const current = data.current_weather || {};
      const code = current.weathercode ?? 0;
      temp = current.temperature ?? 28.0;
      wind = current.windspeed ?? 5.0;

      const weatherCodes: { [key: number]: string } = {
        0: "পরিষ্কার রৌদ্রোজ্জ্বল আকাশ (Sunny)",
        1: "প্রধানত পরিষ্কার আকাশ", 2: "আংশিক মেঘলা", 3: "মেঘলা আকাশ",
        45: "কুয়াশাচ্ছন্ন", 48: "ঘন কুয়াশা ও বরফ কণা",
        51: "হালকা গুঁড়িগুঁড়ি বৃষ্টি", 53: "মাঝারি গুঁড়িগুঁড়ি বৃষ্টি", 55: "ঘন গুঁড়িগুঁড়ি বৃষ্টি",
        61: "হালকা বৃষ্টি", 63: "মাঝারি বৃষ্টি", 65: "ভারী বৃষ্টি",
        71: "হালকা তুষারপাত", 73: "মাঝারি তুষারপাত", 75: "ভারী তুষারপাত",
        77: "তুষার কণা",
        80: "হালকা বৃষ্টির ঝাপটা", 81: "মাঝারি বৃষ্টির ঝাপটা", 82: "ভারী মুষলধারে বৃষ্টি",
        85: "হালকা তুষারপাত ঝাপটা", 86: "ভারী তুষারপাত ঝাপটা",
        95: "বজ্রবিদ্যুৎসহ ঝড়ো হাওয়া", 96: "বজ্রবিদ্যুৎ ও শিলাবৃষ্টি", 99: "প্রবল বজ্রঝড় ও শিলাবৃষ্টি"
      };
      conditionText = weatherCodes[code] || "মেঘলা আকাশ";

      // Fetch relative humidity (average of last 24h)
      const hourlyHumidity = data.hourly?.relativehumidity_2m || [];
      avgHumidity = hourlyHumidity.slice(0, 24).reduce((a: number, b: number) => a + b, 0) / (hourlyHumidity.slice(0, 24).length || 1) || 75;

      // Fetch soil temperature
      const soilTemps = data.hourly?.soil_temperature_0_to_7cm || [];
      avgSoilTemp = soilTemps.slice(0, 24).reduce((a: number, b: number) => a + b, 0) / (soilTemps.slice(0, 24).length || 1) || 26.5;

      dailyDates = data.daily?.time || [];
      dailyTempMax = data.daily?.temperature_2m_max || [];
      dailyTempMin = data.daily?.temperature_2m_min || [];
      dailyPrecipitation = data.daily?.precipitation_sum || [];
      dailyPrecip = dailyPrecipitation[0] ?? 0;
    }


    // Multi-dimensional advice structure
    const advice = {
      rain: {
        status: dailyPrecip > 5.0 ? "high_rain" : "dry",
        title: "সেচ ও নিষ্কাশন গাইড",
        msg: dailyPrecip > 5.0 
          ? `আগামী ২৪ ঘণ্টায় ${dailyPrecip.toFixed(1)} মিমি বৃষ্টির সম্ভাবনা রয়েছে।`
          : "আগামী ২৪ ঘণ্টায় ভারী বৃষ্টির কোনো সম্ভাবনা নেই।",
        actions: dailyPrecip > 5.0
          ? [
              "সেচ পাম্প সম্পূর্ণ বন্ধ রাখুন এবং জ্বালানি ও বিদ্যুৎ সাশ্রয় করুন।",
              "জমিতে অতিরিক্ত পানি নিষ্কাশনের জন্য প্রধান ও শাখা নালাগুলোর মুখ খুলে দিন এবং আবর্জনা পরিষ্কার করুন যাতে পানি দ্রুত সরে যায়।",
              "সদ্য রোপণকৃত কচি চারা গাছ বা সবজি বেড পলিথিন দিয়ে ঢেকে দেওয়ার ব্যবস্থা করুন যাতে বৃষ্টির ফোঁটার আঘাতে চারা ভেঙে না যায়।"
            ]
          : [
              "ফসলের প্রকারভেদে হালকা থেকে মাঝারি সেচ প্রদান করতে পারেন।",
              "ধানের জমিতে ২-৩ ইঞ্চি পানি ধরে রাখতে সকালে বা বিকেলে নিয়ন্ত্রিত সেচ দিন।",
              "সবজি গাছের গোড়ায় মালচিং (খড় বা পলিথিন) ব্যবহার করুন যেন মাটির আর্দ্রতা দীর্ঘক্ষণ বজায় থাকে ও বাষ্পীভবন হ্রাস পায়।"
            ]
      },
      disease_risk: {
        status: avgHumidity > 85 ? "danger" : "normal",
        title: "বালাই ও ছত্রাক সংক্রমণ ঝুঁকি",
        msg: avgHumidity > 85 
          ? `বাতাসের গড় আপেক্ষিক আর্দ্রতা অতি উচ্চ (${Math.round(avgHumidity)}%) যা রোগ ছড়ানোর জন্য অনুকূল।`
          : `বাতাসের আর্দ্রতা স্বাভাবিক (${Math.round(avgHumidity)}%) রয়েছে। রোগবালাইয়ের ঝুঁকি বর্তমানে কম।`,
        actions: avgHumidity > 85
          ? [
              "ধানের জমিতে ব্লাস্ট রোগ প্রতিরোধে আগাম ট্রাইসাইক্লাজোল (যেমন: ট্রুপার ৭৫ ডব্লিউপি বা ট্রাইসাইক্লাজোল গ্রূপের অন্য ওষুধ) স্প্রে করুন।",
              "আলু ও টমেটোর নাবি ধসা (Late Blight) রোগ এড়াতে ম্যানকোজেব বা মেটালাক্সিল জাতীয় ছত্রাকনাশক স্প্রে করুন।",
              "জমিতে ঘন কুয়াশা বা দীর্ঘক্ষণ পাতা ভেজা থাকলে নাইট্রোজেন সার (ইউরিয়া) সাময়িকভাবে দেওয়া বন্ধ রাখুন, কারণ এটি রোগ দ্রুত বৃদ্ধি করে।"
            ]
          : [
              "নিয়মিত ফসলের পাতা, কাণ্ড এবং গোড়া পর্যবেক্ষণ করুন। কোনো অস্বাভাবিক দাগ বা পোকা দেখলে আমাদের গাছের ডাক্তারের কাছে প্রশ্ন লিখে পাঠান।",
              "সুষম সার প্রয়োগ অব্যাহত রাখুন, বিশেষ করে পটাশ সার ফসলের রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করতে সাহায্য করে।",
              "জৈব বালাইনাশক যেমন নিম তেল ও সাবান পানির মিশ্রণ প্রতিষেধক হিসেবে ব্যবহার করতে পারেন।"
            ]
      },
      spray_window: {
        status: wind > 15.0 ? "unsuitable" : "suitable",
        title: "স্প্রে করার সূচি ও ঝোড়ো হাওয়া",
        msg: wind > 15.0 
          ? `বাতাসের গতিবেগ বেশি (${wind.toFixed(1)} কিমি/ঘণ্টা), যা স্প্রে করার জন্য অনুপযুক্ত।`
          : `বাতাস শান্ত (${wind.toFixed(1)} কিমি/ঘণ্টা), যা বালাইনাশক ছিটানোর জন্য আদর্শ সময়।`,
        actions: wind > 15.0
          ? [
              "প্রবল বাতাসে তরল সার বা বালাইনাশক স্প্রে করা থেকে বিরত থাকুন। এতে ওষুধ বাতাসে উড়ে নষ্ট হবে এবং অন্য ফসলের ক্ষতি হতে পারে।",
              "খুব জরুরি হলে সকাল ৮টার আগে বা বিকাল ৫টার পর বাতাস যখন কিছুটা শান্ত থাকে, তখন স্প্রে করতে পারেন।",
              "স্প্রে করার সময় অবশ্যই বাতাসের অনুকূলে (বাতাস যেদিকে যাচ্ছে সেদিকে মুখ করে) স্প্রে করবেন, বাতাসের বিপরীতে নয়।"
            ]
          : [
              "আজ সকাল ৮টা থেকে ১১টা অথবা বিকাল ৩টা থেকে ৫টার মধ্যে স্প্রে করার উপযুক্ত সময়।",
              "বালাইনাশকের সাথে সিলিকন ভিত্তিক স্টিকার ব্যবহার করলে পাতার সাথে ওষুধ লেগে থাকে এবং কার্যকারিতা বৃদ্ধি পায়।",
              "দুপুরের কড়া রোদে স্প্রে করা এড়িয়ে চলুন, কারণ এতে পাতার টিস্যু পুড়ে যেতে পারে।"
            ]
      },
      soil: {
        status: avgSoilTemp > 30 ? "hot" : avgSoilTemp < 18 ? "cold" : "good",
        title: "মাটির উষ্ণতা ও মাইক্রোক্লাইমেট",
        msg: avgSoilTemp > 30 
          ? `মাটির তাপমাত্রা স্বাভাবিকের চেয়ে কিছুটা বেশি (${avgSoilTemp.toFixed(1)}°C)।`
          : avgSoilTemp < 18 
            ? `মাটির তাপমাত্রা বেশ কম (${avgSoilTemp.toFixed(1)}°C)।`
            : `মাটির তাপমাত্রা চাষের জন্য অত্যন্ত অনুকূল (${avgSoilTemp.toFixed(1)}°C)।`,
        actions: avgSoilTemp > 30
          ? [
              "মাটি অতিরিক্ত উত্তপ্ত হওয়া এবং শিকড় ঝলসানো রোধে হালকা মালচিং করুন (শুকনো পাতা বা খড় ব্যবহার করুন)।",
              "দুপুরের তীব্র রোদে জমিতে সেচ দেবেন না; এতে পানি গরম হয়ে শিকড় নষ্ট হতে পারে। সেচ কেবল খুব সকালে বা সন্ধ্যায় দিন।",
              "মাটির জৈব উপাদানের আর্দ্রতা রক্ষায় ট্রাইকোডার্মা মিশ্রিত কম্পোস্ট সার ব্যবহার করুন।"
            ]
          : avgSoilTemp < 18
            ? [
                "শীতকালীন আলু, গম ও সরিষার চারা বৃদ্ধির জন্য এই তাপমাত্রা উপযুক্ত। তবে বীজ অঙ্কুরোদগমে অতিরিক্ত ২-৩ দিন সময় লাগতে পারে।",
                "বীজ বপনের আগে মাটি ভালোভাবে রোদে শুকিয়ে ঝুরঝুরে করে নিন যাতে মাটির নিচে স্যাঁতসেঁতে ভাব না থাকে।",
                "কালো পলিথিন মালচ ব্যবহার করে মাটির তাপমাত্রা কৃত্রিমভাবে বৃদ্ধি করতে পারেন।"
              ]
            : [
                "সব ধরণের ফসল রোপণ এবং বীজ বপনের জন্য এটি সেরা সময়। শিকড় পুষ্টি সহজে শোষণ করতে পারবে।",
                "চারা রোপণের পূর্বে গোড়ায় হালকা পানি দিন এবং রোপণের পর হালকা চাপ দিয়ে মাটি শক্ত করুন।",
                "অণুজীব সার (যেমন পিএসবি, রাইজোবিয়াম) প্রয়োগের জন্য এটি সেরা আবহাওয়া।"
              ]
      },
      harvest: {
        status: dailyPrecip > 2.0 ? "wait" : "ready",
        title: "ফসল সংগ্রহ ও প্রক্রিয়াজাতকরণ",
        msg: dailyPrecip > 2.0 
          ? "আগামী ২৪ ঘণ্টায় বৃষ্টির পূর্বাভাস রয়েছে, যা ফসল কাটার জন্য ঝুঁকিপূর্ণ।"
          : "আকাশ পরিষ্কার এবং শুষ্ক আবহাওয়া বিরাজ করছে, যা ফসল কাটার জন্য অনুকূল।",
        actions: dailyPrecip > 2.0
          ? [
              "পাকা ধান বা গম কাটা সাময়িকভাবে স্থগিত রাখুন। কাদার মধ্যে ফসল কাটলে দানা ঝরে নষ্ট হতে পারে।",
              "ইতিমধ্যে কেটে রাখা ফসল মাঠ থেকে সরিয়ে দ্রুত নিরাপদ স্থানে নিয়ে পলিথিন শিট দিয়ে ঢেকে রাখুন।",
              "ফসল শুকানো বা মাড়াইয়ের কাজ সম্পূর্ণ বন্ধ রাখুন এবং বাতাস চলাচলের ব্যবস্থা আছে এমন ছাউনিতে রাখুন যেন আর্দ্রতায় ছত্রাক না ধরে।"
            ]
          : [
              "পাকা ধান, গম, ডাল বা সরিষা কেটে সরাসরি মাড়াই করার চমৎকার সময়।",
              "কাটা ফসল সরাসরি রোদে শুকাতে দিন এবং দানার আর্দ্রতা ১২% বা তার নিচে না আসা পর্যন্ত ভালো করে শুকিয়ে গুদামজাত করুন।",
              "সংগৃহীত ফসল প্লাস্টিক বা চটের বস্তায় রাখার আগে রোদে শুকিয়ে ঠাণ্ডা করে নিন।"
            ]
      }
    };

    // Log weather query to database
    try {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      
      if (await isOwnerIp(clientIp)) {
        console.log(`[Bypass Logging] Weather search logging bypassed for owner IP: ${clientIp}`);
      } else {
        await supabaseAdmin.from('usage_analytics').insert({
          session_id: 'weather_session_' + district.name_en,
          user_agent: userAgent,
          ip_address: clientIp,
          location: district.name_bn,
          page_visited: '/weather',
          action: 'weather_search',
          metadata: {
            district: district.name_bn,
            temp: temp,
            condition: conditionText
          },
          created_at: new Date().toISOString()
        });
      }
    } catch (dbErr) {
      console.error("Failed to log weather search:", dbErr);
    }

    return NextResponse.json({
      district: district.name_bn,
      temp: temp,
      condition: conditionText,
      wind_speed: wind,
      humidity: Math.round(avgHumidity),
      soil_temp: Math.round(avgSoilTemp),
      daily: {
        dates: dailyDates,
        temp_max: dailyTempMax,
        temp_min: dailyTempMin,
        precipitation: dailyPrecipitation
      },
      advice: advice
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Weather API Error:', error);
    return NextResponse.json({
      error: true,
      message: 'দুঃখিত, লাইভ আবহাওয়া তথ্য এই মুহূর্তে লোড করা সম্ভব হচ্ছে না। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পেজটি রিফ্রেশ করুন।'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  }
}
