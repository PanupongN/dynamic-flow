import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Share, Loader } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';
import { AnalyticsDashboard } from '../components/AnalyticsCard';
import { QuickStartModal } from '../components/QuickStartModal';

export function Dashboard() {
  const [showQuickStart, setShowQuickStart] = useState(false);
  
  const { 
    flows, 
    isLoading, 
    error, 
    loadFlows, 
    createNewFlow,
    publishFlow 
  } = useFlowStore();

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleCreateFlow = async (template?: any) => {
    try {
      let newFlow;
      
      if (template && template.nodes && template.nodes.length > 0) {
        // Create flow with template - clean payload
        const cleanFlowData = {
          title: template.name,
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
        newFlow = await createNewFlow();
      }
      
      // Navigate to builder with the new flow ID
      window.location.href = `/builder/${newFlow.id}`;
    } catch (error) {
      console.error('Failed to create flow:', error);
    }
  };

  const handleShowQuickStart = () => {
    setShowQuickStart(true);
  };

  const handlePublishFlow = async (flowId: string) => {
    try {
      await publishFlow(flowId);
    } catch (error) {
      console.error('Failed to publish flow:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getResponseCount = (flowId: string) => {
    // TODO: Implement real response count from API
    return Math.floor(Math.random() * 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button 
          onClick={handleShowQuickStart}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          {isLoading ? 'Creating...' : 'Create New Flow'}
        </button>
      </div>

      {/* Analytics Dashboard */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <AnalyticsDashboard flows={flows} />
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-2">⚠️ Error loading flows</div>
            <p className="text-gray-500 text-sm">{error}</p>
            <button 
              onClick={() => loadFlows()}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-500 text-sm mt-2">Loading flows...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && flows.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">📝</div>
            <p className="text-gray-500 text-sm">No flows created yet</p>
            <button 
              onClick={handleShowQuickStart}
              className="mt-2 inline-block text-blue-600 hover:text-blue-700 text-sm"
            >
              Create your first flow
            </button>
          </div>
        )}

        {/* Flows List */}
        {!isLoading && !error && flows.length > 0 && (
          <div className="divide-y">
            {flows.map((flow) => (
              <div key={flow.id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{flow.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{flow.description || 'No description'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      flow.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : flow.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flow.status}
                    </span>
                    <span className="text-sm text-gray-500">{getResponseCount(flow.id)} responses</span>
                    <span className="text-sm text-gray-500">Created {formatDate(flow.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/builder/${flow.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handlePublishFlow(flow.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Publish/Share"
                  >
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Modal */}
      <QuickStartModal
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onCreateFlow={handleCreateFlow}
      />
    </div>
  );
}
