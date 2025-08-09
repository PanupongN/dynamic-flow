import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { getTheme, generateCSSVariables } from '../themes';
import { flowsApi } from '../services/api';

// Local type definition
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
    id?: string;
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
  version?: string;
}

export const PreviewFormView: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlow = async () => {
      if (!flowId) {
        setError('Flow ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use the API service to load draft flow data for preview
        const flowData = await flowsApi.getDraft(flowId);
        
        setFlow(flowData);
        setError(null);
      } catch (err) {
        console.error('Error loading flow for preview:', err);
        
        // Try to get more specific error information
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            setError('Flow not found. Make sure the flow exists and has been saved.');
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            setError('Cannot connect to API server. Make sure the API server is running.');
          } else if (err.message.includes('500')) {
            setError('Internal server error. Please try again later.');
          } else {
            setError(`Failed to load form preview: ${err.message}`);
          }
        } else {
          setError('Failed to load form preview');
        }
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId]);

  const handlePreviewSubmit = (data: any) => {
    console.log('Preview form submitted:', data);
    alert('Form submitted successfully! (Preview mode - no data saved)');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form preview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview Not Available</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Form preview
  if (!flow) return null;

  // Get the theme for this flow
  const themeId = flow.theme?.id || 'default';
  const theme = getTheme(themeId);
  const themeCSS = generateCSSVariables(theme);
  
  // Debug logging for preview
  console.log('PreviewFormView - Flow theme data:', {
    flowTheme: flow.theme,
    themeId,
    themeName: theme.name,
    primaryColor: theme.colors.primary.main,
  });

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background.default }}>
      {/* Apply theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
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
        
        .form-error-message {
          color: var(--color-negative-100);
          font-weight: 500;
        }
        
        .form-submit-error {
          background-color: var(--color-negative-60);
          border: 1px solid var(--color-negative-100);
          color: var(--color-negative-120);
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
      ` }} />
      
      {/* Preview Banner */}
      <div style={{ backgroundColor: theme.colors.background.accent, borderColor: theme.colors.border.light }} className="border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary.main }}>
                <svg className="w-2 h-2" fill="white" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>Preview Mode</h1>
                <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  You are viewing "{flow.title}" with {theme.name} theme
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 text-sm rounded-md hover:opacity-80"
              style={{ 
                backgroundColor: theme.colors.primary.main, 
                color: theme.colors.primary.contrastText 
              }}
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto py-8 form-container">
        <ErrorBoundary>
          <FormRenderer 
            flow={flow} 
            isPreview={true} 
            onSubmit={handlePreviewSubmit}
          />
          
          {/* Debug theme information */}
          <div className="mt-4 p-2 border rounded" style={{ 
            backgroundColor: theme.colors.background.accent, 
            borderColor: theme.colors.border.light,
            color: theme.colors.text.secondary 
          }}>
            <strong>Theme Debug:</strong> {flow.theme?.id || 'No theme set'} 
            {flow.theme?.id && ` (Theme: ${theme.name}, Primary: ${theme.colors.primary.main})`}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};
