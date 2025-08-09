/**
 * China-specific geolocation utilities
 * These methods work inside China's Great Firewall
 */

import type { CountryInfo } from './countryDetection';

/**
 * Detect if user is likely in China using multiple indicators
 */
export function detectChinaEnvironment(): {
  isChina: boolean;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
} {
  const indicators: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Check timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const chinaTimezones = [
    'Asia/Shanghai', 'Asia/Beijing', 'Asia/Chongqing', 
    'Asia/Harbin', 'Asia/Kashgar', 'Asia/Urumqi'
  ];
  
  if (chinaTimezones.includes(timezone)) {
    indicators.push('china-timezone');
  }

  // Check language
  const language = navigator.language || '';
  const languages = navigator.languages || [];
  
  if (language.includes('zh-CN') || languages.some(lang => lang.includes('zh-CN'))) {
    indicators.push('simplified-chinese');
  }
  
  if (language.includes('zh') || languages.some(lang => lang.includes('zh'))) {
    indicators.push('chinese-language');
  }

  // Check currency (if available)
  try {
    const formatter = new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: 'CNY'
    });
    const formattedValue = formatter.format(100);
    if (formattedValue.includes('¥') || formattedValue.includes('CN¥')) {
      indicators.push('cny-currency');
    }
  } catch {
    // Ignore currency check errors
  }

  // Determine confidence
  if (indicators.includes('china-timezone') && indicators.includes('simplified-chinese')) {
    confidence = 'high';
  } else if (indicators.includes('china-timezone') || indicators.includes('chinese-language')) {
    confidence = 'medium';
  }

  const isChina = indicators.length > 0;

  return { isChina, confidence, indicators };
}

/**
 * Get country info if detected as China
 */
export function getChinaCountryInfo(): CountryInfo | null {
  const { isChina, confidence } = detectChinaEnvironment();
  
  if (isChina && confidence !== 'low') {
    return {
      code: 'CN',
      name: 'China',
      method: 'timezone'
    };
  }
  
  return null;
}

/**
 * China-friendly detection order
 * Tries local methods first before external APIs
 */
export async function detectCountryForChina(): Promise<CountryInfo | null> {
  // First, try to detect if we're in China
  const chinaInfo = getChinaCountryInfo();
  if (chinaInfo) {
    console.log('🇨🇳 Detected China environment:', chinaInfo);
    return chinaInfo;
  }

  // If not China, return null to continue with regular detection
  return null;
}

/**
 * Check if external APIs are likely blocked (Great Firewall detection)
 */
export async function isGreatFirewallActive(): Promise<boolean> {
  const testUrls = [
    'https://www.google.com/favicon.ico',
    'https://api.github.com',
    'https://ipapi.co/json'
  ];

  let blockedCount = 0;
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
        mode: 'no-cors' // Avoid CORS issues
      });
      // If we get any response, it's not blocked
    } catch {
      blockedCount++;
    }
  }

  // If more than half are blocked, likely behind Great Firewall
  return blockedCount > testUrls.length / 2;
}

/**
 * Get fallback country based on browser settings when APIs are blocked
 */
export function getBrowserBasedCountry(): CountryInfo | null {
  try {
    // Check timezone first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Common timezone mappings for Great Firewall countries
    const timezoneMap: Record<string, CountryInfo> = {
      'Asia/Shanghai': { code: 'CN', name: 'China', method: 'timezone' },
      'Asia/Beijing': { code: 'CN', name: 'China', method: 'timezone' },
      'Asia/Chongqing': { code: 'CN', name: 'China', method: 'timezone' },
      'Asia/Harbin': { code: 'CN', name: 'China', method: 'timezone' },
      'Asia/Urumqi': { code: 'CN', name: 'China', method: 'timezone' },
      'Asia/Tehran': { code: 'IR', name: 'Iran', method: 'timezone' },
      'Asia/Pyongyang': { code: 'KP', name: 'North Korea', method: 'timezone' },
    };

    if (timezoneMap[timezone]) {
      return timezoneMap[timezone];
    }

    // Check language as secondary indicator
    const language = navigator.language || '';
    
    if (language.includes('zh-CN')) {
      return { code: 'CN', name: 'China', method: 'timezone' };
    }
    
    if (language.includes('fa')) {
      return { code: 'IR', name: 'Iran', method: 'timezone' };
    }

    return null;
  } catch {
    return null;
  }
}
