import React from 'react';

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    required?: boolean;
  };
  connections: any[];
}

interface FlowCanvasProps {
  nodes: FlowNode[];
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId: string | null;
  onNodeUpdate: (nodeId: string, updates: Partial<FlowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
}

export function FlowCanvas({ 
  nodes, 
  onNodeSelect, 
  selectedNodeId,
  onNodeUpdate,
  onNodeDelete 
}: FlowCanvasProps) {
  return (
    <div 
      className="w-full h-full bg-gray-50 relative overflow-auto"
      style={{ minHeight: '600px' }}
    >
      <div className="absolute inset-0 bg-gray-100 opacity-50">
        {/* Grid background */}
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute bg-white border-2 rounded-lg p-4 cursor-pointer shadow-sm min-w-64 max-w-80 ${
            selectedNodeId === node.id 
              ? 'border-blue-500 shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{
            left: node.position.x,
            top: node.position.y,
          }}
          onClick={() => onNodeSelect(node.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{node.data.label}</h4>
              <p className="text-sm text-gray-500 capitalize">
                {node.type.replace('_', ' ')}
              </p>
              {node.data.description && (
                <p className="text-xs text-gray-400 mt-1">{node.data.description}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNodeDelete(node.id);
              }}
              className="text-red-500 hover:text-red-700 text-sm ml-2"
            >
              ✕
            </button>
          </div>

          {/* Questions Preview for flow_step */}
          {node.type === 'flow_step' && node.data.questions && (
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-gray-500 mb-1">
                {node.data.questions.length} question{node.data.questions.length !== 1 ? 's' : ''}
                {node.data.repeatable && ' (Repeatable)'}
              </p>
              <div className="space-y-1">
                {node.data.questions.slice(0, 3).map((q: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600 truncate">
                    • {q.label} {q.required && '*'}
                  </div>
                ))}
                {node.data.questions.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{node.data.questions.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conditional Logic Indicator */}
          {node.connections && node.connections.some((conn: any) => conn.condition) && (
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
              <span className="text-xs text-orange-600">Conditional</span>
            </div>
          )}
          
          {/* Connection points */}
          {node.connections.length > 0 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
        </div>
      ))}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">Start building your flow</p>
            <p className="text-gray-400 text-sm">Click components from the palette to add them</p>
          </div>
        </div>
      )}
    </div>
  );
}