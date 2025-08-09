import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Condition {
  id: string;
  fieldId: string;
  operator: string;
  value: string;
  logicOperator?: 'AND' | 'OR';
}

interface StepLogic {
  id: string;
  conditions: Condition[];
  actions: {
    showStep?: string;
    hideStep?: string;
    jumpToStep?: string;
    showField?: string;
    hideField?: string;
  };
}

interface Step {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  logic?: StepLogic[];
  loop?: {
    enabled: boolean;
    sourceFieldId?: string;
    minCount?: number;
    maxCount?: number;
    labelTemplate?: string;
  };
}

interface Flow {
  id: string;
  title: string;
  nodes: any[];
  theme?: any;
}

interface PreviewPanelProps {
  flow: Flow | null;
  onClose?: () => void;
}

export function PreviewPanel({ flow, onClose }: PreviewPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [guestData, setGuestData] = useState<any[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);

  if (!flow) return null;

  // Filter flow_step nodes and sort by their connections
  const flowSteps = flow.nodes.filter(node => node.type === 'flow_step');
  
  // Convert nodes to steps for logic processing
  const steps: Step[] = flowSteps.map(node => ({
    id: node.id,
    title: node.data?.label || 'Untitled Step',
    description: node.data?.description || '',
    fields: node.data?.questions || [],
    logic: node.data?.logic || [],
    loop: node.data?.loop || undefined
  }));

  // Update visible steps when form data changes
  useEffect(() => {
    const evaluateStepVisibility = () => {
      const visible: string[] = [];
      
      for (const step of steps) {
        let shouldShow = true; // Default to show
        
        if (step.logic && step.logic.length > 0) {
          for (const logic of step.logic) {
            const conditionsMet = evaluateConditions(logic.conditions);
            
            if (conditionsMet) {
              // Apply actions
              if (logic.actions.hideStep && logic.actions.hideStep === step.id) {
                shouldShow = false;
              }
              if (logic.actions.showStep && logic.actions.showStep === step.id) {
                shouldShow = true;
              }
            }
          }
        }
        
        if (shouldShow) {
          visible.push(step.id);
        }
      }
      
      setVisibleSteps(visible);
    };
    
    evaluateStepVisibility();
  }, [formData, steps]);

  // Get currently visible steps
  const getVisibleSteps = () => {
    return flowSteps.filter(step => visibleSteps.includes(step.id));
  };

  // Evaluate conditions based on current form data
  const evaluateConditions = (conditions: Condition[]): boolean => {
    if (conditions.length === 0) return true;
    
    let result = evaluateCondition(conditions[0]);
    
    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = evaluateCondition(condition);
      
      if (condition.logicOperator === 'OR') {
        result = result || conditionResult;
      } else { // AND (default)
        result = result && conditionResult;
      }
    }
    
    return result;
  };

  const evaluateCondition = (condition: Condition): boolean => {
    const fieldValue = formData[condition.fieldId];
    const conditionValue = condition.value;
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue || '').toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue || '').toLowerCase().includes(String(conditionValue).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(conditionValue);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(conditionValue);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  };

  // Check if a field should be visible based on logic
  const isFieldVisible = (fieldId: string): boolean => {
    const currentStepData = steps.find(s => s.id === currentStep?.id);
    if (!currentStepData || !currentStepData.logic) return true;
    
    let isVisible = true; // Default to visible
    
    for (const logic of currentStepData.logic) {
      const conditionsMet = evaluateConditions(logic.conditions);
      
      if (conditionsMet) {
        if (logic.actions.hideField === fieldId) {
          isVisible = false;
        }
        if (logic.actions.showField === fieldId) {
          isVisible = true;
        }
      }
    }
    
    return isVisible;
  };

  const visibleFlowSteps = getVisibleSteps();
  const currentStep = visibleFlowSteps[currentStepIndex];
  
  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleGuestDataChange = (guestIndex: number, questionId: string, value: any) => {
    setGuestData(prev => {
      const updated = [...prev];
      if (!updated[guestIndex]) {
        updated[guestIndex] = {};
      }
      updated[guestIndex][questionId] = value;
      return updated;
    });
  };

  // Handle loop data change - store in formData with index suffix
  const handleLoopDataChange = (loopIndex: number, questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [`${questionId}_${loopIndex}`]: value
    }));
  };

  const canProceed = () => {
    if (!currentStep) return false;
    
    const currentStepData = steps.find(s => s.id === currentStep.id);
    
    // Check if this is a loop step
    if (currentStepData?.loop?.enabled) {
      const loopCount = getLoopCount(currentStepData);
      
      // Check all required questions for all loop iterations
      for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {
        const allValid = currentStep.data.questions.every((q: any) => {
          if (!q.required || !isFieldVisible(q.id)) return true;
          const value = formData[`${q.id}_${loopIndex}`];
          return value !== undefined && value !== '' && value !== null;
        });
        
        if (!allValid) return false;
      }
      
      return true;
    }
    
    // Check regular questions or old guest system
    return currentStep.data.questions.every((q: any) => {
      if (!q.required || !isFieldVisible(q.id)) return true;
      
      if (currentStep.data.repeatable) {
        // Old guest system
        const guestCount = getNumberOfGuests();
        for (let i = 0; i < guestCount; i++) {
          const value = guestData[i]?.[q.id];
          if (!value || value === '') return false;
        }
        return true;
      } else {
        // Regular single field
        const value = formData[q.id];
        return value !== undefined && value !== '' && value !== null;
      }
    });
  };

  const getNumberOfGuests = () => {
    return parseInt(formData['number_of_guests']) || 0;
  };

  // Get loop count for a step
  const getLoopCount = (step: Step): number => {
    if (!step.loop?.enabled || !step.loop.sourceFieldId) {
      return 0;
    }

    const sourceValue = formData[step.loop.sourceFieldId];
    const count = parseInt(sourceValue) || 0;
    
    // Apply min/max constraints
    const minCount = step.loop.minCount || 0;
    const maxCount = step.loop.maxCount || 10;
    
    return Math.min(Math.max(count, minCount), maxCount);
  };

  // Get loop label for a specific iteration
  const getLoopLabel = (step: Step, index: number): string => {
    const template = step.loop?.labelTemplate || 'Item {index}';
    return template.replace('{index}', (index + 1).toString());
  };

  const handleNext = () => {
    // Check for jump actions based on current step logic
    const currentStepData = steps.find(s => s.id === currentStep?.id);
    if (currentStepData && currentStepData.logic) {
      for (const logic of currentStepData.logic) {
        const conditionsMet = evaluateConditions(logic.conditions);
        
        if (conditionsMet && logic.actions.jumpToStep) {
          // Find the target step index
          const targetStepIndex = visibleFlowSteps.findIndex(step => 
            step.id === logic.actions.jumpToStep
          );
          
          if (targetStepIndex !== -1) {
            setCurrentStepIndex(targetStepIndex);
            return;
          }
        }
      }
    }
    
    // Default next behavior
    if (currentStepIndex < visibleFlowSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const renderQuestion = (question: any, indexParam?: number, isLoop?: boolean) => {
    const questionId = question.id;
    let value = '';

    if (indexParam !== undefined) {
      if (isLoop) {
        // For dynamic loops, use indexed formData
        value = formData[`${questionId}_${indexParam}`] || '';
      } else {
        // For old guest data system
        value = guestData[indexParam]?.[questionId] || '';
      }
    } else {
      // Regular single field
      value = formData[questionId] || '';
    }

    const onChange = (newValue: any) => {
      if (indexParam !== undefined) {
        if (isLoop) {
          // For dynamic loops
          handleLoopDataChange(indexParam, questionId, newValue);
        } else {
          // For old guest data system
          handleGuestDataChange(indexParam, questionId, newValue);
        }
      } else {
        // Regular single field
        handleInputChange(questionId, newValue);
      }
    };

    switch (question.type) {
      case 'text_input':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${question.label.toLowerCase()}...`}
          />
        );
      
      case 'email_input':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address..."
          />
        );
      
      case 'number_input':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={question.min || 0}
            max={question.max || 100}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number..."
          />
        );
      
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: any) => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={`${questionId}_${indexParam !== undefined ? (isLoop ? `loop_${indexParam}` : `guest_${indexParam}`) : 'main'}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Type your answer..."
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{flow.title}</h3>
            <p className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {visibleFlowSteps.length}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / visibleFlowSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-6">
          {currentStep && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentStep.data.label}
                </h2>
                {currentStep.data.description && (
                  <p className="text-gray-600 mt-1">{currentStep.data.description}</p>
                )}
              </div>

              {/* Dynamic Loop Questions */}
              {currentStep.data.loop?.enabled ? (
                <div className="space-y-6">
                  {Array.from({ length: getLoopCount(steps.find(s => s.id === currentStep.id)!) }, (_, loopIndex) => (
                    <div key={loopIndex} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {getLoopLabel(steps.find(s => s.id === currentStep.id)!, loopIndex)}
                      </h3>
                      <div className="space-y-4">
                        {currentStep.data.questions
                          .filter((question: any) => isFieldVisible(question.id))
                          .map((question: any) => (
                            <div key={question.id} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {question.label}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              {renderQuestion(question, loopIndex, true)}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Regular Questions */}
                  {!currentStep.data.repeatable && (
                    <div className="space-y-4">
                      {currentStep.data.questions
                        .filter((question: any) => isFieldVisible(question.id))
                        .map((question: any) => (
                          <div key={question.id} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {question.label}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderQuestion(question)}
                          </div>
                        ))
                      }
                    </div>
                  )}

                  {/* Repeatable Questions (for Guests) */}
                  {currentStep.data.repeatable && (
                    <div className="space-y-6">
                      {Array.from({ length: getNumberOfGuests() }, (_, guestIndex) => (
                        <div key={guestIndex} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Guest {guestIndex + 1}
                          </h3>
                          <div className="space-y-4">
                            {currentStep.data.questions
                              .filter((question: any) => isFieldVisible(question.id))
                              .map((question: any) => (
                                <div key={question.id} className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {question.label}
                                    {question.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  {renderQuestion(question, guestIndex, false)}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || currentStepIndex === visibleFlowSteps.length - 1}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStepIndex === visibleFlowSteps.length - 1 ? 'Submit' : 'Next'}
              {currentStepIndex < visibleFlowSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}