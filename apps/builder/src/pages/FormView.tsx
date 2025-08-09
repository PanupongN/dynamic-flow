import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { flowsApi } from '../services/api';
import { useToast } from '../hooks/useToast';

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
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const FormView: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
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
        const flowData = await flowsApi.getById(flowId);
        
        // Check if flow is published
        if (flowData.status !== 'published') {
          setError('This form is not currently available. It may be unpublished or in draft mode.');
          setLoading(false);
          return;
        }
        
        setFlow(flowData);
        setError(null);
      } catch (err) {
        console.error('Error loading flow:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId]);

  const handleSubmitSuccess = (response: any) => {
    setIsSubmitted(true);
    
    addToast({
      id: Date.now().toString(),
      title: 'Success!',
      message: 'Your form has been submitted successfully.',
      type: 'success'
    });

    // If there's no redirect URL, show success message
    if (!flow?.settings.redirectUrl) {
      // You can customize this behavior
    }
  };

  const handleSubmitError = (error: string) => {
    
    addToast({
      id: Date.now().toString(),
      title: 'Submission Failed',
      message: error || 'Failed to submit form. Please try again.',
      type: 'error'
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToDashboard = () => {
    navigate('/');
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
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToDashboard}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
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
            {thankYouNode?.data.description || 'Your form has been submitted successfully.'}
          </p>
          
          {/* Optional: Allow multiple submissions */}
          {flow?.settings.allowMultipleSubmissions && (
            <button
              onClick={() => {
                setIsSubmitted(false);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
            >
              Submit Another Response
            </button>
          )}
          
          <button
            onClick={handleBackToDashboard}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
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
      {/* Custom theme styles if available */}
      {flow.theme?.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: flow.theme.customCSS }} />
      )}
      
      <div className="container mx-auto py-8">
                  <FormRenderer 
            flow={flow}
          />
      </div>
    </div>
  );
};
