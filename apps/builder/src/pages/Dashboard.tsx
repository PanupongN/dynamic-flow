import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Share, Loader, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';
import { AnalyticsDashboard } from '../components/AnalyticsCard';
import { useToast } from '../hooks/useToast';

export function Dashboard() {
  const { toast } = useToast();
  
  const { 
    flows, 
    isLoading, 
    error, 
    loadFlows, 
    createNewFlow,
    publishFlow,
    unpublishFlow,
    deleteFlow
  } = useFlowStore();

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  // Debug logging
  useEffect(() => {
    if (flows && flows.length > 0) {
      console.log('Dashboard flows data:', flows.map(f => ({ 
        id: f.id, 
        title: f.title, 
        hasTitle: !!f.title 
      })));
    }
  }, [flows]);

  const handleCreateFlow = async () => {
    try {
      // Create blank flow only
      const newFlow = await createNewFlow('Untitled Flow');
      
      // Navigate to builder with the new flow ID
      if (newFlow?.id) {
        window.location.href = `/builder/${newFlow.id}`;
      }
    } catch (error) {
      console.error('Failed to create flow:', error);
    }
  };

  const handlePublishFlow = async (flowId: string) => {
    try {
      await publishFlow(flowId);
      toast.success('Flow published successfully');
    } catch (error) {
      console.error('Failed to publish flow:', error);
      toast.error('Failed to publish flow');
    }
  };

  const handleUnpublishFlow = async (flowId: string) => {
    try {
      await unpublishFlow(flowId);
      toast.success('Flow unpublished successfully');
    } catch (error) {
      console.error('Failed to unpublish flow:', error);
      toast.error('Failed to unpublish flow');
    }
  };

  const handleDeleteFlow = async (flowId: string, flowTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${flowTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await deleteFlow(flowId);
        toast.success('Flow deleted successfully');
      } catch (error) {
        console.error('Failed to delete flow:', error);
        toast.error('Failed to delete flow');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getResponseCount = (_flowId: string) => {
    // TODO: Implement real response count from API
    return Math.floor(Math.random() * 200);
  };

  const getPublicFormUrl = (flowId: string) => {
    return `${window.location.origin}/public/${flowId}`;
  };

  const copyFormUrl = async (flowId: string) => {
    const url = getPublicFormUrl(flowId);
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL Copied!', 'Form URL has been copied to clipboard.');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Copy Failed', 'Could not copy URL to clipboard.');
    }
  };

  const openPublicForm = (flowId: string) => {
    const url = getPublicFormUrl(flowId);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <button
          onClick={handleCreateFlow}
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
              onClick={handleCreateFlow}
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
              <div key={flow.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{flow.title || 'Untitled Flow'}</h3>
                    <p className="text-gray-500 text-sm mt-1">{flow.description || 'No description'}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        flow.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : flow.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flow.status === 'draft' ? 'Draft' : flow.status}
                      </span>
                      {/* Show unpublished changes indicator */}
                      {flow.status === 'draft' && flow.publishedAt && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Has unpublished changes
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{getResponseCount(flow.id)} responses</span>
                      <span className="text-sm text-gray-500">Created {formatDate(flow.createdAt)}</span>
                      {flow.updatedAt && flow.updatedAt !== flow.createdAt && (
                        <span className="text-sm text-gray-500">Modified {formatDate(flow.updatedAt)}</span>
                      )}
                    </div>
                    
                    {/* Published form URL */}
                    {flow.status === 'published' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 mb-1">Public Form URL:</p>
                            <code className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded break-all">
                              {getPublicFormUrl(flow.id)}
                            </code>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <button
                              onClick={() => copyFormUrl(flow.id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openPublicForm(flow.id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                              title="Open form in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link 
                      to={`/builder/${flow.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit Draft"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link 
                      to={`/preview/${flow.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Preview Draft"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {flow.status === 'published' && (
                      <Link 
                        to={`/form/${flow.id}`}
                        className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded"
                        title="View Published Form"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    
                    {/* Publish/Unpublish Button */}
                    {flow.status === 'published' ? (
                      <button 
                        onClick={() => handleUnpublishFlow(flow.id)}
                        className="p-2 rounded text-red-400 hover:text-red-600 hover:bg-red-100"
                        title="Unpublish"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePublishFlow(flow.id)}
                        className="p-2 rounded text-blue-400 hover:text-blue-600 hover:bg-blue-100"
                        title="Publish Draft"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDeleteFlow(flow.id, flow.title)}
                      className="p-2 rounded text-red-400 hover:text-red-600 hover:bg-red-100"
                      title="Delete Flow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
