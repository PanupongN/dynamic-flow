import React from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FormStyles } from '../components/FormStyles';
import { LoadingState, ErrorState, NoDataState } from '../components/FormStateComponents';
import { useFormFlow } from '../hooks/useFormFlow';
import { getTheme, generateCSSVariables } from '../themes';

export const PreviewFormView: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  
  // Use the custom hook for flow loading
  const { flow, loading, error } = useFormFlow(flowId, 'draft');



  const handlePreviewSubmit = (data: any) => {
    console.log('Preview form submitted:', data);
    alert('Form submitted successfully! (Preview mode - no data saved)');
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading form preview..." />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} title="Preview Not Available" />;
  }

  // No data state
  if (!flow) {
    return <NoDataState />;
  }

  // Get the theme for this flow
  const themeId = flow.theme?.id || 'default';
  const theme = getTheme(themeId);
  const themeCSS = generateCSSVariables(theme);
  
  // Debug logging for preview
  console.log('PreviewFormView - Flow theme data:', {
    flowTheme: flow.theme,
    themeId,
    themeName: theme.name,
    primaryColor: theme.colors.primary.main,
  });

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background.default }}>
      {/* Apply theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
      {/* Use shared form styles component */}
      <FormStyles theme={theme} customCSS={flow.theme?.customCSS} />
      
      {/* Preview Banner */}
      <div style={{ backgroundColor: theme.colors.background.accent, borderColor: theme.colors.border.light }} className="border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.primary.main }}>
                <svg className="w-2 h-2" fill="white" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>Preview Mode</h1>
                <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  You are viewing "{flow.title}" with {theme.name} theme
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 text-sm rounded-md hover:opacity-80"
              style={{ 
                backgroundColor: theme.colors.primary.main, 
                color: theme.colors.primary.contrastText 
              }}
            >
              Exit Preview
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto py-8 form-container">
        <ErrorBoundary>
          <FormRenderer 
            flow={flow} 
            isPreview={true} 
            onSubmit={handlePreviewSubmit}
          />
          
          {/* Debug theme information */}
          <div className="mt-4 p-2 border rounded" style={{ 
            backgroundColor: theme.colors.background.accent, 
            borderColor: theme.colors.border.light,
            color: theme.colors.text.secondary 
          }}>
            <strong>Theme Debug:</strong> {flow.theme?.id || 'No theme set'} 
            {flow.theme?.id && ` (Theme: ${theme.name}, Primary: ${theme.colors.primary.main})`}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};
