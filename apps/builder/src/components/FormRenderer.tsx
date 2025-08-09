import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { submitFormResponse } from '../services/api';
import {
  Flow,
  FlowNode,
  Question,
  ValidationRule,
  evaluateStepVisibility,
  evaluateFieldLogic,
  generateLoopedSteps
} from '../utils/formLogic';

// Additional types for FormRenderer component
interface FormStep {
  id: string;
  node: FlowNode;
  loopIndex?: number;
  isVisible: boolean;
}

interface FormResponse {
  flowId: string;
  responses: Array<{
    nodeId: string;
    questionId: string;
    value: any;
    type: string;
  }>;
  submittedAt: string;
}

interface FormRendererProps {
  flow: Flow;
  isPreview?: boolean; // Added for preview mode
  onSubmit?: (data: any) => void; // Custom submit handler for preview
}

export function FormRenderer({ flow, isPreview = false, onSubmit }: FormRendererProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formSteps, setFormSteps] = useState<FormStep[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]); // Track navigation path
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { 
    control, 
    handleSubmit, 
    watch, 
    trigger, 
    formState: { errors } 
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const watchedValues = watch();

  // Process flow nodes into form steps
  useEffect(() => {
    if (!flow.nodes || flow.nodes.length === 0) return;

    const flowStepNodes = flow.nodes.filter(node => node.type === 'flow_step');
    
    let dynamicSteps: FormStep[] = [];
    
    // Generate steps including looped instances
    flowStepNodes.forEach(node => {
      if (node.data.loop?.enabled && node.data.loop.sourceFieldId) {
        // Generate looped steps
        const loopedSteps = generateLoopedSteps(node, watchedValues);
        loopedSteps.forEach((loopedNode, index) => {
          dynamicSteps.push({
            id: loopedNode.id,
            node: loopedNode,
            loopIndex: index,
            isVisible: true
          });
        });
      } else {
        // Regular step
        dynamicSteps.push({
          id: node.id,
          node,
          isVisible: true
        });
      }
    });
    
    // Apply step visibility logic
    const updatedSteps = dynamicSteps.map((step, index) => {
      if (index === 0) return { ...step, isVisible: true };
      
      const isVisible = evaluateStepVisibility(step.node.id, flow, watchedValues);
      
      return { ...step, isVisible };
    });
    
    // Only update if there's an actual change
    const hasChanges = JSON.stringify(updatedSteps) !== JSON.stringify(formSteps);
    
    if (hasChanges && updatedSteps.length > 0) {
      setFormSteps(updatedSteps);
    }
  }, [watchedValues, flow.nodes]);

  // Get visible steps
  const visibleSteps = formSteps.filter(step => step.isVisible);
  const currentStep = visibleSteps[currentStepIndex];

  // Handle navigation
  const handleNext = async () => {
    if (!currentStep) return;

    // Get field names for current step for validation
    const fieldNames = currentStep.node.data.questions?.map(q => q.id) || [];
    
    // Trigger validation for current step
    const isValid = await trigger(fieldNames);
    
    if (!isValid) {
      // Scroll to first error
      const firstError = Object.keys(errors).find(key => fieldNames.includes(key));
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Check for logic-based navigation
    if (currentStep.node.data.logic) {
      for (const rule of currentStep.node.data.logic) {
        const conditionsMet = rule.conditions.every(condition => {
          const fieldValue = watchedValues[condition.fieldId];
          
          switch (condition.operator) {
            case 'equals':
              return fieldValue === condition.value;
            case 'not_equals':
              return fieldValue !== condition.value;
            case 'contains':
              return fieldValue && fieldValue.toString().includes(condition.value);
            case 'greater_than':
              return fieldValue && Number(fieldValue) > Number(condition.value);
            case 'less_than':
              return fieldValue && Number(fieldValue) < Number(condition.value);
            default:
              return true;
          }
        });
        
        if (conditionsMet && rule.actions?.jumpToStep) {
          // Find target step in all steps first
          const targetStep = formSteps.find(step => step.node.id === rule.actions.jumpToStep);
          
          if (targetStep && targetStep.isVisible) {
            // Find the index in visible steps
            const targetStepIndex = visibleSteps.findIndex(
              step => step.node.id === rule.actions.jumpToStep
            );
            if (targetStepIndex !== -1) {
              setCurrentStepIndex(targetStepIndex);
              // Add to navigation history for proper back navigation
              setNavigationHistory(prev => [...prev, targetStepIndex]);
              return;
            }
          } else {
            // If target step is not visible, continue to next visible step
            console.warn(`Jump target step "${rule.actions.jumpToStep}" is not visible, continuing to next step`);
          }
        }
      }
    }

    // Normal navigation to next step
    if (currentStepIndex < visibleSteps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      // Add to navigation history for proper back navigation
      setNavigationHistory(prev => [...prev, nextStepIndex]);
    } else {
      // Last step - submit form
      handleSubmit(onFormSubmit)();
    }
  };

  const handlePrev = () => {
    if (navigationHistory.length > 1) {
      // Remove current step from history and go to previous step in history
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current step
      const previousStepIndex = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentStepIndex(previousStepIndex);
    }
  };

  // Form submission
  const onFormSubmit = async (data: any) => {
    if (isPreview && onSubmit) {
      // Preview mode - use custom handler
      onSubmit(data);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert form data to response format
      const responses = Object.entries(data).map(([questionId, value]) => {
        // Find the question to get its type and node
        let questionType = 'text_input';
        let nodeId = '';
        
        for (const node of flow.nodes) {
          if (node.data.questions) {
            const question = node.data.questions.find(q => q.id === questionId);
            if (question) {
              questionType = question.type;
              nodeId = node.id;
              break;
            }
          }
        }
        
        return {
          nodeId,
          questionId,
          value,
          type: questionType
        };
      });

      const responseData: FormResponse = {
        flowId: flow.id,
        responses,
        submittedAt: new Date().toISOString()
      };

      await submitFormResponse(responseData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission failed:', error);
      setSubmitError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key behavior
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStepIndex === visibleSteps.length - 1) {
        // Last step - submit
        handleSubmit(onFormSubmit)();
      } else {
        // Navigate to next step
        handleNext();
      }
    }
  };

  // Render individual question
  const renderQuestion = (question: Question) => {
    const { id, type, label, description, required, options, validation } = question;

    // Evaluate field logic using shared utility
    const fieldLogic = evaluateFieldLogic(id, flow, watchedValues);
    const show = fieldLogic.show;
    const isFieldRequired = required || fieldLogic.required;

    // Don't render if logic says to hide
    if (!show) {
      return null;
    }

    const fieldProps = {
      name: id,
      control,
      rules: {
        required: isFieldRequired ? {
          value: true,
          message: `${label} is required`
        } : false,
        ...getValidationRules(validation || [])
      }
    };

    // Render different input types
    return (
      <div className="mb-6" key={id}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {isFieldRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mb-2">{description}</p>
        )}
        <Controller
          {...fieldProps}
          render={({ field, fieldState }) => {
            switch (type) {
              case 'text_input':
                return (
                  <div>
                    <input
                      {...field}
                      type="text"
                      placeholder={question.placeholder}
                      onKeyDown={handleInputKeyDown}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'email_input':
                return (
                  <div>
                    <input
                      {...field}
                      type="email"
                      placeholder={question.placeholder}
                      onKeyDown={handleInputKeyDown}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'number_input':
                return (
                  <div>
                    <input
                      {...field}
                      type="number"
                      placeholder={question.placeholder}
                      onKeyDown={handleInputKeyDown}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'single_choice':
                return (
                  <div>
                    <div className="space-y-2">
                      {options?.map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name={id}
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'multiple_choice':
                return (
                  <div>
                    <div className="space-y-2">
                      {options?.map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={Array.isArray(field.value) ? field.value.includes(option.value) : false}
                            onChange={(e) => {
                              const currentValues = Array.isArray(field.value) ? field.value : [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, option.value]);
                              } else {
                                field.onChange(currentValues.filter(v => v !== option.value));
                              }
                            }}
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'date_picker':
                return (
                  <div>
                    <input
                      {...field}
                      type="date"
                      onKeyDown={handleInputKeyDown}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'file_upload':
                return (
                  <div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              case 'textarea':
                return (
                  <div>
                    <textarea
                      {...field}
                      placeholder={question.placeholder}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                );

              default:
                return <div>Unsupported field type: {type}</div>;
            }
          }}
        />
      </div>
    );
  };

  // Validation rules helper
  const getValidationRules = (validationRules: ValidationRule[]) => {
    const rules: any = {};
    
    validationRules.forEach(rule => {
      switch (rule.type) {
        case 'min_length':
          rules.minLength = {
            value: rule.value,
            message: rule.message
          };
          break;
        case 'max_length':
          rules.maxLength = {
            value: rule.value,
            message: rule.message
          };
          break;
        case 'email':
          rules.pattern = {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: rule.message
          };
          break;
        case 'url':
          rules.pattern = {
            value: /^https?:\/\/.+/,
            message: rule.message
          };
          break;
        case 'regex':
          rules.pattern = {
            value: new RegExp(rule.value),
            message: rule.message
          };
          break;
      }
    });
    
    return rules;
  };

  // Show thank you message after submission
  if (isSubmitted && !isPreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  // Show error if no steps available
  if (visibleSteps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Form Steps Available</h1>
          <p className="text-gray-600">This form doesn't have any available steps to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isPreview ? 'p-4' : 'flex items-center justify-center p-4'}`}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStepIndex + 1} of {visibleSteps.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        {currentStep && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStep.node.data.label}
            </h1>
            {currentStep.node.data.description && (
              <p className="text-gray-600 mb-6">{currentStep.node.data.description}</p>
            )}

            {/* Render questions */}
            {currentStep.node.data.questions?.map((question: Question) => 
              renderQuestion(question)
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={navigationHistory.length <= 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStepIndex === visibleSteps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit(onFormSubmit)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}
