
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { usePhoneInputCountry } from '../hooks/useCountryDetection';

interface PhoneInputFieldProps {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export function PhoneInputField({
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  disabled = false,
  onValidationChange
}: PhoneInputFieldProps) {
  const { defaultCountry, isDetecting } = usePhoneInputCountry();

  const wrapperClasses = [
    'phone-input-wrapper',
    required ? 'required' : ''
  ].filter(Boolean).join(' ');

  // Handle value change with validation
  const handleChange = (newValue?: string) => {
    onChange(newValue);
    
    // Notify parent of validation state
    if (onValidationChange) {
      const isNewValueValid = newValue ? isValidPhoneNumber(newValue) : !required;
      onValidationChange(isNewValueValid);
    }
  };

  return (
    <div className={wrapperClasses}>
      <PhoneInput
        international
        defaultCountry={defaultCountry as any}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || isDetecting}
        className="w-full"
      />

    </div>
  );
}
