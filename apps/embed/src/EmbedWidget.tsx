import React, { useEffect, useState } from 'react';
import { Flow, FormResponse, EmbedConfig } from '@dynamic-flow/types';
import { ThemeProvider } from '@dynamic-flow/ui';
import { FlowRenderer } from './components/FlowRenderer';

interface EmbedWidgetProps {
  config: EmbedConfig;
}

export function EmbedWidget({ config }: EmbedWidgetProps) {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlow();
  }, [config.flowId]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement API call to fetch flow
      console.log('Loading flow:', config.flowId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock flow data
      const mockFlow: Flow = {
        id: config.flowId,
        title: 'Contact Form',
        description: 'Get in touch with us',
        nodes: [
          {
            id: 'node_1',
            type: 'text_input',
            position: { x: 0, y: 0 },
            data: {
              label: 'What is your name?',
              required: true,
            },
            connections: [{ targetNodeId: 'node_2' }],
          },
          {
            id: 'node_2',
            type: 'email_input',
            position: { x: 0, y: 100 },
            data: {
              label: 'What is your email address?',
              required: true,
            },
            connections: [{ targetNodeId: 'node_3' }],
          },
          {
            id: 'node_3',
            type: 'thank_you',
            position: { x: 0, y: 200 },
            data: {
              label: 'Thank you for your submission!',
            },
            connections: [],
          },
        ],
        settings: {
          allowMultipleSubmissions: false,
          showProgressBar: true,
          requireAuth: false,
          collectAnalytics: true,
        },
        theme: {
          id: 'embed-theme',
          name: 'Embed Theme',
          colors: {
            primary: config.theme?.colors?.primary || '#3b82f6',
            secondary: config.theme?.colors?.secondary || '#64748b',
            background: config.theme?.colors?.background || '#ffffff',
            text: config.theme?.colors?.text || '#0f172a',
            border: config.theme?.colors?.border || '#e2e8f0',
          },
          typography: {
            fontFamily: config.theme?.typography?.fontFamily || 'Inter, system-ui, sans-serif',
            fontSize: {
              small: '0.875rem',
              medium: '1rem',
              large: '1.125rem',
            },
          },
          spacing: {
            small: '0.5rem',
            medium: '1rem',
            large: '1.5rem',
          },
          borderRadius: '0.5rem',
          customCSS: config.customCSS,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
      };
      
      setFlow(mockFlow);
    } catch (err) {
      setError('Failed to load form');
      console.error('Error loading flow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (response: FormResponse) => {
    try {
      // TODO: Implement API call to submit response
      console.log('Submitting response:', response);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto-resize iframe if needed
      if (config.autoResize && window.parent !== window) {
        window.parent.postMessage({
          type: 'dynamic-flow-resize',
          height: document.body.scrollHeight,
        }, '*');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error || 'Form not found'}</p>
      </div>
    );
  }

  return (
    <ThemeProvider 
      defaultTheme={flow.theme}
      enableWhiteLabel={true}
    >
      <div 
        className="max-w-full"
        style={{
          width: config.width || '100%',
          height: config.height || 'auto',
        }}
      >
        <FlowRenderer
          flow={flow}
          onSubmit={handleSubmit}
          hideHeader={config.hideHeader}
          hideFooter={config.hideFooter}
        />
      </div>
    </ThemeProvider>
  );
}

// Global function to initialize embed widget
(window as any).DynamicFlow = {
  embed: (containerId: string, config: EmbedConfig) => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    const React = (window as any).React;
    const ReactDOM = (window as any).ReactDOM;

    if (!React || !ReactDOM) {
      console.error('React and ReactDOM must be loaded before DynamicFlow');
      return;
    }

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(EmbedWidget, { config }));
  },
};
