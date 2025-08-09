const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types for preview app - focused on form rendering and submission
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
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    completionTime: number;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    startedAt?: string;
    submittedAt: string;
  };
}

// Generic API client for preview app
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

  // Flow endpoints - only what's needed for preview
  async getDraftFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/draft`);
  }

  async getPublishedFlow(id: string): Promise<Flow> {
    return this.request<Flow>(`/flows/${id}/published`);
  }

  // Response submission
  async submitResponse(response: FormResponse): Promise<{ id: string; message: string; submittedAt: string }> {
    return this.request<{ id: string; message: string; submittedAt: string }>('/responses', {
      method: 'POST',
      body: JSON.stringify(response),
    });
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

// Convenience functions for flows
export const flowsApi = {
  getDraft: (id: string) => apiClient.getDraftFlow(id),
  getPublished: (id: string) => apiClient.getPublishedFlow(id),
};

// Convenience functions for responses
export const responsesApi = {
  submit: (response: FormResponse) => apiClient.submitResponse(response),
};

// Convenience function for form submission
export const submitFormResponse = async (responseData: FormResponse) => {
  return responsesApi.submit(responseData);
};

export default apiClient;
