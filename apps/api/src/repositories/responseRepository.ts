import { executeQuery, executeTransaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface FormResponse {
  id: string;
  flow_id: string;
  responses: any[];
  metadata: any;
  submitted_at: Date;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export class ResponseRepository {
  // Get all responses for a flow
  async getByFlowId(flowId: string, limit: number = 100, page: number = 1): Promise<FormResponse[]> {
    const query = `
      SELECT * FROM form_responses 
      WHERE flow_id = $1 
      ORDER BY submitted_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const responses = await executeQuery(query, [flowId, limit, (page - 1) * limit]);
    return responses.map(this.transformResponse);
  }

  // Get response by ID
  async getById(id: string): Promise<FormResponse | null> {
    const query = 'SELECT * FROM form_responses WHERE id = $1';
    const responses = await executeQuery(query, [id]);
    return responses.length > 0 ? this.transformResponse(responses[0]) : null;
  }

  // Create new response
  async create(responseData: Partial<FormResponse>): Promise<FormResponse> {
    const response: FormResponse = {
      id: uuidv4(),
      flow_id: responseData.flow_id!,
      responses: responseData.responses || [],
      metadata: responseData.metadata || {},
      submitted_at: new Date(),
      user_id: responseData.user_id,
      session_id: responseData.session_id,
      ip_address: responseData.ip_address,
      user_agent: responseData.user_agent
    };

    const query = `
      INSERT INTO form_responses (id, flow_id, responses, metadata, submitted_at, user_id, session_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await executeQuery(query, [
      response.id,
      response.flow_id,
      JSON.stringify(response.responses),
      JSON.stringify(response.metadata),
      response.submitted_at,
      response.user_id,
      response.session_id,
      response.ip_address,
      response.user_agent
    ]);

    return response;
  }

  // Update response
  async update(id: string, updates: Partial<FormResponse>): Promise<FormResponse | null> {
    const existingResponse = await this.getById(id);
    if (!existingResponse) return null;

    const updatedResponse: FormResponse = {
      ...existingResponse,
      ...updates
    };

    const query = `
      UPDATE form_responses 
      SET responses = $1, metadata = $2, user_id = $3, session_id = $4, ip_address = $5, user_agent = $6
      WHERE id = $7
    `;

    await executeQuery(query, [
      JSON.stringify(updatedResponse.responses),
      JSON.stringify(updatedResponse.metadata),
      updatedResponse.user_id,
      updatedResponse.session_id,
      updatedResponse.ip_address,
      updatedResponse.user_agent,
      id
    ]);

    return updatedResponse;
  }

  // Delete response
  async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM form_responses WHERE id = $1';
      await executeQuery(query, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting response:', error);
      return false;
    }
  }

  // Get response statistics for a flow
  async getFlowStats(flowId: string): Promise<{
    totalResponses: number;
    lastSubmission: Date | null;
    averageCompletionTime?: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_responses,
        MAX(submitted_at) as last_submission
      FROM form_responses 
      WHERE flow_id = $1
    `;

    const results = await executeQuery(query, [flowId]);
    const stats = results[0];

    return {
      totalResponses: parseInt(stats.total_responses) || 0,
      lastSubmission: stats.last_submission || null
    };
  }

  // Transform database response to API format
  private transformResponse(dbResponse: any): FormResponse {
    return {
      id: dbResponse.id,
      flow_id: dbResponse.flow_id,
      responses: dbResponse.responses ? JSON.parse(dbResponse.responses) : [],
      metadata: dbResponse.metadata ? JSON.parse(dbResponse.metadata) : {},
      submitted_at: dbResponse.submitted_at,
      user_id: dbResponse.user_id,
      session_id: dbResponse.session_id,
      ip_address: dbResponse.ip_address,
      user_agent: dbResponse.user_agent
    };
  }
}

export const responseRepository = new ResponseRepository();
