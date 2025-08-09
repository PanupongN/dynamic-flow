
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { usePhoneInputCountry } from '../hooks/useCountryDetection';

interface PhoneInputFieldProps {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function PhoneInputField({
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  error = false,
  errorMessage
}: PhoneInputFieldProps) {
  const { defaultCountry, isDetecting, detectionMethod } = usePhoneInputCountry();

  return (
    <div className="phone-input-wrapper">
      {isDetecting && (
        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
          <span className="animate-spin">🌍</span>
          <span>Detecting your country...</span>
        </div>
      )}
      {!isDetecting && detectionMethod && detectionMethod !== 'fallback' && (
        <div className="text-xs text-green-600 mb-1">
          ✅ Country detected via {detectionMethod}
        </div>
      )}
      <PhoneInput
        international
        defaultCountry={defaultCountry as any}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled || isDetecting}
        className="w-full"
        inputProps={{
          required,
          className: `flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          } ${isDetecting ? 'opacity-50' : ''}`
        }}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
