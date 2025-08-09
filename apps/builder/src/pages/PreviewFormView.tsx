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
        
        // Use draft endpoint for preview
        const response = await fetch(`/api/flows/${flowId}/draft`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Flow not found');
          } else {
            setError('Failed to load form preview');
          }
          setLoading(false);
          return;
        }
        
        const flowData = await response.json();
        setFlow(flowData);
        setError(null);
      } catch (err) {
        console.error('Error loading draft flow:', err);
        setError('Failed to load form preview');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-yellow-800" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-medium text-yellow-800">Preview Mode</h1>
                <p className="text-xs text-yellow-600">You are viewing the draft version of "{flow.title}"</p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 text-sm bg-yellow-200 text-yellow-800 rounded-md hover:bg-yellow-300"
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <ErrorBoundary>
        <FormRenderer 
          flow={flow} 
          isPreview={true} 
          onSubmit={handlePreviewSubmit}
        />
      </ErrorBoundary>
    </div>
  );
};
