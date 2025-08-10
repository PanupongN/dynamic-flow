import { create } from 'zustand';
import { Flow as SharedFlow } from '@dynamic-flow/types';

interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    required?: boolean;
    description?: string;
  };
  connections: any[];
}

interface FlowStore {
  flows: SharedFlow[];
  currentFlow: SharedFlow | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentFlow: (flow: SharedFlow) => void;
  addNode: (node: FlowNode) => void;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  deleteNode: (nodeId: string) => void;
  updateFlowSettings: (settings: Partial<SharedFlow>) => void;
  saveFlow: (flow: SharedFlow) => Promise<void>;
  publishFlow: (flowId: string) => Promise<void>;
  unpublishFlow: (flowId: string) => Promise<void>;
  deleteFlow: (flowId: string) => Promise<void>;
  loadFlows: () => Promise<void>;
  createNewFlow: (title?: string) => Promise<SharedFlow>;
}

const defaultTheme = {
  id: 'default',
  name: 'Default Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
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
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  flows: [],
  currentFlow: {
    id: 'registration_mhai',
    title: 'Registration Mhai',
    nodes: [
      {
        id: 'contact_information',
        type: 'flow_step',
        position: { x: 100, y: 100 },
        data: {
          label: 'Contact Information',
          description: 'Please provide your contact details',
          required: true,
          questions: [
            { id: 'first_name', type: 'text_input', label: 'First Name', required: true },
            { id: 'last_name', type: 'text_input', label: 'Last Name', required: true },
            { id: 'email', type: 'email_input', label: 'Email', required: true },
            { id: 'phone', type: 'phone_input', label: 'Phone Number', required: true }
          ]
        },
        connections: [{ targetNodeId: 'how_many_people' }]
      },
      {
        id: 'how_many_people',
        type: 'flow_step',
        position: { x: 100, y: 300 },
        data: {
          label: 'How Many People',
          description: 'How many guests will you bring?',
          required: true,
          questions: [
            { 
              id: 'number_of_guests', 
              type: 'number_input', 
              label: 'Number of accompanying guests', 
              required: true,
              min: 0,
              max: 10
            }
          ]
        },
        connections: [{ 
          targetNodeId: 'guests',
          condition: {
            field: 'number_of_guests',
            operator: 'greater_than',
            value: 0
          }
        }]
      },
      {
        id: 'guests',
        type: 'flow_step',
        position: { x: 100, y: 500 },
        data: {
          label: 'Guest Information',
          description: 'Please provide details for each guest',
          required: true,
          repeatable: true,
          repeatBasedOn: 'number_of_guests',
          questions: [
            { id: 'guest_first_name', type: 'text_input', label: 'Guest First Name', required: true },
            { id: 'guest_last_name', type: 'text_input', label: 'Guest Last Name', required: true },
            { id: 'guest_email', type: 'email_input', label: 'Guest Email', required: false },
            { id: 'guest_phone', type: 'text_input', label: 'Guest Phone', required: false },
            { 
              id: 'relation', 
              type: 'single_choice', 
              label: 'Relationship to you', 
              required: true,
              options: [
                { id: 'spouse', label: 'Spouse', value: 'spouse' },
                { id: 'family', label: 'Family Member', value: 'family' },
                { id: 'friend', label: 'Friend', value: 'friend' },
                { id: 'colleague', label: 'Colleague', value: 'colleague' },
                { id: 'other', label: 'Other', value: 'other' }
              ]
            }
          ]
        },
        connections: [{ targetNodeId: 'thank_you' }]
      },
      {
        id: 'thank_you',
        type: 'thank_you',
        position: { x: 100, y: 700 },
        data: {
          label: 'Thank You!',
          description: 'Your registration has been submitted successfully. We will contact you soon with more details.',
          required: false
        },
        connections: []
      }
    ],
    settings: {
      allowMultipleSubmissions: false,
      showProgressBar: true,
      requireAuth: false,
      collectAnalytics: true,
    },
    theme: { id: 'default', ...defaultTheme },
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
  },
  isLoading: false,
  error: null,

  setCurrentFlow: (flow) => set({ currentFlow: flow }),

  addNode: (node) => {
    const { currentFlow } = get();
    if (!currentFlow) return;

    const updatedFlow = {
      ...currentFlow,
      nodes: [...currentFlow.nodes, node],
      updatedAt: new Date(),
    };

    set({ currentFlow: updatedFlow });
  },

  updateNode: (nodeId, updates) => {
    const { currentFlow } = get();
    if (!currentFlow) return;

    const updatedFlow = {
      ...currentFlow,
      nodes: currentFlow.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      updatedAt: new Date(),
    };

    set({ currentFlow: updatedFlow });
  },

  deleteNode: (nodeId) => {
    const { currentFlow } = get();
    if (!currentFlow) return;

    const updatedFlow = {
      ...currentFlow,
      nodes: currentFlow.nodes.filter(node => node.id !== nodeId),
      updatedAt: new Date(),
    };

    set({ currentFlow: updatedFlow });
  },

  updateFlowSettings: (settings) => {
    const { currentFlow } = get();
    if (!currentFlow) return;

    const updatedFlow = {
      ...currentFlow,
      ...settings,
      updatedAt: new Date(),
    };

    set({ currentFlow: updatedFlow });
  },

  saveFlow: async (flow) => {
    set({ isLoading: true, error: null });
    
    try {
      const { flowsApi } = await import('../services/api');
      
      let savedFlow;
      const { flows } = get();
      const existingIndex = flows.findIndex(f => f.id === flow.id);
      
      // Clean payload - remove system fields for API
      // Don't send status to preserve existing status (especially for published flows)
      const cleanFlow = {
        title: flow.title,
        description: flow.description,
        nodes: flow.nodes,
        settings: flow.settings,
        theme: flow.theme
        // status is intentionally omitted to preserve existing status
      };
      
      if (existingIndex >= 0) {
        // Update existing flow
        savedFlow = await flowsApi.update(flow.id, cleanFlow);
        flows[existingIndex] = savedFlow;
      } else {
        // Create new flow
        savedFlow = await flowsApi.create(cleanFlow);
        flows.push(savedFlow);
      }
      
      set({ 
        flows: [...flows], 
        currentFlow: savedFlow,
        isLoading: false 
      });
      
      // Show success toast if available
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('success', 'Flow saved successfully!');
      }
    } catch (error) {
      console.error('Save flow error:', error);
      set({ error: 'Failed to save flow', isLoading: false });
    }
  },

  publishFlow: async (flowId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { flowsApi } = await import('../services/api');
      const publishedFlow = await flowsApi.publish(flowId);
      
      const { currentFlow, flows } = get();
      const flowIndex = flows.findIndex(f => f.id === flowId);
      
      if (flowIndex >= 0) {
        flows[flowIndex] = publishedFlow;
      }
      
      if (currentFlow && currentFlow.id === flowId) {
        set({ currentFlow: publishedFlow });
      }
      
      set({ flows: [...flows], isLoading: false });
    } catch (error) {
      console.error('Publish flow error:', error);
      set({ error: 'Failed to publish flow', isLoading: false });
    }
  },

  unpublishFlow: async (flowId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { flowsApi } = await import('../services/api');
      const unpublishedFlow = await flowsApi.unpublish(flowId);
      
      const { currentFlow, flows } = get();
      const flowIndex = flows.findIndex(f => f.id === flowId);
      
      if (flowIndex >= 0) {
        flows[flowIndex] = unpublishedFlow;
      }
      
      if (currentFlow && currentFlow.id === flowId) {
        set({ currentFlow: unpublishedFlow });
      }
      
      set({ flows: [...flows], isLoading: false });
    } catch (error) {
      console.error('Unpublish flow error:', error);
      set({ error: 'Failed to unpublish flow', isLoading: false });
    }
  },

  deleteFlow: async (flowId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { flowsApi } = await import('../services/api');
      await flowsApi.delete(flowId);
      
      const { currentFlow, flows } = get();
      const updatedFlows = flows.filter(flow => flow.id !== flowId);
      
      set({ flows: updatedFlows });
      
      // Clear current flow if it's the one being deleted
      if (currentFlow && currentFlow.id === flowId) {
        set({ currentFlow: null });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Delete flow error:', error);
      set({ error: 'Failed to delete flow', isLoading: false });
    }
  },

  loadFlows: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { flowsApi } = await import('../services/api');
      const { flows } = await flowsApi.getAll();
      
      set({ flows, isLoading: false });
    } catch (error) {
      console.error('Load flows error:', error);
      
      // Fallback to demo data if API is not available
      const mockFlows: Flow[] = [
        {
          id: 'flow_1',
          title: 'Customer Feedback Form',
          description: 'Collect customer feedback and ratings',
          nodes: [],
          settings: {
            allowMultipleSubmissions: false,
            showProgressBar: true,
            requireAuth: false,
            collectAnalytics: true,
          },
          theme: { id: 'default', ...defaultTheme },
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'draft',
        },
      ];
      
      set({ flows: mockFlows, isLoading: false });
    }
  },

  createNewFlow: async (title?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const newFlow: Omit<SharedFlow, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title || 'Untitled Flow',
        nodes: [],
        settings: {
          allowMultipleSubmissions: false,
          showProgressBar: true,
          requireAuth: false,
          collectAnalytics: true,
        },
        theme: { id: 'default', ...defaultTheme },
        status: 'draft',
      };

      // Try to create via API first
      try {
        const { flowsApi } = await import('../services/api');
        
        // Clean payload for API
        const cleanFlow = {
          title: newFlow.title,
          description: newFlow.description,
          nodes: newFlow.nodes,
          settings: newFlow.settings,
          theme: newFlow.theme,
          status: newFlow.status
        };
        
        const savedFlow = await flowsApi.create(cleanFlow);
        
        const { flows } = get();
        set({ 
          currentFlow: savedFlow,
          flows: [...flows, savedFlow],
          isLoading: false 
        });
        

        return savedFlow;
      } catch (apiError) {
        console.warn('API not available, creating local flow:', apiError);
        
        // Fallback to local creation
        const localFlow: SharedFlow = {
          id: `flow_${Date.now()}`,
          ...newFlow,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set({ currentFlow: localFlow, isLoading: false });
        return localFlow;
      }
    } catch (error) {
      console.error('Failed to create new flow:', error);
      set({ error: 'Failed to create new flow', isLoading: false });
      throw error;
    }
  },
}));