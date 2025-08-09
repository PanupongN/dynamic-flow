/**
 * Phone number validation utilities
 */

import { isValidPhoneNumber, parsePhoneNumber, getCountryCallingCode } from 'react-phone-number-input';

export interface PhoneValidationResult {
  isValid: boolean;
  errorMessage?: string;
  countryCode?: string;
  nationalNumber?: string;
  internationalFormat?: string;
}

/**
 * Comprehensive phone number validation
 */
export function validatePhoneNumber(
  value?: string, 
  required: boolean = false,
  countryCode?: string
): PhoneValidationResult {
  // Handle empty values
  if (!value || value.trim() === '') {
    return {
      isValid: !required,
      errorMessage: required ? 'Phone number is required' : undefined
    };
  }

  try {
    // Basic format validation
    if (!isValidPhoneNumber(value)) {
      return {
        isValid: false,
        errorMessage: 'Please enter a valid phone number'
      };
    }

    // Parse phone number for additional info
    const phoneNumber = parsePhoneNumber(value);
    
    if (!phoneNumber) {
      return {
        isValid: false,
        errorMessage: 'Unable to parse phone number'
      };
    }

    // Country-specific validation
    if (countryCode && phoneNumber.country !== countryCode) {
      return {
        isValid: false,
        errorMessage: `Phone number must be from ${countryCode}`
      };
    }

    // Success case
    return {
      isValid: true,
      countryCode: phoneNumber.country,
      nationalNumber: phoneNumber.nationalNumber,
      internationalFormat: phoneNumber.formatInternational()
    };
    
  } catch (error) {
    return {
      isValid: false,
      errorMessage: 'Invalid phone number format'
    };
  }
}

/**
 * Get validation message for phone input
 */
export function getPhoneValidationMessage(
  value?: string, 
  required: boolean = false
): string | undefined {
  const result = validatePhoneNumber(value, required);
  return result.errorMessage;
}

/**
 * Check if phone number is valid (simple boolean check)
 */
export function isPhoneValid(value?: string, required: boolean = false): boolean {
  return validatePhoneNumber(value, required).isValid;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(value?: string): string {
  if (!value) return '';
  
  try {
    const phoneNumber = parsePhoneNumber(value);
    return phoneNumber ? phoneNumber.formatInternational() : value;
  } catch {
    return value;
  }
}

/**
 * Get country info from phone number
 */
export function getPhoneCountryInfo(value?: string): {
  country?: string;
  countryCode?: string;
  callingCode?: string;
} {
  if (!value) return {};
  
  try {
    const phoneNumber = parsePhoneNumber(value);
    if (!phoneNumber) return {};
    
    return {
      country: phoneNumber.country,
      countryCode: phoneNumber.country,
      callingCode: phoneNumber.country ? `+${getCountryCallingCode(phoneNumber.country)}` : undefined
    };
  } catch {
    return {};
  }
}

/**
 * React Hook Form validation rule for phone numbers
 */
export const phoneValidationRule = (required: boolean = false, countryCode?: string) => ({
  validate: (value: string) => {
    const result = validatePhoneNumber(value, required, countryCode);
    return result.isValid || result.errorMessage;
  }
});

/**
 * Common phone validation patterns for different use cases
 */
export const phoneValidationPatterns = {
  // Basic validation - just check if it's a valid phone number
  basic: (required: boolean = false) => phoneValidationRule(required),
  
  // Strict validation - must be from specific country
  country: (countryCode: string, required: boolean = false) => 
    phoneValidationRule(required, countryCode),
    
  // Mobile only validation (if needed in future)
  mobile: (required: boolean = false) => ({
    validate: (value: string) => {
      const result = validatePhoneNumber(value, required);
      if (!result.isValid) return result.errorMessage;
      
      // Additional mobile-specific validation could go here
      return true;
    }
  })
};
