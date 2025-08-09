import React from 'react';
import { CompanyTheme } from '../themes';

interface FormStylesProps {
  theme: CompanyTheme;
  customCSS?: string;
}

export const FormStyles: React.FC<FormStylesProps> = ({ theme, customCSS }) => {
  const formCSS = `
    .form-container {
      font-family: var(--font-family);
      color: var(--color-text-primary);
    }
    
    .form-field {
      margin-bottom: var(--spacing-lg);
    }
    
    .form-field label {
      display: block;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .form-field input, 
    .form-field textarea, 
    .form-field select,
    .form-field-input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border-main);
      border-radius: var(--border-radius-md);
      background-color: var(--color-background-paper);
      color: var(--color-text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      transition: all 0.2s ease;
    }
    
    .form-field input:focus, 
    .form-field textarea:focus, 
    .form-field select:focus,
    .form-field-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    
    .form-field input:hover:not(:focus), 
    .form-field textarea:hover:not(:focus), 
    .form-field select:hover:not(:focus),
    .form-field-input:hover:not(:focus) {
      border-color: var(--color-border-dark);
    }
    
    button[type="submit"], 
    .btn-primary {
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-base);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }
    
    button[type="submit"]:hover, 
    .btn-primary:hover {
      background-color: var(--color-primary-dark);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    
    button[type="submit"]:active, 
    .btn-primary:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-secondary {
      background-color: var(--color-background-paper);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border-main);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-secondary:hover {
      background-color: var(--color-gray-50);
      border-color: var(--color-gray-400);
    }
    
    .btn-success {
      background-color: var(--color-success-100);
      color: white;
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-success:hover {
      background-color: var(--color-success-120);
    }
    
    .btn-warning {
      background-color: var(--color-warning-100);
      color: var(--color-warning-120);
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-warning:hover {
      background-color: var(--color-warning-120);
      color: white;
    }
    
    .btn-error {
      background-color: var(--color-negative-100);
      color: white;
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-error:hover {
      background-color: var(--color-negative-120);
    }
    
    .btn-info {
      background-color: var(--color-information-100);
      color: white;
      border: none;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-info:hover {
      background-color: var(--color-information-120);
    }
    
    .form-error-message {
      color: var(--color-negative-100);
      font-weight: 500;
    }
    
    .form-submit-error {
      background-color: var(--color-negative-60);
      border: 1px solid var(--color-negative-100);
      color: var(--color-negative-120);
    }
    
    .success-icon-container {
      background-color: var(--color-success-60);
    }
    
    .success-icon {
      color: var(--color-success-100);
    }
    
    .form-step {
      padding: var(--spacing-xl);
    }
    
    .form-step h2 {
      color: var(--color-text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-md);
    }
    
    .form-step p {
      color: var(--color-text-secondary);
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-lg);
    }
    
    .progress-bar {
      background-color: var(--color-border-light);
      border-radius: var(--border-radius-xl);
      overflow: hidden;
    }
    
    .progress-bar-fill {
      background-color: var(--color-primary);
      transition: width 0.3s ease;
    }
    
    .form-field input[type="radio"],
    .form-field input[type="checkbox"] {
      width: auto;
      margin-right: var(--spacing-sm);
      accent-color: var(--color-primary);
    }
    
    .choice-option {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border-main);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: var(--color-background-paper);
    }
    
    .choice-option:hover {
      border-color: var(--color-primary);
      background-color: var(--color-background-accent);
    }
    
    .choice-option.selected {
      border-color: var(--color-primary);
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
    }
  `;

  return (
    <>
      {/* Apply enhanced form styling with theme */}
      <style dangerouslySetInnerHTML={{ __html: formCSS }} />
      
      {/* Apply custom theme styles if available */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}
    </>
  );
};
