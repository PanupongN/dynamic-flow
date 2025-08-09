import { useState, useEffect } from 'react';
import { flowsApi } from '../services/api';
import { Flow } from '../components/FormStateComponents';

export type FlowLoadType = 'draft' | 'published';

interface UseFormFlowResult {
  flow: Flow | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const useFormFlow = (flowId: string | undefined, loadType: FlowLoadType): UseFormFlowResult => {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFlow = async () => {
    if (!flowId) {
      setError('Flow ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load flow data based on type
      const flowData = loadType === 'draft' 
        ? await flowsApi.getDraft(flowId)
        : await flowsApi.getPublished(flowId);
      
      setFlow(flowData);
    } catch (err) {
      console.error(`Error loading ${loadType} flow:`, err);
      
      // Provide specific error messages
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('not found')) {
          if (loadType === 'draft') {
            setError('Flow not found. Make sure the flow exists and has been saved.');
          } else {
            setError('This form is not currently available or not published. Please make sure the form has been published and the flow ID is correct.');
          }
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Cannot connect to API server. Please make sure the API server is running.');
        } else if (err.message.includes('500')) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to load form: ${err.message}`);
        }
      } else {
        setError(`Failed to load ${loadType} form`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlow();
  }, [flowId, loadType]);

  const reload = () => {
    loadFlow();
  };

  return { flow, loading, error, reload };
};
