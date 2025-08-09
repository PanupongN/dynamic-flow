/**
 * Test utility to verify email validation patterns
 * Run this in browser console to test different email formats
 */

import { validateEmail } from './emailValidation';

export function testEmailValidation() {
  const testCases = [
    // Valid emails
    { email: 'test@example.com', expected: true, description: 'Basic valid email' },
    { email: 'user.name@domain.co.th', expected: true, description: 'Email with dots and country TLD' },
    { email: 'first+last@company.org', expected: true, description: 'Email with plus sign' },
    { email: 'user_name@sub.domain.com', expected: true, description: 'Email with underscore and subdomain' },
    { email: 'test123@gmail.com', expected: true, description: 'Email with numbers' },
    { email: 'valid-email@domain-name.com', expected: true, description: 'Email with hyphens' },
    
    // Invalid emails
    { email: '', expected: false, description: 'Empty email' },
    { email: 'invalid', expected: false, description: 'No @ symbol' },
    { email: 'invalid@', expected: false, description: 'Missing domain' },
    { email: '@domain.com', expected: false, description: 'Missing local part' },
    { email: 'invalid..email@domain.com', expected: false, description: 'Consecutive dots' },
    { email: '.invalid@domain.com', expected: false, description: 'Starting with dot' },
    { email: 'invalid.@domain.com', expected: false, description: 'Ending with dot' },
    { email: 'invalid@domain', expected: false, description: 'Domain without TLD' },
    { email: 'invalid@.com', expected: false, description: 'Domain starting with dot' },
    { email: 'invalid@domain.', expected: false, description: 'Domain ending with dot' },
    { email: 'inv alid@domain.com', expected: false, description: 'Space in local part' },
    { email: 'invalid@dom ain.com', expected: false, description: 'Space in domain' },
    { email: 'xx@xx', expected: false, description: 'Invalid xx@xx pattern' },
    { email: 'a@b', expected: false, description: 'Too short without TLD' },
    { email: 'test@x', expected: false, description: 'Single character domain' },
    { email: 'x@test', expected: false, description: 'Domain without TLD' },
    
    // Edge cases
    { email: 'a@b.co', expected: true, description: 'Minimal valid email' },
    { email: 'very.long.email.address.with.many.dots@very.long.domain.name.with.many.subdomains.com', expected: true, description: 'Long but valid email' },
  ];

  console.log('🧪 Testing email validation patterns:');
  console.log('');

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ email, expected, description }) => {
    const result = validateEmail(email, false);
    const isCorrect = result.isValid === expected;
    
    if (isCorrect) {
      passed++;
      console.log(`✅ ${description}:`);
      console.log(`   Email: "${email}" → ${result.isValid ? 'Valid' : 'Invalid'}`);
    } else {
      failed++;
      console.log(`❌ ${description}:`);
      console.log(`   Email: "${email}" → Expected: ${expected}, Got: ${result.isValid}`);
      if (result.errorMessage) {
        console.log(`   Error: ${result.errorMessage}`);
      }
    }
  });

  console.log('');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('');
  
  // Test required validation
  console.log('🔍 Testing required field validation:');
  
  const requiredTests = [
    { email: '', required: true, expectedValid: false, description: 'Empty required field' },
    { email: '', required: false, expectedValid: true, description: 'Empty optional field' },
    { email: 'valid@email.com', required: true, expectedValid: true, description: 'Valid required field' },
    { email: 'valid@email.com', required: false, expectedValid: true, description: 'Valid optional field' },
  ];

  requiredTests.forEach(({ email, required, expectedValid, description }) => {
    const result = validateEmail(email, required);
    const isCorrect = result.isValid === expectedValid;
    
    console.log(`${isCorrect ? '✅' : '❌'} ${description}:`);
    console.log(`   Email: "${email}", Required: ${required} → ${result.isValid ? 'Valid' : 'Invalid'}`);
    if (result.errorMessage) {
      console.log(`   Message: ${result.errorMessage}`);
    }
  });

  console.log('');
  console.log('📝 Summary: Email validation supports RFC 5322 compliant email addresses');
  console.log('📚 Valid formats: user@domain.com, user.name@sub.domain.co.th, first+last@company.org');
}

// Available as global function in dev mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testEmailValidation = testEmailValidation;
}
