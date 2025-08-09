import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '../components/FormRenderer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FormStyles } from '../components/FormStyles';
import { LoadingState, ErrorState, SuccessState, RedirectState, NoDataState } from '../components/FormStateComponents';
import { useFormFlow } from '../hooks/useFormFlow';
import { getTheme, generateCSSVariables } from '../themes';

export const PublicFormView: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  
  // Use the custom hook for flow loading
  const { flow, loading, error } = useFormFlow(flowId, 'published');
  const [isSubmitted, setIsSubmitted] = useState(false);



  const handleSubmitSuccess = () => {
    console.log('Form submitted successfully');
    setIsSubmitted(true);

    // If there's a redirect URL, navigate to it
    if (flow?.settings.redirectUrl) {
      setTimeout(() => {
        window.location.href = flow.settings.redirectUrl!;
      }, 1000);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Success state (after submission)
  if (isSubmitted && !flow?.settings.redirectUrl && flow) {
    return (
      <SuccessState 
        flow={flow} 
        onReset={() => {
          setIsSubmitted(false);
          window.location.reload();
        }} 
      />
    );
  }

  // Redirect to thank you page if configured
  if (isSubmitted && flow?.settings.redirectUrl) {
    return <RedirectState />;
  }

  // No data state
  if (!flow) {
    return <NoDataState />;
  }

  // Get the theme for this flow
  const themeId = (flow.theme as any)?.id || 'default';
  const theme = getTheme(themeId);
  const themeCSS = generateCSSVariables(theme);

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background.default }}>
      {/* Apply theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      
      {/* Use shared form styles component */}
      <FormStyles theme={theme} customCSS={flow.theme?.customCSS} />
      
      <div className="container mx-auto py-8 form-container">
        <ErrorBoundary>
          <FormRenderer 
            flow={flow}
            isPreview={false}
            onSubmit={handleSubmitSuccess}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
