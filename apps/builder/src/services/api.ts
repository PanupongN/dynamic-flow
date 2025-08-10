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

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Try to get Firebase auth token if available
    try {
      const { auth } = await import('../config/firebaseConfig');
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not get auth token:', error);
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const authHeaders = await this.getAuthHeaders();
    
    const config: RequestInit = {
      headers: {
        ...authHeaders,
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
      
      // Handle API response wrapper
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          throw new Error(data.error || 'API request failed');
        }
        // Return data field if it exists, otherwise return the whole response
        return (data.data !== undefined ? data.data : data) as T;
      }
      
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
    const response = await this.request<any>(endpoint);
    
    // Handle both old and new response formats
    if (response.data && response.pagination) {
      return {
        flows: response.data,
        pagination: response.pagination
      };
    } else if (Array.isArray(response)) {
      // Fallback for direct array response
      return {
        flows: response,
        pagination: { page: 1, limit: response.length, total: response.length }
      };
    } else {
      // Fallback for other response formats
      return {
        flows: response.flows || response.data || [],
        pagination: response.pagination || { page: 1, limit: 50, total: 0 }
      };
    }
  }

  async getFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async getDraftFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}/draft`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async getPublishedFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}/published`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async createFlow(flow: Partial<Flow>): Promise<Flow> {
    const response = await this.request<any>('/flows', {
      method: 'POST',
      body: JSON.stringify(flow),
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async updateFlow(id: string, flow: Partial<Flow>): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flow),
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async deleteFlow(id: string): Promise<void> {
    return this.request<void>(`/flows/${id}`, {
      method: 'DELETE',
    });
  }

  async publishFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}/publish`, {
      method: 'POST',
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async unpublishFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}/unpublish`, {
      method: 'POST',
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async duplicateFlow(id: string): Promise<Flow> {
    const response = await this.request<any>(`/flows/${id}/duplicate`, {
      method: 'POST',
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async getFlowAnalytics(id: string): Promise<any> {
    const response = await this.request<any>(`/flows/${id}/analytics`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
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
    const response = await this.request<any>(endpoint);
    
    // Handle both old and new response formats
    if (response.data && response.pagination) {
      return {
        responses: response.data,
        pagination: response.pagination
      };
    } else if (Array.isArray(response)) {
      // Fallback for direct array response
      return {
        responses: response,
        pagination: { page: 1, limit: response.length, total: response.length }
      };
    } else {
      // Fallback for other response formats
      return {
        responses: response.responses || response.data || [],
        pagination: response.pagination || { page: 1, limit: 50, total: 0 }
      };
    }
  }

  async getResponse(id: string): Promise<FormResponse> {
    const response = await this.request<any>(`/responses/${id}`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async submitResponse(response: FormResponse): Promise<{ id: string; message: string; submittedAt: string }> {
    const apiResponse = await this.request<any>('/responses', {
      method: 'POST',
      body: JSON.stringify(response),
    });
    
    // Handle both old and new response formats
    if (apiResponse.data) {
      return apiResponse.data;
    }
    return apiResponse;
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
    const response = await this.request<any>(`/responses/flow/${flowId}/analytics`);
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Global analytics
  async getGlobalAnalytics(): Promise<any> {
    const response = await this.request<any>('/analytics');
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.request<any>('/health', {
      method: 'GET',
    });
    
    // Handle both old and new response formats
    if (response.data) {
      return response.data;
    }
    return response;
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

export const analyticsApi = {
  getGlobal: () => apiClient.getGlobalAnalytics(),
};

// Convenience function for form submission
export const submitFormResponse = async (responseData: FormResponse) => {
  return responsesApi.submit(responseData);
};

export default apiClient;
