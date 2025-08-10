import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StepBuilder } from '../components/StepBuilder';
import { FieldBuilder } from '../components/FieldBuilder';
import { LogicBuilder } from '../components/LogicBuilder';

import { ThemeSelector, ColorPaletteDisplay } from '../components/ThemeSelector';
import { ColorSystemConfig } from '../components/ColorSystemConfig';
import { DraftStatusIndicator } from '../components/DraftStatusIndicator';
import { createAdvancedTheme, type AdvancedThemeConfig } from '../themes/colorSystem';
import { useFlowStore } from '../stores/flowStore';
import { Play, Save, Settings, Eye, GitBranch } from 'lucide-react';
import { Flow as SharedFlow } from '@dynamic-flow/types'; // Use Flow type from shared package
import { flowsApi } from '../services/api';

// Use Step and Field types from shared package to avoid conflicts
import { Step, Field } from '@dynamic-flow/types';

export function FlowBuilder() {
  const { flowId } = useParams();
  const navigate = useNavigate();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'fields' | 'logic'>('fields');
  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<import('@dynamic-flow/types').Step[]>([]);
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

  const [publishedFlow, setPublishedFlow] = useState<SharedFlow | null>(null); // เพิ่ม state สำหรับ published flow
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Convert flow nodes to steps
  const convertNodesToSteps = (nodes: any[]): import('@dynamic-flow/types').Step[] => {
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
  const convertStepsToNodes = (steps: import('@dynamic-flow/types').Step[]): any[] => {
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
          setIsLoadingLocal(true);
          setErrorLocal(null);
          
          // Load draft flow for editing
          const flow = await flowsApi.getDraft(flowId);
          // Convert API response to SharedFlow type
          const sharedFlow: SharedFlow = {
            ...flow,
            createdAt: new Date(flow.createdAt),
            updatedAt: new Date(flow.updatedAt),
            publishedAt: flow.publishedAt ? new Date(flow.publishedAt) : undefined,
            theme: {
              ...flow.theme,
              typography: {
                ...flow.theme.typography,
                fontSize: {
                  small: '14px',
                  medium: '16px',
                  large: '18px'
                }
              }
            }
          };
          setCurrentFlow(sharedFlow);
          
          // Convert nodes to steps
          if (flow.nodes && flow.nodes.length > 0) {
            const convertedSteps = convertNodesToSteps(flow.nodes);
            setSteps(convertedSteps as any);
          }
          
          // Set theme
          if (flow.theme?.id) {
            setCurrentTheme(flow.theme.id);
          }
          
          // Set advanced theme if available
          if (flow.theme?.colors?.primary) {
            // Create a simple theme config for now
            const simpleTheme = createAdvancedTheme(
              'custom',
              'Custom Theme',
              flow.theme.colors.primary,
              flow.theme.colors.warning,
              flow.theme.colors.error,
              flow.theme.colors.success,
              flow.theme.colors.success,
              flow.theme.fontFamily || 'Inter'
            );
            setAdvancedTheme(simpleTheme);
          }
        } catch (err) {
          console.error('Error loading flow:', err);
          setErrorLocal(err instanceof Error ? err.message : 'Failed to load flow');
        } finally {
          setIsLoadingLocal(false);
        }
      }
    };

    loadFlow();
  }, [flowId]);

  // Load published flow for comparison
  useEffect(() => {
    const loadPublishedFlow = async () => {
      if (flowId && currentFlow) {
        try {
          // Load published flow for comparison
          const published = await flowsApi.getPublished(flowId);
          // Convert API response to SharedFlow type
          const sharedPublishedFlow: SharedFlow = {
            ...published,
            createdAt: new Date(published.createdAt),
            updatedAt: new Date(published.updatedAt),
            publishedAt: published.publishedAt ? new Date(published.publishedAt) : undefined,
            theme: {
              ...published.theme,
              typography: {
                ...published.theme.typography,
                fontSize: {
                  small: '14px',
                  medium: '16px',
                  large: '18px'
                }
              }
            }
          };
          setPublishedFlow(sharedPublishedFlow);
        } catch (err) {
          // If published version doesn't exist, set to null
          console.log('No published version found for comparison');
          setPublishedFlow(null);
        }
      }
    };

    loadPublishedFlow();
  }, [flowId, currentFlow]);

  // Auto-save removed - users will manually save changes via "Save Draft" button

  const handleSave = async () => {
    if (!currentFlow) return;
    
    setIsSaving(true);
    
    try {
      // Keep the current status (published if it was published)
      // But save changes to draft table for tracking
      const updatedFlow = {
        ...currentFlow,
        nodes: convertStepsToNodes(steps),
        // Don't change status - keep it as published if it was published
        // The backend will handle saving to draft table while maintaining published status
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
      
      // First save current changes to draft, then publish
      const cleanFlow = {
        title: currentFlow.title,
        description: currentFlow.description,
        nodes: convertStepsToNodes(steps),
        settings: currentFlow.settings,
        theme: currentFlow.theme,
        status: 'draft' as const
      };
      
      // Save current changes as draft first
      await flowsApi.update(flowId!, cleanFlow);
      
      // Then publish (this will save current content to published table)
      const publishedFlow = await flowsApi.publish(flowId!);
      
      // Update current flow - convert API response to SharedFlow type
      const sharedFlow: SharedFlow = {
        ...publishedFlow,
        createdAt: new Date(publishedFlow.createdAt),
        updatedAt: new Date(publishedFlow.updatedAt),
        publishedAt: publishedFlow.publishedAt ? new Date(publishedFlow.publishedAt) : undefined,
        theme: {
          ...publishedFlow.theme,
          typography: {
            ...publishedFlow.theme.typography,
            fontSize: {
              small: '14px',
              medium: '16px',
              large: '18px'
            }
          }
        }
      };
      setCurrentFlow(sharedFlow);
      
      // Update steps state with the published flow nodes
      if (publishedFlow.nodes && publishedFlow.nodes.length > 0) {
        const convertedSteps = convertNodesToSteps(publishedFlow.nodes);
        setSteps(convertedSteps as any);
      }
      
      // Reload published flow for comparison
      if (flowId) {
        try {
          const published = await flowsApi.getPublished(flowId);
          const sharedPublishedFlow: SharedFlow = {
            ...published,
            createdAt: new Date(published.createdAt),
            updatedAt: new Date(published.updatedAt),
            publishedAt: published.publishedAt ? new Date(published.publishedAt) : undefined,
            theme: {
              ...published.theme,
              typography: {
                ...published.theme.typography,
                fontSize: {
                  small: '14px',
                  medium: '16px',
                  large: '18px'
                }
              }
            }
          };
          setPublishedFlow(sharedPublishedFlow);
        } catch (err) {
          console.log('No published version found for comparison');
          setPublishedFlow(null);
        }
      }
      
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

  const handleStepsChange = (newSteps: import('@dynamic-flow/types').Step[]) => {
    setSteps(newSteps);
  };

  const handleStepChange = (updatedStep: import('@dynamic-flow/types').Step) => {
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
            <button 
              onClick={() => window.open(`http://localhost:3003/preview/${flowId}`, '_blank')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
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

      {/* Draft Status Indicator */}
      <DraftStatusIndicator currentFlow={currentFlow} publishedFlow={publishedFlow} />

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