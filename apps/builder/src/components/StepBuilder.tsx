import { useState } from 'react';
import { Plus, Trash2, Move } from 'lucide-react';

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

interface Step {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  loop?: {
    enabled: boolean;
    sourceFieldId?: string;
    minCount?: number;
    maxCount?: number;
    labelTemplate?: string;
  };
}

interface StepBuilderProps {
  steps: Step[];
  selectedStepId: string | null;
  onStepsChange: (steps: Step[]) => void;
  onSelectStep: (stepId: string | null) => void;
}

export function StepBuilder({ steps, selectedStepId, onStepsChange, onSelectStep }: StepBuilderProps) {
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;

    const newStep: Step = {
      id: `step_${Date.now()}`,
      title: newStepTitle,
      description: '',
      fields: []
    };

    onStepsChange([...steps, newStep]);
    setNewStepTitle('');
    setShowAddStep(false);
    onSelectStep(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    onStepsChange(updatedSteps);
    
    if (selectedStepId === stepId) {
      onSelectStep(updatedSteps.length > 0 ? updatedSteps[0].id : null);
    }
  };

  const handleUpdateStep = (stepId: string, updates: Partial<Step>) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    onStepsChange(updatedSteps);
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    
    onStepsChange(newSteps);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Form Steps</h3>
          <button
            onClick={() => setShowAddStep(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        {/* Add Step Form */}
        {showAddStep && (
          <div className="mt-3 p-3 bg-white border rounded-lg">
            <input
              type="text"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Step title (e.g., Contact Information)"
              className="w-full px-3 py-2 border rounded text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddStep}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Create Step
              </button>
              <button
                onClick={() => {
                  setShowAddStep(false);
                  setNewStepTitle('');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto">
        {steps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No steps yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Step" to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedStepId === step.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => onSelectStep(step.id)}
              >
                {/* Step Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Step {index + 1}
                      </span>
                      <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                        {step.title}
                        {step.loop?.enabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            🔄 Loop
                          </span>
                        )}
                      </h4>
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    )}
                    {step.loop?.enabled && (
                      <p className="text-xs text-purple-600 mt-1">
                        Loop: {step.loop.labelTemplate || 'Item {index}'} 
                        {step.loop.sourceFieldId && ` (count from field)`}
                      </p>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {step.fields.length} {step.fields.length === 1 ? 'field' : 'fields'}
                    </div>
                  </div>

                  {/* Step Actions */}
                  <div className="flex items-center gap-1 ml-2">
                    {/* Move Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveStep(step.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <Move className="w-3 h-3 rotate-180" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveStep(step.id, 'down');
                      }}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <Move className="w-3 h-3" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete step "${step.title}"?`)) {
                          handleDeleteStep(step.id);
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Field Preview */}
                {step.fields.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {step.fields.slice(0, 3).map((field) => (
                      <div key={field.id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        <span className="font-medium">{field.type.replace('_', ' ')}</span>
                        {': '}
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </div>
                    ))}
                    {step.fields.length > 3 && (
                      <div className="text-xs text-gray-400 px-2">
                        +{step.fields.length - 3} more fields
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Edit for Selected Step */}
                {selectedStepId === step.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded"
                        placeholder="Step title"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <textarea
                        value={step.description || ''}
                        onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                        className="w-full px-2 py-1 text-xs border rounded resize-none"
                        placeholder="Step description (optional)"
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
