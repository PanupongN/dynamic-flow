const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
interface Flow {
  id: string;
  title: string;
  description?: string;
  nodes: any[];
  settings: any;
  theme: any;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface FormResponse {
  id?: string;
  flowId: string;
  responses: Array<{
    nodeId: string;
    questionId: string;
    value: any;
    type: string;
  }>;
  metadata?: {
    completionTime: number;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    startedAt?: string;
  };
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Flow endpoints
  async getFlows(params: {
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<{ flows: Flow[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/flows${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<{ flows: Flow[]; pagination: any }>(endpoint);
  }

  async getFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}`);
  }

  async getDraftFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/draft`);
  }

  async getPublishedFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/published`);
  }

  async createFlow(flow: Partial<Flow>): Promise<Flow> {
    return this.request<Flow>('/flows', {
      method: 'POST',
      body: JSON.stringify(flow),
    });
  }

  async updateFlow(id: string, flow: Partial<Flow>): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flow),
    });
  }

  async deleteFlow(id: string): Promise<void> {
    return this.request<void>(`/flows/${id}`, {
      method: 'DELETE',
    });
  }

  async publishFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async duplicateFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async getFlowAnalytics(id: string): Promise<any> {
    return this.request<any>(`/flows/${id}/analytics`);
  }

  // Response endpoints
  async getResponses(params: {
    flowId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<{ responses: FormResponse[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/responses${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<{ responses: FormResponse[]; pagination: any }>(endpoint);
  }

  async getResponse(id: string): Promise<FormResponse> {
    return this.request<FormResponse>(`/responses/${id}`);
  }

  async submitResponse(response: FormResponse): Promise<{ id: string; message: string; submittedAt: string }> {
    return this.request<{ id: string; message: string; submittedAt: string }>('/responses', {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  async exportResponses(
    flowId: string, 
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/responses/flow/${flowId}/export?format=${format}`);
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    if (format === 'csv') {
      return response.text();
    } else {
      return response.json();
    }
  }

  async getResponseAnalytics(flowId: string): Promise<any> {
    return this.request<any>(`/responses/flow/${flowId}/analytics`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request<{ status: string; timestamp: string; version: string }>('/health', {
      method: 'GET',
    });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Convenience functions
export const flowsApi = {
  getAll: (params?: Parameters<typeof apiClient.getFlows>[0]) => apiClient.getFlows(params),
  getById: (id: string) => apiClient.getFlow(id),
  getDraft: (id: string) => apiClient.getDraftFlow(id),
  getPublished: (id: string) => apiClient.getPublishedFlow(id),
  create: (flow: Partial<Flow>) => apiClient.createFlow(flow),
  update: (id: string, flow: Partial<Flow>) => apiClient.updateFlow(id, flow),
  delete: (id: string) => apiClient.deleteFlow(id),
  publish: (id: string) => apiClient.publishFlow(id),
  unpublish: (id: string) => apiClient.unpublishFlow(id),
  duplicate: (id: string) => apiClient.duplicateFlow(id),
  getAnalytics: (id: string) => apiClient.getFlowAnalytics(id),
};

export const responsesApi = {
  getAll: (params?: Parameters<typeof apiClient.getResponses>[0]) => apiClient.getResponses(params),
  getById: (id: string) => apiClient.getResponse(id),
  submit: (response: FormResponse) => apiClient.submitResponse(response),
  export: (flowId: string, format?: 'json' | 'csv') => apiClient.exportResponses(flowId, format),
  getAnalytics: (flowId: string) => apiClient.getResponseAnalytics(flowId),
};

// Convenience function for form submission
export const submitFormResponse = async (responseData: FormResponse) => {
  return responsesApi.submit(responseData);
};

export default apiClient;
