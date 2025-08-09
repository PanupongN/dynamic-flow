import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFlowStore } from '../stores/flowStore';
import { QuickStartModal } from './QuickStartModal';

export function Navbar() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showQuickStart, setShowQuickStart] = useState(false);
  const { createNewFlow, isLoading } = useFlowStore();

  const handleCreateFlow = async (template?: any, flowName?: string) => {
    try {
      let newFlow;
      
      if (template && template.nodes && template.nodes.length > 0) {
        // Create flow with template - clean payload
        const cleanFlowData = {
          title: flowName || template.name,
          description: template.description,
          nodes: template.nodes,
          settings: {
            allowMultipleSubmissions: false,
            showProgressBar: true,
            requireAuth: false,
            collectAnalytics: true,
          },
          theme: {},
          status: 'draft' as const,
        };
        
        const { flowsApi } = await import('../services/api');
        newFlow = await flowsApi.create(cleanFlowData);
      } else {
        // Create blank flow
        newFlow = await createNewFlow(flowName);
      }
      
      if (newFlow?.id) {
        window.location.href = `/builder/${newFlow.id}`;
      }
    } catch (error) {
      console.error('Failed to create flow:', error);
    }
  };

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Dynamic Flow
            </Link>
            <div className="flex space-x-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link 
                to="/settings" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-400' : 
                apiStatus === 'offline' ? 'bg-red-400' : 
                'bg-yellow-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                API {apiStatus === 'checking' ? 'checking...' : apiStatus}
              </span>
            </div>

            <button 
              onClick={() => setShowQuickStart(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Flow'}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Quick Start Modal */}
    <QuickStartModal
      isOpen={showQuickStart}
      onClose={() => setShowQuickStart(false)}
      onCreateFlow={handleCreateFlow}
    />
  </>
  );
}
