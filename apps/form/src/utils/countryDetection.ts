/**
 * Country detection utilities for phone input
 * Simplified version for preview app - no China-specific detection needed
 */

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2 country code (e.g., "TH", "US")
  name: string; // Country name
  method: 'timezone' | 'fallback';
}

/**
 * Detect country using browser timezone (offline, works everywhere)
 */
function detectCountryByTimezone(): CountryInfo | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common timezone to country mappings
    const timezoneMap: Record<string, { code: string; name: string }> = {
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
    CN: 'China',
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
  };
  return countries[code.toUpperCase()] || code;
}

/**
 * Main function to detect user's country
 * Simple implementation for preview app
 */
export async function detectUserCountry(): Promise<CountryInfo> {
  console.log('🌍 Detecting user country...');

  // Method 1: Browser timezone (offline, works everywhere)
  try {
    const timezone = detectCountryByTimezone();
    if (timezone) {
      return timezone;
    }
  } catch (error) {
    console.log('❌ Timezone detection failed:', error);
  }

  // Fallback: Thailand
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
  return countryCode.toUpperCase();
}
