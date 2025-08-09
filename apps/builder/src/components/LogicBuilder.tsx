import React, { useState } from 'react';
import { Plus, Trash2, GitBranch, ChevronRight, Settings, Zap } from 'lucide-react';

interface Condition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_empty' | 'is_empty';
  value: string | number;
  logicOperator?: 'AND' | 'OR';
}

interface StepLogic {
  id: string;
  stepId: string;
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
  fields: Field[];
  logic?: StepLogic[];
}

interface Field {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: { id: string; label: string; value: string }[];
}

interface LogicBuilderProps {
  steps: Step[];
  selectedStepId: string | null;
  onStepsChange: (steps: Step[]) => void;
}

const OPERATORS = [
  { id: 'equals', label: 'Equals', description: 'Field value equals specific value' },
  { id: 'not_equals', label: 'Not Equals', description: 'Field value does not equal' },
  { id: 'greater_than', label: 'Greater Than', description: 'Field value is greater than' },
  { id: 'less_than', label: 'Less Than', description: 'Field value is less than' },
  { id: 'contains', label: 'Contains', description: 'Field value contains text' },
  { id: 'not_empty', label: 'Not Empty', description: 'Field has any value' },
  { id: 'is_empty', label: 'Is Empty', description: 'Field is empty/not filled' },
];

const ACTIONS = [
  { id: 'showStep', label: 'Show Step', description: 'Show another step conditionally' },
  { id: 'hideStep', label: 'Hide Step', description: 'Hide a step from the flow' },
  { id: 'jumpToStep', label: 'Jump to Step', description: 'Skip to a specific step' },
  { id: 'setFieldValue', label: 'Set Field Value', description: 'Auto-fill a field in another step' },
  { id: 'showMessage', label: 'Show Message', description: 'Display a custom message' },
];

export function LogicBuilder({ steps, selectedStepId, onStepsChange }: LogicBuilderProps) {
  const [showAddLogic, setShowAddLogic] = useState(false);
  const [editingLogic, setEditingLogic] = useState<StepLogic | null>(null);

  const selectedStep = steps.find(step => step.id === selectedStepId);

  if (!selectedStep) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <GitBranch className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Select a step to add logic</p>
        </div>
      </div>
    );
  }

  const handleAddLogic = () => {
    const newLogic: StepLogic = {
      id: `logic_${Date.now()}`,
      stepId: selectedStep.id,
      conditions: [{
        id: `condition_${Date.now()}`,
        fieldId: selectedStep.fields[0]?.id || '',
        operator: 'equals',
        value: '',
      }],
      actions: {}
    };

    setEditingLogic(newLogic);
    setShowAddLogic(true);
  };

  const handleSaveLogic = () => {
    if (!editingLogic) return;

    const updatedSteps = steps.map(step => {
      if (step.id === selectedStep.id) {
        const existingLogic = step.logic || [];
        const existingIndex = existingLogic.findIndex(l => l.id === editingLogic.id);
        
        if (existingIndex >= 0) {
          existingLogic[existingIndex] = editingLogic;
        } else {
          existingLogic.push(editingLogic);
        }

        return {
          ...step,
          logic: existingLogic
        };
      }
      return step;
    });

    onStepsChange(updatedSteps);
    setEditingLogic(null);
    setShowAddLogic(false);
  };

  const handleDeleteLogic = (logicId: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === selectedStep.id) {
        return {
          ...step,
          logic: (step.logic || []).filter(l => l.id !== logicId)
        };
      }
      return step;
    });

    onStepsChange(updatedSteps);
  };

  const handleEditLogic = (logic: StepLogic) => {
    setEditingLogic({ ...logic });
    setShowAddLogic(true);
  };

  const addCondition = () => {
    if (!editingLogic) return;

    const newCondition: Condition = {
      id: `condition_${Date.now()}`,
      fieldId: selectedStep.fields[0]?.id || '',
      operator: 'equals',
      value: '',
      logicOperator: editingLogic.conditions.length > 0 ? 'AND' : undefined
    };

    setEditingLogic({
      ...editingLogic,
      conditions: [...editingLogic.conditions, newCondition]
    });
  };

  const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
    if (!editingLogic) return;

    setEditingLogic({
      ...editingLogic,
      conditions: editingLogic.conditions.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!editingLogic) return;

    setEditingLogic({
      ...editingLogic,
      conditions: editingLogic.conditions.filter(c => c.id !== conditionId)
    });
  };

  const getAvailableFields = () => {
    return steps.flatMap(step => 
      step.fields.map(field => ({
        stepTitle: step.title,
        stepId: step.id,
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type
      }))
    );
  };

  const getFieldOptions = (fieldId: string) => {
    const field = steps.flatMap(s => s.fields).find(f => f.id === fieldId);
    return field?.options || [];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Logic & Conditions
            </h3>
            <p className="text-xs text-gray-500 mt-1">Step: {selectedStep.title}</p>
          </div>
          <button
            onClick={handleAddLogic}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Logic
          </button>
        </div>
      </div>

      {/* Logic Rules List */}
      <div className="flex-1 overflow-y-auto">
        {(!selectedStep.logic || selectedStep.logic.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium mb-1">No logic rules yet</p>
            <p className="text-xs text-gray-400 mb-4">Add conditions to create dynamic forms</p>
            
            <div className="text-left space-y-2 bg-blue-50 p-4 rounded-lg">
              <h4 className="text-xs font-medium text-blue-900">Examples:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Show guest details if guest count &gt; 0</div>
                <div>• Jump to thank you if registration complete</div>
                <div>• Hide optional steps based on preferences</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {selectedStep.logic.map((logic, index) => (
              <div key={logic.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                      Rule {index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {logic.conditions.length} condition{logic.conditions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditLogic(logic)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit logic"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteLogic(logic.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Delete logic"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Conditions Preview */}
                <div className="space-y-2 mb-3">
                  {logic.conditions.map((condition, idx) => {
                    const field = steps.flatMap(s => s.fields).find(f => f.id === condition.fieldId);
                    return (
                      <div key={condition.id} className="text-xs bg-gray-50 p-2 rounded flex items-center gap-2">
                        {idx > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
                            {condition.logicOperator}
                          </span>
                        )}
                        <span className="font-medium">{field?.label || 'Unknown field'}</span>
                        <span className="text-gray-500">{condition.operator.replace('_', ' ')}</span>
                        <span className="font-medium">"{condition.value}"</span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions Preview */}
                <div className="space-y-1">
                  {Object.entries(logic.actions).map(([actionType, actionValue]) => (
                    <div key={actionType} className="text-xs text-gray-600 flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-green-500" />
                      <span className="capitalize">{actionType.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className="font-medium">
                        {typeof actionValue === 'object' ? JSON.stringify(actionValue) : actionValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logic Editor Modal */}
      {showAddLogic && editingLogic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900">
                {editingLogic.id.includes('logic_') ? 'Add Logic Rule' : 'Edit Logic Rule'}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-6">
              {/* Conditions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Conditions</h4>
                  <button
                    onClick={addCondition}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Condition
                  </button>
                </div>

                <div className="space-y-3">
                  {editingLogic.conditions.map((condition, index) => (
                    <div key={condition.id} className="border rounded-lg p-3 bg-gray-50">
                      {index > 0 && (
                        <div className="mb-3">
                          <select
                            value={condition.logicOperator}
                            onChange={(e) => updateCondition(condition.id, { 
                              logicOperator: e.target.value as 'AND' | 'OR' 
                            })}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-3">
                        {/* Field Selection */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Field</label>
                          <select
                            value={condition.fieldId}
                            onChange={(e) => updateCondition(condition.id, { fieldId: e.target.value })}
                            className="w-full text-sm border rounded px-2 py-1"
                          >
                            <option value="">Select field</option>
                            {getAvailableFields().map(field => (
                              <option key={field.fieldId} value={field.fieldId}>
                                {field.stepTitle}: {field.fieldLabel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Operator Selection */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Operator</label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(condition.id, { 
                              operator: e.target.value as any 
                            })}
                            className="w-full text-sm border rounded px-2 py-1"
                          >
                            {OPERATORS.map(op => (
                              <option key={op.id} value={op.id}>{op.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Value Input */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Value</label>
                          {condition.operator === 'not_empty' || condition.operator === 'is_empty' ? (
                            <div className="text-sm text-gray-500 py-1">No value needed</div>
                          ) : (
                            <>
                              {getFieldOptions(condition.fieldId).length > 0 ? (
                                <select
                                  value={condition.value}
                                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                  className="w-full text-sm border rounded px-2 py-1"
                                >
                                  <option value="">Select value</option>
                                  {getFieldOptions(condition.fieldId).map(option => (
                                    <option key={option.id} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={condition.value}
                                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                  className="w-full text-sm border rounded px-2 py-1"
                                  placeholder="Enter value"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {editingLogic.conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(condition.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-700"
                        >
                          Remove condition
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                <div className="space-y-3">
                  {/* Show/Hide Step */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Show Step</label>
                      <select
                        value={editingLogic.actions.showStep || ''}
                        onChange={(e) => setEditingLogic({
                          ...editingLogic,
                          actions: { ...editingLogic.actions, showStep: e.target.value }
                        })}
                        className="w-full text-sm border rounded px-2 py-1"
                      >
                        <option value="">None</option>
                        {steps.filter(s => s.id !== selectedStep.id).map(step => (
                          <option key={step.id} value={step.id}>{step.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Jump to Step</label>
                      <select
                        value={editingLogic.actions.jumpToStep || ''}
                        onChange={(e) => setEditingLogic({
                          ...editingLogic,
                          actions: { ...editingLogic.actions, jumpToStep: e.target.value }
                        })}
                        className="w-full text-sm border rounded px-2 py-1"
                      >
                        <option value="">None</option>
                        {steps.filter(s => s.id !== selectedStep.id).map(step => (
                          <option key={step.id} value={step.id}>{step.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Show Message */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Show Message</label>
                    <input
                      type="text"
                      value={editingLogic.actions.showMessage || ''}
                      onChange={(e) => setEditingLogic({
                        ...editingLogic,
                        actions: { ...editingLogic.actions, showMessage: e.target.value }
                      })}
                      className="w-full text-sm border rounded px-2 py-1"
                      placeholder="Custom message to display"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddLogic(false);
                  setEditingLogic(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLogic}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save Logic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
