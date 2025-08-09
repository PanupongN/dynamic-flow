import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StepBuilder } from '../components/StepBuilder';
import { FieldBuilder } from '../components/FieldBuilder';
import { LogicBuilder } from '../components/LogicBuilder';

import { ThemeSelector, ColorPaletteDisplay } from '../components/ThemeSelector';
import { ColorSystemConfig } from '../components/ColorSystemConfig';
import { createAdvancedTheme, type AdvancedThemeConfig } from '../themes/colorSystem';
import { useFlowStore } from '../stores/flowStore';
import { Play, Save, Settings, Eye, GitBranch } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'fields' | 'logic'>('fields');
  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [editingFlowName, setEditingFlowName] = useState(false);
  const [tempFlowName, setTempFlowName] = useState('');
  const [advancedTheme, setAdvancedTheme] = useState<AdvancedThemeConfig | undefined>();
  
  const { 
    currentFlow, 
    isLoading,
    error,
    setCurrentFlow,
    saveFlow
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
        questions: step.fields.map(field => ({
          ...field,
          // Convert validation object to ValidationRule array format
          validation: field.validation ? convertValidationToRules(field.validation) : []
        })),
        logic: step.logic || [],
        loop: step.loop || undefined
      },
      connections: index < steps.length - 1 ? [{ targetNodeId: steps[index + 1].id }] : []
    }));
  };

  // Helper function to convert validation object to ValidationRule array
  const convertValidationToRules = (validation: { min?: number; max?: number; pattern?: string }) => {
    const rules: any[] = [];
    
    if (validation.min !== undefined) {
      rules.push({
        type: 'min_length',
        value: validation.min,
        message: `Minimum length is ${validation.min} characters`
      });
    }
    
    if (validation.max !== undefined) {
      rules.push({
        type: 'max_length',
        value: validation.max,
        message: `Maximum length is ${validation.max} characters`
      });
    }
    
    if (validation.pattern) {
      rules.push({
        type: 'regex',
        value: validation.pattern,
        message: 'Invalid format'
      });
    }
    
    return rules;
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
          
          // Select first step if available
          if (convertedSteps.length > 0) {
            setSelectedStepId(convertedSteps[0].id);
          }
        } catch (error) {
          console.error('Failed to load flow:', error);
          navigate('/');
        }
      } else {
        // Redirect to dashboard if no flowId provided
        navigate('/');
      }
    };

    loadFlow();
  }, [flowId, setCurrentFlow, navigate]);

  // Auto-save removed - users will manually save changes via "Save Draft" button

  const handleSave = async () => {
    if (!currentFlow) return;
    
    setIsSaving(true);
    
    try {
      const updatedFlow = {
        ...currentFlow,
        nodes: convertStepsToNodes(steps)
      };
      
      await saveFlow(updatedFlow);
      
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

  // Flow name editing functions
  const handleStartEditingFlowName = () => {
    setTempFlowName(currentFlow?.title || '');
    setEditingFlowName(true);
  };

  const handleSaveFlowName = async () => {
    if (!currentFlow || !tempFlowName.trim()) return;
    
    try {
      setIsSaving(true);
      const updatedFlow = { ...currentFlow, title: tempFlowName.trim() };
      
      // Use saveFlow to ensure store and Dashboard are updated
      await saveFlow(updatedFlow);
      setEditingFlowName(false);
      setTempFlowName('');
    } catch (error) {
      console.error('Failed to update flow name:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('error', 'Failed to update flow name');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditingFlowName = () => {
    setEditingFlowName(false);
    setTempFlowName('');
  };

  // Theme handling functions
  const handleThemeChange = async (themeId: string) => {
    if (!currentFlow) return;
    
    try {
      // Ensure theme object structure is correct
      const updatedFlow = { 
        ...currentFlow, 
        theme: { 
          ...currentFlow.theme,
          id: themeId  // Make sure id is properly set
        } 
      };
      
      // Update locally first
      setCurrentFlow(updatedFlow);
      
      // Save to API immediately to persist theme change
      try {
        await saveFlow(updatedFlow);
        
        // Verify the save by refetching the flow
        const { flowsApi } = await import('../services/api');
        const savedFlow = await flowsApi.getById(flowId!);
        
        // Update currentFlow with the verified data
        setCurrentFlow(savedFlow);
      } catch (apiError) {
        console.warn('Failed to save theme to API:', apiError);
      }
      
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  // Advanced theme handling
  const handleAdvancedThemeChange = async (newTheme: AdvancedThemeConfig) => {
    if (!currentFlow) return;
    
    try {
      const updatedFlow = { 
        ...currentFlow, 
        theme: { 
          ...currentFlow.theme,
          id: newTheme.id,
          advanced: newTheme,
          colors: {
            primary: newTheme.colors.primary.baseColor.hex,
            secondary: newTheme.colors.information.baseColor.hex,
            warning: newTheme.colors.warning.baseColor.hex,
            error: newTheme.colors.negative.baseColor.hex,
            success: newTheme.colors.success.baseColor.hex,
            background: newTheme.colors.neutral.white.hex,
            text: newTheme.colors.neutral.gray[900].hex,
            border: newTheme.colors.neutral.gray[300].hex
          },
          typography: {
            fontFamily: newTheme.typography.fontFamily
          }
        } 
      };
      
      // Update locally
      setCurrentFlow(updatedFlow);
      setAdvancedTheme(newTheme);
      
      // Save to API
      try {
        await saveFlow(updatedFlow);
      } catch (apiError) {
        console.warn('Failed to save advanced theme:', apiError);
      }
      
    } catch (error) {
      console.error('Failed to update advanced theme:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

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
              {isSaving ? 'Saving Draft...' : 'Save Draft'}
            </button>
            <Link 
              to={`/preview/${flowId}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <button 
              onClick={handlePublish}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {currentFlow?.status === 'published' ? 'Update Published' : 'Publish'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 border rounded-md flex items-center gap-2 ${
              showSettings 
                ? 'bg-blue-100 border-blue-300 text-blue-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flow Settings</h3>
            
            {/* Flow Name Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flow Name
                  </label>
                  {editingFlowName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tempFlowName}
                        onChange={(e) => setTempFlowName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter flow name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveFlowName();
                          } else if (e.key === 'Escape') {
                            handleCancelEditingFlowName();
                          }
                        }}
                      />
                      <button
                        onClick={handleSaveFlowName}
                        disabled={!tempFlowName.trim() || isSaving}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditingFlowName}
                        className="px-3 py-2 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{currentFlow?.title || 'Untitled Flow'}</span>
                      <button
                        onClick={handleStartEditingFlowName}
                        className="text-blue-600 text-sm hover:text-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-600 text-sm">
                    {currentFlow?.description || 'No description'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentFlow?.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : currentFlow?.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentFlow?.status === 'draft' ? 'Draft' : currentFlow?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Theme Settings Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Themes</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Theme Selection
                  </label>
                  <ThemeSelector
                    selectedThemeId={currentFlow?.theme?.id || 'default'}
                    onThemeChange={handleThemeChange}
                  />

                </div>

                {/* Color Palette Preview */}
                <div>
                  <ColorPaletteDisplay themeId={currentFlow?.theme?.id || 'default'} />
                </div>

                <div className="text-xs text-gray-500">
                  <p>Quick themes for common use cases. For advanced customization, use the Advanced Color System below.</p>
                </div>
              </div>
            </div>

            {/* Advanced Color System */}
            <div className="bg-white rounded-lg mb-4 border border-gray-200">
              <ColorSystemConfig
                currentTheme={advancedTheme || createAdvancedTheme(
                  'default-advanced',
                  'Default Advanced',
                  '#8A6E4B'
                )}
                onThemeChange={handleAdvancedThemeChange}
              />
            </div>
          </div>
        </div>
      )}

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


      </div>


    </div>
  );
}