import { useState } from 'react';
import { Palette, Eye, EyeOff, Check, X, Info } from 'lucide-react';
import { 
  ColorUtils, 
  createAdvancedTheme, 
  generateAdvancedCSSVariables,
  type SemanticColor,
  type AdvancedThemeConfig
} from '../themes/colorSystem';
import { FontFamilySelector } from './FontFamilySelector';

interface ColorSystemConfigProps {
  currentTheme?: AdvancedThemeConfig;
  onThemeChange: (theme: AdvancedThemeConfig) => void;
  className?: string;
}

export function ColorSystemConfig({ currentTheme, onThemeChange, className = '' }: ColorSystemConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeColorType, setActiveColorType] = useState<'primary' | 'warning' | 'negative' | 'information' | 'success'>('primary');
  const [customColors, setCustomColors] = useState({
    primary: currentTheme?.colors.primary.baseColor.hex || '#8A6E4B',
    warning: currentTheme?.colors.warning.baseColor.hex || '#FFAB2E',
    negative: currentTheme?.colors.negative.baseColor.hex || '#EB184E',
    information: currentTheme?.colors.information.baseColor.hex || '#3A9FE8',
    success: currentTheme?.colors.success.baseColor.hex || '#00BD70'
  });
  
  const [selectedFont, setSelectedFont] = useState(
    currentTheme?.typography.fontFamily || 'Inter, system-ui, sans-serif'
  );

  const handleColorChange = (colorType: keyof typeof customColors, hexValue: string) => {
    const newColors = { ...customColors, [colorType]: hexValue };
    setCustomColors(newColors);
    
    generateAndApplyTheme(newColors, selectedFont);
  };

  const handleFontChange = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    generateAndApplyTheme(customColors, fontFamily);
  };

  const generateAndApplyTheme = (colors: typeof customColors, fontFamily: string) => {
    // Generate new theme with updated colors and font
    const newTheme = createAdvancedTheme(
      `custom-${Date.now()}`,
      'Custom Theme',
      colors.primary,
      colors.warning,
      colors.negative,
      colors.information,
      colors.success,
      fontFamily
    );
    
    onThemeChange(newTheme);
  };

  const getAccessibilityBadge = (contrastRatio: number, accessibilityLevel: string) => {
    const levelColors = {
      'AAA': 'bg-green-100 text-green-800 border-green-200',
      'AA': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fail': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded text-xs border ${levelColors[accessibilityLevel as keyof typeof levelColors] || levelColors.Fail}`}>
        {accessibilityLevel === 'AAA' && <Check className="w-3 h-3 mr-1" />}
        {accessibilityLevel === 'AA' && <Check className="w-3 h-3 mr-1" />}
        {accessibilityLevel === 'Fail' && <X className="w-3 h-3 mr-1" />}
        {accessibilityLevel} {contrastRatio.toFixed(2)}
      </div>
    );
  };

  const ColorVariationDisplay = ({ semanticColor }: { semanticColor: SemanticColor }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{semanticColor.name} Colors</h4>
        <div className="text-xs text-gray-500">{semanticColor.purpose}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(semanticColor.variations).map(([key, variation]) => (
          <div key={key} className="border rounded-lg p-3">
            {/* Color Preview */}
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-12 h-12 rounded-lg border shadow-sm"
                style={{ backgroundColor: variation.hex }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{variation.name}</div>
                <div className="text-xs text-gray-500">
                  {variation.percentage > 0 ? '+' : ''}{variation.percentage}%
                </div>
                <div className="text-xs font-mono text-gray-600">{variation.hex}</div>
              </div>
            </div>

            {/* Accessibility Info */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                RGBA: {variation.rgba.slice(0, 3).join(', ')}
              </div>
              {variation.contrastRatio && (
                <div>
                  {getAccessibilityBadge(variation.contrastRatio, variation.accessibilityLevel || 'Fail')}
                </div>
              )}
            </div>
            
            {/* Usage Indicator */}
            {key === semanticColor.mostUsed && (
              <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                Most used
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accessibility Notes */}
      {semanticColor.accessibilityNotes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">{semanticColor.accessibilityNotes}</div>
          </div>
        </div>
      )}
    </div>
  );

  const ColorPicker = ({ 
    label, 
    value, 
    onChange
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
  }) => {
    const contrastRatio = ColorUtils.getContrastRatio(value, '#FFFFFF');
    const accessibilityLevel = ColorUtils.getAccessibilityLevel(contrastRatio);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="#000000"
            />
          </div>
          <div>
            {getAccessibilityBadge(contrastRatio, accessibilityLevel)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Advanced Color System</div>
              <div className="text-sm text-gray-500">Design system with accessibility compliance</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentTheme?.accessibility.aaCompliance && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                AA Compliant
              </span>
            )}
            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Color Customization */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Customize Base Colors</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Primary Color"
                value={customColors.primary}
                onChange={(value) => handleColorChange('primary', value)}
              />
              
              <ColorPicker
                label="Warning Color"
                value={customColors.warning}
                onChange={(value) => handleColorChange('warning', value)}
              />
              
              <ColorPicker
                label="Negative/Error Color"
                value={customColors.negative}
                onChange={(value) => handleColorChange('negative', value)}
              />
              
              <ColorPicker
                label="Information Color"
                value={customColors.information}
                onChange={(value) => handleColorChange('information', value)}
              />
              
              <ColorPicker
                label="Success Color"
                value={customColors.success}
                onChange={(value) => handleColorChange('success', value)}
              />
            </div>
          </div>

          {/* Typography Configuration */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Typography</h3>
            <FontFamilySelector
              selectedFont={selectedFont}
              onFontChange={handleFontChange}
            />
          </div>

          {/* Color Variations Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Color Variations & Accessibility</h3>
              <div className="flex space-x-1">
                {(['primary', 'warning', 'negative', 'information', 'success'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveColorType(type)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      activeColorType === type
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {currentTheme && (
              <ColorVariationDisplay 
                semanticColor={currentTheme.colors[activeColorType]} 
              />
            )}
          </div>

          {/* Accessibility Summary */}
          {currentTheme && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Accessibility Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  {currentTheme.accessibility.aaCompliance ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span>AA Compliance</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {currentTheme.accessibility.aaaCompliance ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span>AAA Compliance</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Min Contrast: {currentTheme.accessibility.minContrastRatio.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                <p>
                  <strong>AA:</strong> Minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text
                </p>
                <p>
                  <strong>AAA:</strong> Enhanced contrast ratio of 7:1 for normal text, 4.5:1 for large text
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Usage example component
export function ColorSystemPreview({ theme }: { theme: AdvancedThemeConfig }) {
  return (
    <div className="p-4 space-y-4">
      <style dangerouslySetInnerHTML={{ __html: generateAdvancedCSSVariables(theme) }} />
      
      <h3 className="font-medium text-gray-900">Live Preview</h3>
      
      {/* Buttons */}
      <div className="flex space-x-3">
        <button 
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Primary Button
        </button>
        <button 
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: 'var(--color-warning)' }}
        >
          Warning Button
        </button>
        <button 
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: 'var(--color-error)' }}
        >
          Error Button
        </button>
        <button 
          className="px-4 py-2 rounded-md text-white font-medium"
          style={{ backgroundColor: 'var(--color-success)' }}
        >
          Success Button
        </button>
      </div>
      
      {/* Form Elements */}
      <div className="space-y-3">
        <input 
          type="text" 
          placeholder="Input with primary focus color"
          className="w-full px-3 py-2 border rounded-md"
          style={{ 
            borderColor: 'var(--color-border-main)',
            backgroundColor: 'var(--color-background-paper)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-border-main)'}
        />
        
        <div className="p-4 rounded-md" style={{ backgroundColor: 'var(--color-primary-20)' }}>
          <p style={{ color: 'var(--color-text-primary)' }}>
            Background using primary-20 for subtle accent areas
          </p>
        </div>
      </div>
    </div>
  );
}
