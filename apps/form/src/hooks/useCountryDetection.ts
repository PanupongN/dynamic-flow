import { useState, useEffect } from 'react';
import { detectUserCountry, countryCodeToPhoneInputFormat, CountryInfo } from '../utils/countryDetection';

export interface UseCountryDetectionResult {
  countryInfo: CountryInfo | null;
  phoneInputCountry: string; // Formatted for react-phone-number-input
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for detecting user's country with caching and error handling
 */
export function useCountryDetection(): UseCountryDetectionResult {
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    detectUserCountry()
      .then((result) => {
        if (isMounted) {
          setCountryInfo(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to detect country'));
          console.error('❌ Country detection failed:', err);
          
          // Set fallback country info
          setCountryInfo({
            code: 'TH',
            name: 'Thailand',
            method: 'fallback'
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const phoneInputCountry = countryInfo 
    ? countryCodeToPhoneInputFormat(countryInfo.code)
    : 'TH'; // fallback

  return {
    countryInfo,
    phoneInputCountry,
    isLoading,
    error
  };
}

/**
 * Hook specifically for phone input with optimized UX
 * Shows minimal loading state and handles errors gracefully
 */
export function usePhoneInputCountry(): {
  defaultCountry: string;
  isDetecting: boolean;
  detectionMethod?: string;
} {
  const { countryInfo, phoneInputCountry, isLoading } = useCountryDetection();

  return {
    defaultCountry: phoneInputCountry,
    isDetecting: isLoading,
    detectionMethod: countryInfo?.method
  };
}
