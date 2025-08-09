import { X } from 'lucide-react';
import { FormRenderer } from './FormRenderer';
import { Flow } from '../utils/formLogic';

interface PreviewPanelProps {
  flow: Flow | null;
  onClose?: () => void;
}

export function PreviewPanel({ flow, onClose }: PreviewPanelProps) {
  if (!flow) return null;

  const handlePreviewSubmit = (data: any) => {
    console.log('Preview form submitted:', data);
    // In preview mode, just log the data instead of actually submitting
    alert('Form submitted successfully! (Preview mode - no data saved)');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Preview: {flow.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          <FormRenderer 
            flow={flow} 
            isPreview={true} 
            onSubmit={handlePreviewSubmit}
          />
        </div>
      </div>
    </div>
  );
}