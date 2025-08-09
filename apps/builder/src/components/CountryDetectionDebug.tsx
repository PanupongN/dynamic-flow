import { useCountryDetection } from '../hooks/useCountryDetection';
import { testCountryCodes } from '../utils/countryCodeTest';
import { testEmailValidation } from '../utils/emailValidationTest';
import { detectChinaEnvironment } from '../utils/chinaGeoLocation';

/**
 * Debug component to show country detection information
 * Only shows in development mode
 */
export function CountryDetectionDebug() {
  const { countryInfo, phoneInputCountry, isLoading, error } = useCountryDetection();
  const chinaEnv = detectChinaEnvironment();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg max-w-xs z-50">
      <div className="font-semibold mb-1">🌍 Country Detection Debug</div>
      
      {isLoading && (
        <div className="text-yellow-300">⏳ Detecting...</div>
      )}
      
      {error && (
        <div className="text-red-300">❌ Error: {error.message}</div>
      )}
      
      {countryInfo && (
        <div className="space-y-1">
          <div>🏁 Country: {countryInfo.name} ({countryInfo.code})</div>
          <div>📱 Phone Format: {phoneInputCountry}</div>
          <div>🔍 Method: {countryInfo.method}</div>
          {countryInfo.method === 'cache' && (
            <div className="text-blue-300">💾 From cache</div>
          )}
          {countryInfo.method === 'fallback' && (
            <div className="text-orange-300">⚠️ Using fallback</div>
          )}
          
          {chinaEnv.isChina && (
            <div className="pt-1 border-t border-gray-600">
              <div className="text-yellow-300">🇨🇳 China Environment Detected</div>
              <div className="text-xs">Confidence: {chinaEnv.confidence}</div>
              <div className="text-xs">Indicators: {chinaEnv.indicators.join(', ')}</div>
            </div>
          )}
          
          <div className="pt-1 border-t border-gray-600 space-y-1">
            <button 
              onClick={testCountryCodes}
              className="block text-xs text-blue-400 hover:text-blue-300 underline"
            >
              🧪 Test Country Codes
            </button>
            <button 
              onClick={testEmailValidation}
              className="block text-xs text-green-400 hover:text-green-300 underline"
            >
              📧 Test Email Validation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
