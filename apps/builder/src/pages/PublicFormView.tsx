import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { getTheme, generateCSSVariables } from '../themes';


// Local type definition (copied from @dynamic-flow/types)
interface Flow {
  id: string;
  title: string;
  description?: string;
  nodes: any[];
  settings: {
    allowMultipleSubmissions: boolean;
    showProgressBar: boolean;
    requireAuth: boolean;
    collectAnalytics: boolean;
    redirectUrl?: string;
    webhookUrl?: string;
  };
  theme?: {
    customCSS?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
      border?: string;
    };
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const PublicFormView: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadFlow = async () => {
      if (!flowId) {
        setError('Flow ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use the API service to load published flow data
        const { flowsApi } = await import('../services/api');
        const flowData = await flowsApi.getPublished(flowId);
        
        setFlow(flowData);
        setError(null);
      } catch (err) {
        console.error('Error loading published flow:', err);
        
        // Provide specific error messages with more details for debugging
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError('This form is not currently available or not published. Please make sure the form has been published and the flow ID is correct.');
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            setError('Cannot connect to API server (http://localhost:3001). Please make sure the API server is running.');
          } else if (err.message.includes('500')) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Failed to load form: ${err.message}`);
          }
        } else {
          setError('Form not found or is no longer available.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId]);

  const handleSubmitSuccess = (response: any) => {
    console.log('Form submitted successfully:', response);
    setIsSubmitted(true);

    // If there's a redirect URL, navigate to it
    if (flow?.settings.redirectUrl) {
      setTimeout(() => {
        window.location.href = flow.settings.redirectUrl!;
      }, 1000);
    }
  };

  // Handle form submission errors - currently not used
  // const handleSubmitError = (error: string) => {
  //   console.error('Form submission error:', error);
  //   // Show error message to user
  //   alert(`Submission failed: ${error}`);
  // };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Form Not Available</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Success state (after submission)
  if (isSubmitted && !flow?.settings.redirectUrl) {
    const thankYouNode = flow?.nodes.find(node => node.type === 'thank_you');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {thankYouNode?.data.label || 'Thank You!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {thankYouNode?.data.description || 'Your response has been submitted successfully.'}
          </p>
          
          {/* Allow multiple submissions if configured */}
          {flow?.settings.allowMultipleSubmissions && (
            <button
              onClick={() => {
                setIsSubmitted(false);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Another Response
            </button>
          )}
        </div>
      </div>
    );
  }

  // Redirect to thank you page if configured
  if (isSubmitted && flow?.settings.redirectUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  // Main form view
  if (!flow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No form data available</p>
        </div>
      </div>
    );
  }

  // Get the theme for this flow
  const themeId = (flow.theme as any)?.id || 'default';
  const theme = getTheme(themeId);
  const themeCSS = generateCSSVariables(theme);
  
  // Debug logging
  console.log('PublicFormView - Flow theme data:', {
    flowTheme: flow.theme,
    themeId,
    themeName: theme.name,
    primaryColor: theme.colors.primary.main,
    generatedCSS: themeCSS.substring(0, 500) + '...',
    semanticColorsTest: {
      negativeInCSS: themeCSS.includes('--color-negative-100'),
      successInCSS: themeCSS.includes('--color-success-100'),
      warningInCSS: themeCSS.includes('--color-warning-100')
    }
  });

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background.default }}>
      {/* Apply theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
      {/* Apply custom theme styles if available */}
      {flow.theme?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: flow.theme.customCSS }} />
      )}
      
      {/* Enhanced form styling with theme */}
      <style dangerouslySetInnerHTML={{ __html: `
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
        

        
        .form-error-message {
          color: var(--color-negative-100);
          font-weight: 500;
        }
        
        /* Success States - ใช้ success color */
        .success-icon-container {
          background-color: var(--color-success-60);
        }
        
        .success-icon {
          color: var(--color-success-100);
        }
        
        /* Submit Error - ใช้ negative color */
        .form-submit-error {
          background-color: var(--color-negative-60);
          border: 1px solid var(--color-negative-100);
          color: var(--color-negative-120);
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
        
        /* Semantic Button Colors */
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
        
        /* Progress bar styling */
        .progress-bar {
          background-color: var(--color-border-light);
          border-radius: var(--border-radius-xl);
          overflow: hidden;
        }
        
        .progress-bar-fill {
          background-color: var(--color-primary);
          transition: width 0.3s ease;
        }
        
        /* Radio and checkbox styling */
        .form-field input[type="radio"],
        .form-field input[type="checkbox"] {
          width: auto;
          margin-right: var(--spacing-sm);
          accent-color: var(--color-primary);
        }
        
        /* Choice options styling */
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
      ` }} />
      
      <div className="container mx-auto py-8 form-container">
        <ErrorBoundary>
          <FormRenderer 
            flow={flow}
            isPreview={false}
            onSubmit={handleSubmitSuccess}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
