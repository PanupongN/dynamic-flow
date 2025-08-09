import React from 'react';
import { Type, Mail, Hash, Circle, Calendar, Upload, GitBranch } from 'lucide-react';

const nodeTypes = [
  { type: 'text_input', label: 'Text Input', icon: Type },
  { type: 'email_input', label: 'Email', icon: Mail },
  { type: 'number_input', label: 'Number', icon: Hash },
  { type: 'single_choice', label: 'Single Choice', icon: Circle },
  { type: 'date_picker', label: 'Date Picker', icon: Calendar },
  { type: 'file_upload', label: 'File Upload', icon: Upload },
  { type: 'conditional', label: 'Conditional', icon: GitBranch },
];

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Components</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <button
            key={node.type}
            onClick={() => onAddNode(node.type)}
            className="w-full flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
          >
            <node.icon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{node.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}