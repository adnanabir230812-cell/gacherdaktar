// 64 Districts Translation Dictionary (handles common spelling variations)
const DISTRICT_MAP: Record<string, string> = {
  // Dhaka Division
  'dhaka': 'ঢাকা',
  'gazipur': 'গাজীপুর',
  'narayanganj': 'নারায়ণগঞ্জ',
  'narsingdi': 'নরসিংদী',
  'tangail': 'টাঙ্গাইল',
  'manikganj': 'মানিকগঞ্জ',
  'munshiganj': 'মুন্সিগঞ্জ',
  'faridpur': 'ফরিদপুর',
  'gopalganj': 'গোপালগঞ্জ',
  'madaripur': 'মাদারীপুর',
  'shariatpur': 'শরীয়তপুর',
  'rajbari': 'রাজবাড়ী',

  // Rajshahi Division
  'rajshahi': 'রাজশাহী',
  'bogra': 'বগুড়া',
  'bogura': 'বগুড়া',
  'pabna': 'পাবনা',
  'natore': 'নাটোর',
  'naogaon': 'নওগাঁ',
  'joypurhat': 'জয়পুরহাট',
  'sirajganj': 'সিরাজগঞ্জ',
  'chapainawabganj': 'চাঁপাইনবাবগঞ্জ',
  'nawabganj': 'চাঁপাইনবাবগঞ্জ',

  // Khulna Division
  'khulna': 'খুলনা',
  'jessore': 'যশোর',
  'jashore': 'যশোর',
  'jhenaidah': 'ঝিনাইদহ',
  'satkhira': 'সাতক্ষীরা',
  'bagerhat': 'বাগেরহাট',
  'kushtia': 'কুষ্টিয়া',
  'magura': 'মাগুরা',
  'narail': 'নড়াইল',
  'chuadanga': 'চুয়াডাঙ্গা',
  'meherpur': 'মেহেরপুর',

  // Mymensingh Division
  'mymensingh': 'ময়মনসিংহ',
  'sherpur': 'শেরপুর',
  'netrokona': 'নেত্রকোনা',
  'jamalpur': 'জামালপুর',

  // Sylhet Division
  'sylhet': 'সিলেট',
  'sunamganj': 'সুনামগঞ্জ',
  'habiganj': 'হবিগঞ্জ',
  'moulvibazar': 'মৌলভীবাজার',
  'maulvibazar': 'মৌলভীবাজার',

  // Chittagong Division
  'chittagong': 'চট্টগ্রাম',
  'chattogram': 'চট্টগ্রাম',
  'comilla': 'কুমিল্লা',
  'cumilla': 'কুমিল্লা',
  'noakhali': 'নোয়াখালী',
  'feni': 'ফেনী',
  'coxs bazar': 'কক্সবাজার',
  "cox's bazar": 'কক্সবাজার',
  'brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
  'chandpur': 'চাঁদপুর',
  'lakshmipur': 'লক্ষ্মীপুর',
  'rangamati': 'রাঙ্গামাটি',
  'bandarban': 'বান্দরবান',
  'khagrachhari': 'খাগড়াছড়ি',

  // Rangpur Division
  'rangpur': 'রংপুর',
  'dinajpur': 'দিনাজপুর',
  'kurigram': 'কুড়িগ্রাম',
  'gaibandha': 'গাইবান্ধা',
  'lalmonirhat': 'লালমনিরহাট',
  'nilphamari': 'নীলফামারী',
  'thakurgaon': 'ঠাকুরগাঁও',
  'panchagarh': 'পঞ্চগড়',

  // Barisal Division
  'barisal': 'বরিশাল',
  'barishal': 'বরিশাল',
  'patuakhali': 'পটুয়াখালী',
  'bhola': 'ভোলা',
  'pirojpur': 'পিরোজপুর',
  'barguna': 'বরগুনা',
  'jhalokati': 'ঝালকাঠি',
  'jhalakati': 'ঝালকাঠি'
};

/**
 * Attempts to automatically detect the user's Bangladeshi district via client IP Geolocation APIs.
 * Cascades through multiple services for high reliability.
 * 
 * @param defaultFallback The default district to return if detection fails (defaults to "ঢাকা").
 */
export async function detectUserDistrict(defaultFallback: string = 'ঢাকা'): Promise<string> {
  // Check if we are running in browser context
  if (typeof window === 'undefined') {
    return defaultFallback;
  }

  // Check cache first
  try {
    const cached = localStorage.getItem('detected_district');
    if (cached && Object.values(DISTRICT_MAP).includes(cached)) {
      console.log('Retrieving cached district:', cached);
      return cached;
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  // 1st Service: ip-api.com (extremely fast, CORS friendly)
  try {
    const res = await fetch('https://ip-api.com/json/?fields=status,city,regionName');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        const city = String(data.city || '').toLowerCase().trim();
        const region = String(data.regionName || '').toLowerCase().trim();
        
        let detected = '';
        if (DISTRICT_MAP[city]) detected = DISTRICT_MAP[city];
        else if (DISTRICT_MAP[region]) detected = DISTRICT_MAP[region];
        else {
          // Check fuzzy match
          for (const [key, value] of Object.entries(DISTRICT_MAP)) {
            if (city.includes(key) || key.includes(city) || region.includes(key)) {
              detected = value;
              break;
            }
          }
        }

        if (detected) {
          try {
            localStorage.setItem('detected_district', detected);
          } catch (e) {}
          return detected;
        }
      }
    }
  } catch (err) {
    console.warn('ip-api detection failed, attempting fallback...', err);
  }

  // 2nd Service: ipapi.co (fallback service)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const city = String(data.city || '').toLowerCase().trim();
      const region = String(data.region || '').toLowerCase().trim();
      
      let detected = '';
      if (DISTRICT_MAP[city]) detected = DISTRICT_MAP[city];
      else if (DISTRICT_MAP[region]) detected = DISTRICT_MAP[region];
      else {
        // Check fuzzy match
        for (const [key, value] of Object.entries(DISTRICT_MAP)) {
          if (city.includes(key) || key.includes(city) || region.includes(key)) {
            detected = value;
            break;
          }
        }
      }

      if (detected) {
        try {
          localStorage.setItem('detected_district', detected);
        } catch (e) {}
        return detected;
      }
    }
  } catch (err) {
    console.warn('ipapi.co fallback failed:', err);
  }

  return defaultFallback;
}
