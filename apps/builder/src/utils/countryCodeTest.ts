/**
 * Test utility to verify country code formats for react-phone-number-input
 * Run this in browser console to test different country codes
 */

import { countryCodeToPhoneInputFormat } from './countryDetection';

export function testCountryCodes() {
  const testCases = [
    { input: 'th', expected: 'TH', country: 'Thailand' },
    { input: 'TH', expected: 'TH', country: 'Thailand' },
    { input: 'us', expected: 'US', country: 'United States' },
    { input: 'US', expected: 'US', country: 'United States' },
    { input: 'gb', expected: 'GB', country: 'United Kingdom' },
    { input: 'GB', expected: 'GB', country: 'United Kingdom' },
    { input: 'jp', expected: 'JP', country: 'Japan' },
    { input: 'JP', expected: 'JP', country: 'Japan' },
  ];

  console.log('🧪 Testing country code formats for react-phone-number-input:');
  console.log('');

  testCases.forEach(({ input, expected, country }) => {
    const result = countryCodeToPhoneInputFormat(input);
    const isCorrect = result === expected;
    
    console.log(`${isCorrect ? '✅' : '❌'} ${country}:`);
    console.log(`   Input: "${input}" → Output: "${result}" (Expected: "${expected}")`);
    
    if (!isCorrect) {
      console.error(`   ❌ FAILED: Expected "${expected}" but got "${result}"`);
    }
  });

  console.log('');
  console.log('📝 Summary: react-phone-number-input requires UPPERCASE country codes (ISO 3166-1 alpha-2)');
  console.log('📚 Valid examples: TH, US, GB, JP, KR, SG, MY, VN, ID, PH');
}

// Available as global function in dev mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).testCountryCodes = testCountryCodes;
}
