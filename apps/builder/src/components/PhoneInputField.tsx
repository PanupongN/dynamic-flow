
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
  return (
    <div className="phone-input-wrapper">
      <PhoneInput
        international
        defaultCountry="TH"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
        inputProps={{
          required,
          className: `flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`
        }}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
      

    </div>
  );
}
