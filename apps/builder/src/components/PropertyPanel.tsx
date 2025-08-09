import React from 'react';

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    required?: boolean;
    description?: string;
  };
  connections: any[];
}

interface PropertyPanelProps {
  nodeId: string;
  node?: FlowNode;
  onUpdate: (nodeId: string, updates: Partial<FlowNode>) => void;
}

export function PropertyPanel({ nodeId, node, onUpdate }: PropertyPanelProps) {
  if (!node) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Select a node to edit properties</p>
      </div>
    );
  }

  const handleLabelChange = (label: string) => {
    onUpdate(nodeId, {
      data: { ...node.data, label }
    });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate(nodeId, {
      data: { ...node.data, description }
    });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate(nodeId, {
      data: { ...node.data, required }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question/Label
            </label>
            <input
              type="text"
              value={node.data.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question or label"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={node.data.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add a description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={node.data.required || false}
              onChange={(e) => handleRequiredChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
              Required field
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Node Type</h4>
        <p className="text-sm text-gray-600 capitalize">
          {node.type.replace('_', ' ')}
        </p>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Position</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500">X</label>
            <input
              type="number"
              value={node.position.x}
              onChange={(e) => onUpdate(nodeId, {
                position: { ...node.position, x: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Y</label>
            <input
              type="number"
              value={node.position.y}
              onChange={(e) => onUpdate(nodeId, {
                position: { ...node.position, y: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
