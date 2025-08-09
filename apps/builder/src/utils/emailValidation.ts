/**
 * Email validation utilities
 */

export interface EmailValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Email validation regex (RFC 5322 compliant with required TLD)
 * Requires at least one dot in domain part (TLD requirement)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Comprehensive email validation
 */
export function validateEmail(
  value?: string, 
  required: boolean = false
): EmailValidationResult {
  // Handle empty values
  if (!value || value.trim() === '') {
    return {
      isValid: !required,
      errorMessage: required ? 'Email is required' : undefined
    };
  }

  const trimmedValue = value.trim();

  // Basic format validation
  if (!EMAIL_REGEX.test(trimmedValue)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address'
    };
  }

  // Extract domain and TLD for additional validation
  const parts = trimmedValue.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address'
    };
  }

  const domain = parts[1];
  const domainParts = domain.split('.');
  
  // Must have at least domain + TLD (e.g., "example.com")
  if (domainParts.length < 2) {
    return {
      isValid: false,
      errorMessage: 'Email must have a valid domain (e.g., example.com)'
    };
  }

  // Check TLD (last part) is at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      errorMessage: 'Email domain must have a valid TLD'
    };
  }

  // Check for invalid patterns like "xx@xx"
  if (parts[0].length <= 2 && domain.length <= 2) {
    return {
      isValid: false,
      errorMessage: 'Please enter a complete email address'
    };
  }

  // Length validation
  if (trimmedValue.length > 254) {
    return {
      isValid: false,
      errorMessage: 'Email address is too long'
    };
  }

  // Local part (before @) length validation
  const localPart = trimmedValue.split('@')[0];
  if (localPart.length > 64) {
    return {
      isValid: false,
      errorMessage: 'Email address is too long'
    };
  }

  // Additional checks
  if (trimmedValue.includes('..')) {
    return {
      isValid: false,
      errorMessage: 'Email address cannot contain consecutive dots'
    };
  }

  if (trimmedValue.startsWith('.') || trimmedValue.endsWith('.')) {
    return {
      isValid: false,
      errorMessage: 'Email address cannot start or end with a dot'
    };
  }

  // Success case
  return {
    isValid: true
  };
}

/**
 * Get validation message for email input
 */
export function getEmailValidationMessage(
  value?: string, 
  required: boolean = false
): string | undefined {
  const result = validateEmail(value, required);
  return result.errorMessage;
}

/**
 * Check if email is valid (simple boolean check)
 */
export function isEmailValid(value?: string, required: boolean = false): boolean {
  return validateEmail(value, required).isValid;
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(value?: string): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Extract domain from email
 */
export function getEmailDomain(value?: string): string | undefined {
  if (!value || !value.includes('@')) return undefined;
  return value.split('@')[1]?.toLowerCase();
}

/**
 * Check if email is from specific domain
 */
export function isEmailFromDomain(domain: string, value?: string): boolean {
  const emailDomain = getEmailDomain(value);
  return emailDomain === domain.toLowerCase();
}

/**
 * React Hook Form validation rule for email
 */
export const emailValidationRule = (required: boolean = false) => ({
  validate: (value: string) => {
    const result = validateEmail(value, required);
    return result.isValid || result.errorMessage;
  }
});

/**
 * Common email validation patterns for different use cases
 */
export const emailValidationPatterns = {
  // Basic validation - just check if it's a valid email
  basic: (required = false) => emailValidationRule(required),
  
  // Strict validation - additional domain checks
  strict: (required = false) => ({
    validate: (value: string) => {
      const result = validateEmail(value, required);
      if (!result.isValid) return result.errorMessage;
      
      const domain = getEmailDomain(value);
      
      // Block obviously fake domains
      const blockedDomains = ['test.com', 'example.com', 'temp.com', 'fake.com'];
      if (domain && blockedDomains.includes(domain)) {
        return 'Please use a valid email address';
      }
      
      return true;
    }
  }),
  
  // Corporate email validation - must be from specific domains
  corporate: (allowedDomains: string[], required = false) => ({
    validate: (value: string) => {
      const result = validateEmail(value, required);
      if (!result.isValid) return result.errorMessage;
      
      const domain = getEmailDomain(value);
      if (domain && !allowedDomains.map(d => d.toLowerCase()).includes(domain)) {
        return `Email must be from: ${allowedDomains.join(', ')}`;
      }
      
      return true;
    }
  })
};
