import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FormView } from './pages/FormView';
import { PreviewFormView } from './pages/PreviewFormView';
import { PublicFormView } from './pages/PublicFormView';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Main route for end users to fill forms */}
          <Route path="/form/:flowId" element={<FormView />} />
          
          {/* Public route (alias for form route) */}
          <Route path="/public/:flowId" element={<PublicFormView />} />
          
          {/* Preview route for form builders */}
          <Route path="/preview/:flowId" element={<PreviewFormView />} />
          
          {/* Default redirect */}
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Dynamic Flow Forms</h1>
                <p className="text-gray-600 mb-6">
                  This is the form interface for Dynamic Flow. 
                  Please access a specific form using the correct URL.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Form URL format: <code>/form/:flowId</code></p>
                  <p>Public URL format: <code>/public/:flowId</code></p>
                  <p>Preview URL format: <code>/preview/:flowId</code></p>
                </div>
              </div>
            </div>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
