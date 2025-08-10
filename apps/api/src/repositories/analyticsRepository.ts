import { executeQuery } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  id: string;
  flow_id?: string;
  event_type: 'view' | 'start' | 'complete' | 'abandon';
  event_data: any;
  timestamp: Date;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AnalyticsSummary {
  flow_id: string;
  flow_title: string;
  flow_status: string;
  total_views: number;
  total_starts: number;
  total_completions: number;
  total_submissions: number;
  conversion_rate: number;
}

export class AnalyticsRepository {
  // Record analytics event
  async recordEvent(eventData: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      flow_id: eventData.flow_id,
      event_type: eventData.event_type!,
      event_data: eventData.event_data || {},
      timestamp: new Date(),
      user_id: eventData.user_id,
      session_id: eventData.session_id,
      ip_address: eventData.ip_address,
      user_agent: eventData.user_agent
    };

    const query = `
      INSERT INTO analytics (id, flow_id, event_type, event_data, timestamp, user_id, session_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await executeQuery(query, [
      event.id,
      event.flow_id,
      event.event_type,
      JSON.stringify(event.event_data),
      event.timestamp,
      event.user_id,
      event.session_id,
      event.ip_address,
      event.user_agent
    ]);

    return event;
  }

  // Get analytics for a specific flow
  async getFlowAnalytics(flowId: string, startDate?: Date, endDate?: Date): Promise<{
    views: number;
    starts: number;
    completions: number;
    abandonments: number;
    events: AnalyticsEvent[];
  }> {
    let query = `
      SELECT * FROM analytics 
      WHERE flow_id = $1
    `;
    
    const params: any[] = [flowId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY timestamp DESC`;

    const events = await executeQuery(query, params);
    const transformedEvents = events.map(this.transformEvent);

    return {
      views: transformedEvents.filter(e => e.event_type === 'view').length,
      starts: transformedEvents.filter(e => e.event_type === 'start').length,
      completions: transformedEvents.filter(e => e.event_type === 'complete').length,
      abandonments: transformedEvents.filter(e => e.event_type === 'abandon').length,
      events: transformedEvents
    };
  }

  // Get analytics summary for all flows
  async getAnalyticsSummary(): Promise<AnalyticsSummary[]> {
    const query = `
      SELECT * FROM analytics_summary
      ORDER BY total_views DESC
    `;

    const results = await executeQuery(query);
    return results.map(this.transformSummary);
  }

  // Get analytics summary for a specific flow
  async getFlowAnalyticsSummary(flowId: string): Promise<AnalyticsSummary | null> {
    const query = `
      SELECT * FROM analytics_summary
      WHERE flow_id = $1
    `;

    const results = await executeQuery(query, [flowId]);
    return results.length > 0 ? this.transformSummary(results[0]) : null;
  }

  // Get user journey analytics
  async getUserJourney(flowId: string, sessionId?: string, userId?: string): Promise<AnalyticsEvent[]> {
    let query = `
      SELECT * FROM analytics 
      WHERE flow_id = $1
    `;
    
    const params: any[] = [flowId];
    let paramIndex = 2;

    if (sessionId) {
      query += ` AND session_id = $${paramIndex}`;
      params.push(sessionId);
      paramIndex++;
    }

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    query += ` ORDER BY timestamp ASC`;

    const events = await executeQuery(query, params);
    return events.map(this.transformEvent);
  }

  // Get conversion funnel for a flow
  async getConversionFunnel(flowId: string, startDate?: Date, endDate?: Date): Promise<{
    views: number;
    starts: number;
    completions: number;
    viewToStartRate: number;
    startToCompletionRate: number;
    overallConversionRate: number;
  }> {
    const analytics = await this.getFlowAnalytics(flowId, startDate, endDate);
    
    const viewToStartRate = analytics.views > 0 ? (analytics.starts / analytics.views) * 100 : 0;
    const startToCompletionRate = analytics.starts > 0 ? (analytics.completions / analytics.starts) * 100 : 0;
    const overallConversionRate = analytics.views > 0 ? (analytics.completions / analytics.views) * 100 : 0;

    return {
      views: analytics.views,
      starts: analytics.starts,
      completions: analytics.completions,
      viewToStartRate: Math.round(viewToStartRate * 100) / 100,
      startToCompletionRate: Math.round(startToCompletionRate * 100) / 100,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100
    };
  }

  // Transform database response to API format
  private transformEvent(dbEvent: any): AnalyticsEvent {
    return {
      id: dbEvent.id,
      flow_id: dbEvent.flow_id,
      event_type: dbEvent.event_type,
      event_data: dbEvent.event_data ? JSON.parse(dbEvent.event_data) : {},
      timestamp: dbEvent.timestamp,
      user_id: dbEvent.user_id,
      session_id: dbEvent.session_id,
      ip_address: dbEvent.ip_address,
      user_agent: dbEvent.user_agent
    };
  }

  // Transform summary response
  private transformSummary(dbSummary: any): AnalyticsSummary {
    return {
      flow_id: dbSummary.flow_id,
      flow_title: dbSummary.flow_title,
      flow_status: dbSummary.flow_status,
      total_views: parseInt(dbSummary.total_views) || 0,
      total_starts: parseInt(dbSummary.total_starts) || 0,
      total_completions: parseInt(dbSummary.total_completions) || 0,
      total_submissions: parseInt(dbSummary.total_submissions) || 0,
      conversion_rate: parseFloat(dbSummary.conversion_rate) || 0
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
