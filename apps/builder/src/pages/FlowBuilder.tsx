import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StepBuilder } from '../components/StepBuilder';
import { FieldBuilder } from '../components/FieldBuilder';
import { LogicBuilder } from '../components/LogicBuilder';
import { PreviewPanel } from '../components/PreviewPanel';
import { useFlowStore } from '../stores/flowStore';
import { Play, Save, Settings, Eye, X, GitBranch } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  logic?: any[];
  loop?: {
    enabled: boolean;
    sourceFieldId?: string; // Field ที่กำหนดจำนวน loop
    minCount?: number;
    maxCount?: number;
    labelTemplate?: string; // เช่น "Guest {index}" หรือ "Item {index}"
  };
}

interface Field {
  id: string;
  type: 'text_input' | 'email_input' | 'number_input' | 'single_choice' | 'multiple_choice' | 'date_picker' | 'file_upload' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: { id: string; label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export function FlowBuilder() {
  const { flowId } = useParams();
  const navigate = useNavigate();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'logic'>('fields');
  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const lastSavedStepsRef = useRef<string>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualOperationRef = useRef<boolean>(false);
  
  const { 
    currentFlow, 
    isLoading,
    error,
    setCurrentFlow,
    createNewFlow
  } = useFlowStore();

  // Convert flow nodes to steps
  const convertNodesToSteps = (nodes: any[]): Step[] => {
    return nodes.map(node => ({
      id: node.id,
      title: node.data?.label || 'Untitled Step',
      description: node.data?.description || '',
      fields: node.data?.questions ? node.data.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        required: q.required || false,
        placeholder: q.placeholder || '',
        options: q.options || undefined,
        validation: q.validation || undefined
      })) : [],
      logic: node.data?.logic || [],
      loop: node.data?.loop || undefined
    }));
  };

  // Convert steps to flow nodes
  const convertStepsToNodes = (steps: Step[]): any[] => {
    return steps.map((step, index) => ({
      id: step.id,
      type: 'flow_step',
      position: { x: 100, y: 100 + (index * 200) },
      data: {
        label: step.title,
        description: step.description,
        required: true,
        questions: step.fields,
        logic: step.logic || [],
        loop: step.loop || undefined
      },
      connections: index < steps.length - 1 ? [{ targetNodeId: steps[index + 1].id }] : []
    }));
  };

  // Load flow when component mounts
  useEffect(() => {
    const loadFlow = async () => {
      if (flowId) {
        try {
          const { flowsApi } = await import('../services/api');
          const flow = await flowsApi.getById(flowId);
          setCurrentFlow(flow);
          
          // Convert flow nodes to steps
          const convertedSteps = convertNodesToSteps(flow.nodes || []);
          setSteps(convertedSteps);
          
          // Initialize the last saved state
          lastSavedStepsRef.current = JSON.stringify(convertedSteps);
          
          // Select first step if available
          if (convertedSteps.length > 0) {
            setSelectedStepId(convertedSteps[0].id);
          }
        } catch (error) {
          console.error('Failed to load flow:', error);
          navigate('/');
        }
      } else {
        await createNewFlow();
      }
    };

    loadFlow();
  }, [flowId, setCurrentFlow, createNewFlow, navigate]);

  // Auto-save when steps change (only if actually changed)
  useEffect(() => {
    if (!currentFlow || !flowId || steps.length === 0) return;
    
    // Skip auto-save during manual operations
    if (isManualOperationRef.current) {
      return;
    }

    // Convert steps to JSON string for comparison
    const currentStepsString = JSON.stringify(steps);
    
    // Only auto-save if steps actually changed
    if (currentStepsString === lastSavedStepsRef.current) {
      return;
    }

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      console.log('Auto-saving flow (steps changed)...');
      
      try {
        const { flowsApi } = await import('../services/api');
        
        const cleanFlow = {
          title: currentFlow.title,
          description: currentFlow.description,
          nodes: convertStepsToNodes(steps),
          settings: currentFlow.settings,
          theme: currentFlow.theme,
          status: currentFlow.status
        };
        
        await flowsApi.update(flowId, cleanFlow);
        
        // Update the last saved state only after successful save
        lastSavedStepsRef.current = currentStepsString;
        console.log('Auto-save completed');
        
        // Show success toast if available
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('success', 'Changes saved automatically');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [steps, currentFlow?.title, currentFlow?.description, currentFlow?.settings, currentFlow?.theme, currentFlow?.status, flowId]);

  const handleSave = async () => {
    if (!currentFlow) return;
    
    setIsSaving(true);
    isManualOperationRef.current = true;
    
    try {
      const { flowsApi } = await import('../services/api');
      
      const cleanFlow = {
        title: currentFlow.title,
        description: currentFlow.description,
        nodes: convertStepsToNodes(steps),
        settings: currentFlow.settings,
        theme: currentFlow.theme,
        status: currentFlow.status
      };
      
      const savedFlow = await flowsApi.update(flowId!, cleanFlow);
      
      // Update current flow in store without triggering saves
      setCurrentFlow(savedFlow);
      
      // Update last saved state to prevent unnecessary auto-save
      lastSavedStepsRef.current = JSON.stringify(steps);
      
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
      
      console.log('Manual save completed');
      
      // Show success toast
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('success', 'Flow saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
      
      // Show error toast
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('error', 'Failed to save flow');
      }
    } finally {
      setIsSaving(false);
      isManualOperationRef.current = false;
    }
  };

  const handlePublish = async () => {
    if (!currentFlow) return;
    
    try {
      const { flowsApi } = await import('../services/api');
      
      // First save the current changes
      const cleanFlow = {
        title: currentFlow.title,
        description: currentFlow.description,
        nodes: convertStepsToNodes(steps),
        settings: currentFlow.settings,
        theme: currentFlow.theme,
        status: currentFlow.status
      };
      
      await flowsApi.update(flowId!, cleanFlow);
      
      // Then publish
      const publishedFlow = await flowsApi.publish(flowId!);
      
      // Update current flow
      setCurrentFlow(publishedFlow);
      
      // Update last saved state
      lastSavedStepsRef.current = JSON.stringify(steps);
      
      console.log('Flow published successfully');
      
      // Show success toast
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('success', 'Flow published successfully!');
      }
    } catch (error) {
      console.error('Failed to publish flow:', error);
      
      // Show error toast
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('error', 'Failed to publish flow');
      }
    }
  };

  const handleStepsChange = (newSteps: Step[]) => {
    setSteps(newSteps);
  };

  const handleStepChange = (updatedStep: Step) => {
    const newSteps = steps.map(step => 
      step.id === updatedStep.id ? updatedStep : step
    );
    setSteps(newSteps);
  };

  const selectedStep = steps.find(step => step.id === selectedStepId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close preview
      if (event.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
      
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview, handleSave]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flow...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <p className="text-gray-600">Failed to load flow</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentFlow) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No flow found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {currentFlow.title || 'Untitled Flow'}
          </h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handlePublish}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 text-sm border rounded-md flex items-center gap-2 ${
              showPreview 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Step Builder */}
        <div className="w-80 bg-white border-r border-gray-200">
          <StepBuilder
            steps={steps}
            selectedStepId={selectedStepId}
            onStepsChange={handleStepsChange}
            onSelectStep={(stepId) => {
              setSelectedStepId(stepId);
              setSelectedFieldId(null); // Reset field selection
            }}
          />
        </div>

        {/* Main Area - Field Builder & Logic */}
        <div className="flex-1 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('fields')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fields'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fields & Content
              </button>
              <button
                onClick={() => setActiveTab('logic')}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'logic'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                Logic & Conditions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'fields' ? (
                                 <FieldBuilder
                     step={selectedStep || null}
                     selectedFieldId={selectedFieldId}
                     onStepChange={handleStepChange}
                     onSelectField={setSelectedFieldId}
                     allSteps={steps}
                   />
            ) : (
              <LogicBuilder
                steps={steps}
                selectedStepId={selectedStepId}
                onStepsChange={handleStepsChange}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Preview */}
        {showPreview && (
          <div className="w-96 bg-gray-50 border-l border-gray-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Live Preview</h3>
                    <p className="text-xs text-gray-500 mt-1">See how your form looks • Press ESC to close</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                    title="Close Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <PreviewPanel
                  flow={currentFlow ? {
                    ...currentFlow,
                    nodes: convertStepsToNodes(steps)
                  } : null}
                />
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}