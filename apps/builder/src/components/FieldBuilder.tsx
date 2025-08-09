import { useState } from 'react';
import { Plus, Trash2, Move, Type, Mail, Hash, Calendar, Upload, List, CheckSquare } from 'lucide-react';

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

interface FieldBuilderProps {
  step: Step | null;
  selectedFieldId: string | null;
  onStepChange: (step: Step) => void;
  onSelectField: (fieldId: string | null) => void;
  allSteps?: Step[]; // เพิ่มเพื่อให้เข้าถึง previous steps
}

const FIELD_TYPES = [
  { id: 'text_input', label: 'Text Input', icon: Type, description: 'Single line text' },
  { id: 'textarea', label: 'Text Area', icon: Type, description: 'Multi-line text' },
  { id: 'email_input', label: 'Email', icon: Mail, description: 'Email address' },
  { id: 'number_input', label: 'Number', icon: Hash, description: 'Numeric input' },
  { id: 'date_picker', label: 'Date', icon: Calendar, description: 'Date selection' },
  { id: 'single_choice', label: 'Single Choice', icon: List, description: 'Radio buttons' },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, description: 'Checkboxes' },
  { id: 'file_upload', label: 'File Upload', icon: Upload, description: 'File selection' },
] as const;

export function FieldBuilder({ step, selectedFieldId, onStepChange, onSelectField, allSteps = [] }: FieldBuilderProps) {
  const [showAddField, setShowAddField] = useState(false);
  // const [selectedFieldType, setSelectedFieldType] = useState<string>('');

  if (!step) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">👈</div>
          <p className="text-sm">Select a step to manage fields</p>
        </div>
      </div>
    );
  }

  const handleAddField = (fieldType: string) => {
    const fieldTypeInfo = FIELD_TYPES.find(t => t.id === fieldType);
    if (!fieldTypeInfo) return;

    const newField: Field = {
      id: `field_${Date.now()}`,
      type: fieldType as any,
      label: `New ${fieldTypeInfo.label}`,
      required: false,
      placeholder: '',
      options: ['single_choice', 'multiple_choice'].includes(fieldType) 
        ? [
            { id: 'option1', label: 'Option 1', value: 'option1' },
            { id: 'option2', label: 'Option 2', value: 'option2' }
          ] 
        : undefined
    };

    const updatedStep = {
      ...step,
      fields: [...step.fields, newField]
    };

    onStepChange(updatedStep);
    onSelectField(newField.id);
    setShowAddField(false);
    setSelectedFieldType('');
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedStep = {
      ...step,
      fields: step.fields.filter(field => field.id !== fieldId)
    };
    
    onStepChange(updatedStep);
    
    if (selectedFieldId === fieldId) {
      onSelectField(updatedStep.fields.length > 0 ? updatedStep.fields[0].id : null);
    }
  };

  const handleUpdateField = (fieldId: string, updates: Partial<Field>) => {
    const updatedStep = {
      ...step,
      fields: step.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    };
    
    onStepChange(updatedStep);
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = step.fields.findIndex(field => field.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= step.fields.length) return;

    const newFields = [...step.fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    
    onStepChange({ ...step, fields: newFields });
  };

  const selectedField = step.fields.find(field => field.id === selectedFieldId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Fields</h3>
            <p className="text-xs text-gray-500 mt-1">Step: {step.title}</p>
          </div>
          <button
            onClick={() => setShowAddField(true)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        {/* Loop Configuration */}
        <div className="mt-3 p-3 bg-blue-50 border rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">🔄 Dynamic Loop</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={step.loop?.enabled || false}
                  onChange={(e) => {
                    const newLoop = step.loop || { enabled: false };
                    onStepChange({
                      ...step,
                      loop: { ...newLoop, enabled: e.target.checked }
                    });
                  }}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Loop</span>
              </label>
            </div>

            {step.loop?.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Count Source Field</label>
                  <select
                    value={step.loop.sourceFieldId || ''}
                    onChange={(e) => {
                      onStepChange({
                        ...step,
                        loop: { ...step.loop!, sourceFieldId: e.target.value }
                      });
                    }}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="">Select a number field...</option>
                    {/* Get number fields from current step and all previous steps */}
                    {allSteps
                      .flatMap(s => s.fields)
                      .filter(f => f.type === 'number_input')
                      .map(field => {
                        const stepName = allSteps.find(s => s.fields.includes(field))?.title || 'Unknown Step';
                        return (
                          <option key={field.id} value={field.id}>
                            {stepName}: {field.label}
                          </option>
                        );
                      })
                    }
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose a number field that determines loop count</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Count</label>
                    <input
                      type="number"
                      value={step.loop.minCount || 0}
                      onChange={(e) => {
                        onStepChange({
                          ...step,
                          loop: { ...step.loop!, minCount: parseInt(e.target.value) || 0 }
                        });
                      }}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Count</label>
                    <input
                      type="number"
                      value={step.loop.maxCount || 10}
                      onChange={(e) => {
                        onStepChange({
                          ...step,
                          loop: { ...step.loop!, maxCount: parseInt(e.target.value) || 10 }
                        });
                      }}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Label Template</label>
                  <input
                    type="text"
                    value={step.loop.labelTemplate || 'Item {index}'}
                    onChange={(e) => {
                      onStepChange({
                        ...step,
                        loop: { ...step.loop!, labelTemplate: e.target.value }
                      });
                    }}
                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="e.g., Guest {index}, Item {index}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{index}'} for item number (starts from 1)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Field Selector */}
        {showAddField && (
          <div className="mt-3 p-3 bg-white border rounded-lg">
            <h4 className="text-sm font-medium mb-2">Choose Field Type:</h4>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.id}
                    onClick={() => handleAddField(fieldType.id)}
                    className="p-2 border rounded-lg hover:border-green-500 hover:bg-green-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="text-xs font-medium">{fieldType.label}</div>
                        <div className="text-xs text-gray-500">{fieldType.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowAddField(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fields List & Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fields List */}
        <div className="w-1/2 border-r overflow-y-auto">
          {step.fields.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No fields yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Field" to get started</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {step.fields.map((field, index) => {
                const fieldType = FIELD_TYPES.find(t => t.id === field.type);
                const Icon = fieldType?.icon || Type;
                
                return (
                  <div
                    key={field.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedFieldId === field.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => onSelectField(field.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">{field.label}</span>
                          {field.required && <span className="text-red-400 text-xs">*</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {fieldType?.label}
                        </div>
                      </div>

                      {/* Field Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveField(field.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <Move className="w-3 h-3 rotate-180" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveField(field.id, 'down');
                          }}
                          disabled={index === step.fields.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <Move className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete field "${field.label}"?`)) {
                              handleDeleteField(field.id);
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Field Editor */}
        <div className="w-1/2 overflow-y-auto">
          {selectedField ? (
            <FieldEditor
              field={selectedField}
              onUpdate={(updates) => handleUpdateField(selectedField.id, updates)}
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">👈</div>
              <p className="text-sm">Select a field to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Field Editor Component
interface FieldEditorProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
}

function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const fieldType = FIELD_TYPES.find(t => t.id === field.type);
  const Icon = fieldType?.icon || Type;

  const handleAddOption = () => {
    const newOption = {
      id: `option_${Date.now()}`,
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option${(field.options?.length || 0) + 1}`
    };
    
    onUpdate({
      options: [...(field.options || []), newOption]
    });
  };

  const handleUpdateOption = (optionId: string, updates: { label?: string; value?: string }) => {
    onUpdate({
      options: field.options?.map(option => 
        option.id === optionId ? { ...option, ...updates } : option
      )
    });
  };

  const handleDeleteOption = (optionId: string) => {
    onUpdate({
      options: field.options?.filter(option => option.id !== optionId)
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Field Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Icon className="w-5 h-5 text-gray-600" />
        <div>
          <h4 className="font-medium">Edit Field</h4>
          <p className="text-xs text-gray-500">{fieldType?.label}</p>
        </div>
      </div>

      {/* Basic Settings */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Label *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter field label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder Text
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label className="ml-2 text-sm text-gray-700">Required field</label>
        </div>
      </div>

      {/* Options for Choice Fields */}
      {(['single_choice', 'multiple_choice'].includes(field.type)) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Options</h5>
            <button
              onClick={handleAddOption}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Add Option
            </button>
          </div>
          
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleUpdateOption(option.id, { 
                    label: e.target.value,
                    value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  })}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Option label"
                />
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation for Number Fields */}
      {field.type === 'number_input' && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Validation</h5>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min Value</label>
              <input
                type="number"
                value={field.validation?.min || ''}
                onChange={(e) => onUpdate({ 
                  validation: { 
                    ...field.validation, 
                    min: e.target.value ? Number(e.target.value) : undefined 
                  } 
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max Value</label>
              <input
                type="number"
                value={field.validation?.max || ''}
                onChange={(e) => onUpdate({ 
                  validation: { 
                    ...field.validation, 
                    max: e.target.value ? Number(e.target.value) : undefined 
                  } 
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
