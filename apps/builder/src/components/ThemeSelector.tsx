import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { getAllThemes, CompanyTheme } from '../themes';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
}

export function ThemeSelector({ selectedThemeId, onThemeChange, className = '' }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const themes = getAllThemes();
  
  // Handle different theme ID formats
  let actualThemeId = selectedThemeId;
  if (!actualThemeId || actualThemeId === 'undefined') {
    actualThemeId = 'default';
  }
  
  const selectedTheme = themes.find(t => t.id === actualThemeId) || themes[0];



  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    setIsOpen(false);
    setPreviewTheme(null);
  };

  const ColorSwatch = ({ color, label, size = 'sm' }: { color: string; label?: string; size?: 'sm' | 'md' }) => (
    <div className="flex items-center space-x-1">
      <div 
        className={`rounded-full ${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'}`}
        style={{ backgroundColor: color }}
        title={label}
      />
      {label && size === 'md' && (
        <span className="text-xs text-gray-600">{label}</span>
      )}
    </div>
  );

  const ThemePreview = ({ theme }: { theme: CompanyTheme }) => (
    <div className="p-3 border rounded-lg" style={{ 
      backgroundColor: theme.colors.background.default,
      borderColor: theme.colors.border.main 
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
          {theme.name}
        </h4>
        <div className="flex space-x-1">
          <ColorSwatch color={theme.colors.primary.main} />
          <ColorSwatch color={theme.colors.secondary.main} />
        </div>
      </div>

      {/* Sample Form Elements */}
      <div className="space-y-2">
        {/* Input */}
        <div>
          <input 
            type="text" 
            placeholder="Sample input field"
            className="w-full px-2 py-1 text-xs rounded"
            style={{
              backgroundColor: theme.colors.background.paper,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.main}`,
              borderRadius: theme.borderRadius.md
            }}
            readOnly
          />
        </div>

        {/* Button */}
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 text-xs rounded"
            style={{
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.primary.contrastText,
              borderRadius: theme.borderRadius.md
            }}
          >
            Primary Button
          </button>
          <button
            className="px-3 py-1 text-xs rounded border"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.primary.main,
              border: `1px solid ${theme.colors.primary.main}`,
              borderRadius: theme.borderRadius.md
            }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Theme Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Palette className="w-5 h-5 text-gray-500" />
          <div className="text-left">
            <div className="font-medium text-gray-900">{selectedTheme.name}</div>
            <div className="text-sm text-gray-500">{selectedTheme.description}</div>
          </div>
          <div className="flex space-x-1">
            <ColorSwatch color={selectedTheme.colors.primary.main} />
            <ColorSwatch color={selectedTheme.colors.secondary.main} />
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme Options Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">Choose Theme</div>
            
            {themes.map((theme) => (
              <div key={theme.id} className="mb-2">
                <button
                  onClick={() => handleThemeSelect(theme.id)}
                  onMouseEnter={() => setPreviewTheme(theme.id)}
                  onMouseLeave={() => setPreviewTheme(null)}
                  className={`w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors relative ${
                    actualThemeId === theme.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{theme.name}</div>
                          <div className="text-sm text-gray-500">{theme.description}</div>
                        </div>
                        
                        {/* Color Palette */}
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
                            <ColorSwatch color={theme.colors.primary.main} label="Primary" />
                            <ColorSwatch color={theme.colors.secondary.main} label="Secondary" />
                          </div>
                          <div className="flex space-x-1">
                            <ColorSwatch color={theme.colors.background.default} label="Background" />
                            <ColorSwatch color={theme.colors.text.primary} label="Text" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {actualThemeId === theme.id && (
                      <Check className="w-5 h-5 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>

                {/* Theme Preview on Hover */}
                {previewTheme === theme.id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <ThemePreview theme={theme} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Color Palette Display Component
export function ColorPaletteDisplay({ themeId }: { themeId: string }) {
  const themes = getAllThemes();
  const theme = themes.find(t => t.id === themeId) || themes[0];



  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-medium text-gray-900 mb-3">Color Palette - {theme.name}</h3>
      
      <div className="space-y-3">
        {/* Primary Colors */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Primary</div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.primary.main }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.primary.main}</div>
                <div className="text-gray-500">Main</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.primary.light }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.primary.light}</div>
                <div className="text-gray-500">Light</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.primary.dark }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.primary.dark}</div>
                <div className="text-gray-500">Dark</div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Colors */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Secondary</div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.secondary.main }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.secondary.main}</div>
                <div className="text-gray-500">Main</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.secondary.light }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.secondary.light}</div>
                <div className="text-gray-500">Light</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.secondary.dark }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.secondary.dark}</div>
                <div className="text-gray-500">Dark</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background & Text Colors */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Background & Text</div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.background.default }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.background.default}</div>
                <div className="text-gray-500">Background</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: theme.colors.text.primary }} />
              <div className="text-xs">
                <div className="font-mono">{theme.colors.text.primary}</div>
                <div className="text-gray-500">Text</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
