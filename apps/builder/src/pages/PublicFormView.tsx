import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { ErrorBoundary } from '../components/ErrorBoundary';


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

  const handleSubmitError = (error: string) => {
    console.error('Form submission error:', error);
    // Show error message to user
    alert(`Submission failed: ${error}`);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Apply custom theme styles if available */}
      {flow.theme?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: flow.theme.customCSS }} />
      )}
      
      {/* Apply theme colors */}
      <style>
        {flow.theme?.colors && `
          :root {
            --primary-color: ${flow.theme.colors.primary || '#3B82F6'};
            --secondary-color: ${flow.theme.colors.secondary || '#6B7280'};
            --background-color: ${flow.theme.colors.background || '#F9FAFB'};
            --text-color: ${flow.theme.colors.text || '#111827'};
            --border-color: ${flow.theme.colors.border || '#D1D5DB'};
          }
          
          .form-field input, .form-field textarea, .form-field select {
            border-color: var(--border-color);
          }
          
          .form-field input:focus, .form-field textarea:focus, .form-field select:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          button[type="submit"], .btn-primary {
            background-color: var(--primary-color);
          }
          
          button[type="submit"]:hover, .btn-primary:hover {
            background-color: var(--primary-color);
            filter: brightness(0.9);
          }
        `}
      </style>
      
      <div className="container mx-auto py-8">
        <ErrorBoundary>
          <FormRenderer 
            flow={flow}
            isPreview={false}
            onSubmit={handleSubmitSuccess}
            onError={handleSubmitError}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
