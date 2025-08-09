import React from 'react';

export interface Flow {
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

// Loading State Component
export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = "Loading form..." 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  title?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  title = "Form Not Available",
  onRetry 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
        >
          Try Again
        </button>
      )}
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Success State Component
interface SuccessStateProps {
  flow: Flow;
  onReset?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ flow, onReset }) => {
  const thankYouNode = flow.nodes.find(node => node.type === 'thank_you');
  
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
        {flow.settings.allowMultipleSubmissions && onReset && (
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Another Response
          </button>
        )}
      </div>
    </div>
  );
};

// Redirect State Component
export const RedirectState: React.FC = () => (
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

// No Data State Component
export const NoDataState: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-600">No form data available</p>
    </div>
  </div>
);
