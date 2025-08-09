/**
 * Country detection utilities for phone input
 * Supports multiple detection methods including Cloudflare geolocation
 */

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2 country code (e.g., "TH", "US")
  name: string; // Country name
  method: 'cloudflare' | 'ipapi' | 'ipinfo' | 'timezone' | 'fallback' | 'cache';
}

const COUNTRY_CACHE_KEY = 'detected_country';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCountry {
  country: CountryInfo;
  timestamp: number;
}

/**
 * Get cached country if still valid
 */
function getCachedCountry(): CountryInfo | null {
  try {
    const cached = localStorage.getItem(COUNTRY_CACHE_KEY);
    if (!cached) return null;

    const data: CachedCountry = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(COUNTRY_CACHE_KEY);
      return null;
    }

    return data.country;
  } catch {
    return null;
  }
}

/**
 * Cache detected country
 */
function setCachedCountry(country: CountryInfo): void {
  try {
    const data: CachedCountry = {
      country,
      timestamp: Date.now()
    };
    localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
}

/**
 * Detect country using Cloudflare geolocation
 * This works when your site is behind Cloudflare
 */
async function detectCountryCloudflare(): Promise<CountryInfo | null> {
  try {
    // Method 1: Try Cloudflare trace endpoint (direct)
    const traceResponse = await fetch('/cdn-cgi/trace', {
      method: 'GET',
      cache: 'no-cache'
    });

    if (traceResponse.ok) {
      const text = await traceResponse.text();
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('loc=')) {
          const countryCode = line.split('=')[1]?.trim().toUpperCase();
          if (countryCode && countryCode.length === 2) {
            return {
              code: countryCode,
              name: getCountryName(countryCode),
              method: 'cloudflare'
            };
          }
        }
      }
    }

    // Method 2: Try our backend geolocation endpoint
    const backendResponse = await fetch('/api/geo/country', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      if (data.country) {
        return {
          code: data.country.toUpperCase(),
          name: data.countryName || getCountryName(data.country),
          method: 'cloudflare'
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect country using ipapi.co (free tier: 1000 requests/day)
 * Note: May be blocked in China by Great Firewall
 */
async function detectCountryIpApi(): Promise<CountryInfo | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout for China
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.country_code) {
      return {
        code: data.country_code.toUpperCase(),
        name: data.country_name || getCountryName(data.country_code),
        method: 'ipapi'
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect country using ipinfo.io (free tier: 50,000 requests/month)
 * Note: May be blocked in China by Great Firewall
 */
async function detectCountryIpInfo(): Promise<CountryInfo | null> {
  try {
    const response = await fetch('https://ipinfo.io/json', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout for China
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.country) {
      return {
        code: data.country.toUpperCase(),
        name: getCountryName(data.country),
        method: 'ipinfo'
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect country using browser timezone (China-friendly fallback)
 * This works offline and is not blocked by Great Firewall
 */
function detectCountryByTimezone(): CountryInfo | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common timezone to country mappings
    const timezoneMap: Record<string, { code: string; name: string }> = {
      // China
      'Asia/Shanghai': { code: 'CN', name: 'China' },
      'Asia/Beijing': { code: 'CN', name: 'China' },
      'Asia/Chongqing': { code: 'CN', name: 'China' },
      'Asia/Harbin': { code: 'CN', name: 'China' },
      'Asia/Kashgar': { code: 'CN', name: 'China' },
      'Asia/Urumqi': { code: 'CN', name: 'China' },
      
      // Thailand
      'Asia/Bangkok': { code: 'TH', name: 'Thailand' },
      
      // Japan
      'Asia/Tokyo': { code: 'JP', name: 'Japan' },
      
      // Korea
      'Asia/Seoul': { code: 'KR', name: 'South Korea' },
      
      // Singapore
      'Asia/Singapore': { code: 'SG', name: 'Singapore' },
      
      // Malaysia
      'Asia/Kuala_Lumpur': { code: 'MY', name: 'Malaysia' },
      
      // Vietnam
      'Asia/Ho_Chi_Minh': { code: 'VN', name: 'Vietnam' },
      'Asia/Saigon': { code: 'VN', name: 'Vietnam' },
      
      // Indonesia
      'Asia/Jakarta': { code: 'ID', name: 'Indonesia' },
      
      // Philippines
      'Asia/Manila': { code: 'PH', name: 'Philippines' },
      
      // India
      'Asia/Kolkata': { code: 'IN', name: 'India' },
      'Asia/Calcutta': { code: 'IN', name: 'India' },
      
      // US
      'America/New_York': { code: 'US', name: 'United States' },
      'America/Los_Angeles': { code: 'US', name: 'United States' },
      'America/Chicago': { code: 'US', name: 'United States' },
      'America/Denver': { code: 'US', name: 'United States' },
      
      // UK
      'Europe/London': { code: 'GB', name: 'United Kingdom' },
      
      // Australia
      'Australia/Sydney': { code: 'AU', name: 'Australia' },
      'Australia/Melbourne': { code: 'AU', name: 'Australia' },
    };

    const countryData = timezoneMap[timezone];
    if (countryData) {
      return {
        code: countryData.code,
        name: countryData.name,
        method: 'timezone'
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get country name from country code
 */
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    TH: 'Thailand',
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    KR: 'South Korea',
    CN: 'China', // 中国
    IN: 'India',
    SG: 'Singapore',
    MY: 'Malaysia',
    VN: 'Vietnam',
    ID: 'Indonesia',
    PH: 'Philippines',
    AU: 'Australia',
    CA: 'Canada',
    HK: 'Hong Kong',
    TW: 'Taiwan',
    MO: 'Macau',
    // Add more as needed
  };
  return countries[code.toUpperCase()] || code;
}

/**
 * Main function to detect user's country
 * Tries multiple methods in order of preference
 * Optimized for China's Great Firewall
 */
export async function detectUserCountry(): Promise<CountryInfo> {
  // First, check cache
  const cached = getCachedCountry();
  if (cached) {
    return cached;
  }

  console.log('🌍 Detecting user country...');

  // Method 0: China-specific detection (Great Firewall friendly)
  try {
    const { detectCountryForChina } = await import('./chinaGeoLocation');
    const chinaResult = await detectCountryForChina();
    if (chinaResult) {
      setCachedCountry(chinaResult);
      return chinaResult;
    }
  } catch (error) {
    console.log('❌ China-specific detection failed:', error);
  }

  // Method 1: Cloudflare (fastest and most reliable when available)
  try {
    const cloudflare = await detectCountryCloudflare();
    if (cloudflare) {
      setCachedCountry(cloudflare);
      return cloudflare;
    }
  } catch (error) {
    console.log('❌ Cloudflare detection failed:', error);
  }

  // Method 2: ipapi.co (good free tier)
  try {
    const ipapi = await detectCountryIpApi();
    if (ipapi) {
      setCachedCountry(ipapi);
      return ipapi;
    }
  } catch (error) {
    console.log('❌ ipapi.co detection failed:', error);
  }

  // Method 3: ipinfo.io (backup)
  try {
    const ipinfo = await detectCountryIpInfo();
    if (ipinfo) {
      setCachedCountry(ipinfo);
      return ipinfo;
    }
  } catch (error) {
    console.log('❌ ipinfo.io detection failed:', error);
  }

  // Method 4: Browser timezone (China-friendly, offline)
  try {
    const timezone = detectCountryByTimezone();
    if (timezone) {
      setCachedCountry(timezone);
      return timezone;
    }
  } catch (error) {
    console.log('❌ Timezone detection failed:', error);
  }

  // Fallback: Thailand (can be changed based on your primary market)
  const fallback: CountryInfo = {
    code: 'TH',
    name: 'Thailand',
    method: 'fallback'
  };

  console.log('⚠️ Using fallback country:', fallback);
  return fallback;
}

/**
 * Convert country code to react-phone-number-input format
 */
export function countryCodeToPhoneInputFormat(countryCode: string): string {
  // react-phone-number-input uses UPPERCASE country codes (ISO 3166-1 alpha-2)
  return countryCode.toUpperCase();
}

/**
 * Preload country detection (call this early in your app)
 */
export function preloadCountryDetection(): void {
  // Start detection in background without waiting
  detectUserCountry().catch(() => {
    // Ignore errors in preload
  });
}
