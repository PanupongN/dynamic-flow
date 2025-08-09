import React from 'react';
import { Type } from 'lucide-react';

interface FontOption {
  value: string;
  label: string;
  preview: string;
  category: 'thai' | 'sans-serif' | 'serif' | 'system';
}

interface FontFamilySelectorProps {
  selectedFont: string;
  onFontChange: (fontFamily: string) => void;
  className?: string;
}

const fontOptions: FontOption[] = [
  // System Fonts
  {
    value: 'Inter, system-ui, sans-serif',
    label: 'Inter (Default)',
    preview: 'Inter',
    category: 'system'
  },
  {
    value: 'system-ui, -apple-system, sans-serif',
    label: 'System UI',
    preview: 'System',
    category: 'system'
  },
  
  // Thai Fonts
  {
    value: 'Noto Sans Thai, Inter, system-ui, sans-serif',
    label: 'Noto Sans Thai',
    preview: 'นoto Sans Thai',
    category: 'thai'
  },
  {
    value: 'Kanit, Inter, system-ui, sans-serif',
    label: 'Kanit',
    preview: 'Kanit กันต์',
    category: 'thai'
  },
  {
    value: 'Prompt, Inter, system-ui, sans-serif',
    label: 'Prompt',
    preview: 'Prompt พร้อมท์',
    category: 'thai'
  },
  {
    value: 'Sarabun, Inter, system-ui, sans-serif',
    label: 'Sarabun',
    preview: 'Sarabun สารบุญ',
    category: 'thai'
  },
  
  // Sans-serif Fonts
  {
    value: 'Roboto, sans-serif',
    label: 'Roboto',
    preview: 'Roboto',
    category: 'sans-serif'
  },
  {
    value: 'Open Sans, sans-serif',
    label: 'Open Sans',
    preview: 'Open Sans',
    category: 'sans-serif'
  },
  {
    value: 'Poppins, sans-serif',
    label: 'Poppins',
    preview: 'Poppins',
    category: 'sans-serif'
  },
  {
    value: 'Lato, sans-serif',
    label: 'Lato',
    preview: 'Lato',
    category: 'sans-serif'
  },
  
  // Serif Fonts
  {
    value: 'Georgia, serif',
    label: 'Georgia',
    preview: 'Georgia',
    category: 'serif'
  },
  {
    value: 'Times New Roman, serif',
    label: 'Times New Roman',
    preview: 'Times',
    category: 'serif'
  },
  {
    value: 'Playfair Display, serif',
    label: 'Playfair Display',
    preview: 'Playfair',
    category: 'serif'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'thai': return '🇹🇭';
    case 'serif': return '📖';
    case 'sans-serif': return '🔤';
    case 'system': return '⚙️';
    default: return '📝';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'thai': return 'bg-blue-50 text-blue-700';
    case 'serif': return 'bg-amber-50 text-amber-700';
    case 'sans-serif': return 'bg-green-50 text-green-700';
    case 'system': return 'bg-gray-50 text-gray-700';
    default: return 'bg-gray-50 text-gray-700';
  }
};

export function FontFamilySelector({ selectedFont, onFontChange, className = '' }: FontFamilySelectorProps) {
  const selectedOption = fontOptions.find(option => option.value === selectedFont) || fontOptions[0];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Font Family</label>
      </div>
      
      <div className="space-y-2">
        <select
          value={selectedFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Font Preview */}
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Preview:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(selectedOption.category)}`}>
              {getCategoryIcon(selectedOption.category)} {selectedOption.category}
            </span>
          </div>
          
          <div 
            className="text-lg font-medium text-gray-900"
            style={{ fontFamily: selectedFont }}
          >
            {selectedOption.preview}
          </div>
          
          <div 
            className="text-sm text-gray-600 mt-1"
            style={{ fontFamily: selectedFont }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
          
          <div 
            className="text-sm text-gray-600 mt-1"
            style={{ fontFamily: selectedFont }}
          >
            สวัสดีครับ ยินดีต้อนรับสู่ระบบ Dynamic Flow
          </div>
        </div>
        
        {/* Font Stack Display */}
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <strong>Font Stack:</strong> {selectedFont}
        </div>
      </div>
    </div>
  );
}
