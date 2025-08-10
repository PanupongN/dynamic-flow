import { executeQuery, executeTransaction } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Flow {
  id: string;
  title: string;
  description?: string;
  nodes: any[];
  settings: any;
  theme: any;
  status: 'draft' | 'published' | 'archived';
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  created_by?: string;
  version: number;
  hasUnpublishedChanges?: boolean;
  draftContent?: {
    nodes: any[];
    settings: any;
    theme: any;
  };
  publishedContent?: {
    nodes: any[];
    settings: any;
    theme: any;
  };
}

export interface FlowDraft {
  id: string;
  flow_id: string;
  nodes: any[];
  settings: any;
  theme: any;
  created_at: Date;
  updated_at: Date;
}

export interface FlowPublished {
  id: string;
  flow_id: string;
  nodes: any[];
  settings: any;
  theme: any;
  published_at: Date;
  version: number;
}

export class FlowRepository {
  // Get all flows with optional filtering
  async getAll(status?: string, search?: string, limit: number = 50, page: number = 1): Promise<Flow[]> {
    let query = `
      SELECT f.*, 
             fd.nodes as draft_nodes, fd.settings as draft_settings, fd.theme as draft_theme,
             fp.nodes as published_nodes, fp.settings as published_settings, fp.theme as published_theme
      FROM flows f
      LEFT JOIN flow_drafts fd ON f.id = fd.flow_id
      LEFT JOIN flow_published fp ON f.id = fp.flow_id AND fp.version = f.version
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (f.title ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY f.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);
    
    const flows = await executeQuery(query, params);
    return flows.map((dbFlow) => {
      // For getAll (dashboard), we want to show the actual flow status from the flows table
      // but indicate if there are unpublished changes
      let nodes, settings, theme;
      let hasUnpublishedChanges = false;
      
      // Always prioritize published content for dashboard display
      if (dbFlow.published_nodes) {
        nodes = this.safeParseJson(dbFlow.published_nodes, []);
        settings = this.safeParseJson(dbFlow.published_settings, {});
        theme = this.safeParseJson(dbFlow.published_theme, {});
        
        // Check if there are draft changes that haven't been published
        if (dbFlow.draft_nodes) {
          hasUnpublishedChanges = true;
        }
      } else if (dbFlow.draft_nodes) {
        // Fallback to draft content if no published content available
        nodes = this.safeParseJson(dbFlow.draft_nodes, []);
        settings = this.safeParseJson(dbFlow.draft_settings, {});
        theme = this.safeParseJson(dbFlow.draft_theme, {});
      } else {
        // No content available
        nodes = [];
        settings = {};
        theme = {};
      }

      // Parse draft and published content for comparison
      const draftContent = {
        nodes: this.safeParseJson(dbFlow.draft_nodes, []),
        settings: this.safeParseJson(dbFlow.draft_settings, {}),
        theme: this.safeParseJson(dbFlow.draft_theme, {})
      };

      const publishedContent = {
        nodes: this.safeParseJson(dbFlow.published_nodes, []),
        settings: this.safeParseJson(dbFlow.published_settings, {}),
        theme: this.safeParseJson(dbFlow.published_theme, {})
      };

      return {
        id: dbFlow.id,
        title: dbFlow.title || '',
        description: dbFlow.description || '',
        nodes: nodes,
        settings: settings,
        theme: theme,
        status: dbFlow.status || 'draft', // Use actual status from flows table
        created_at: dbFlow.created_at || new Date(),
        updated_at: dbFlow.updated_at || new Date(),
        published_at: dbFlow.published_at || undefined,
        created_by: dbFlow.created_by || undefined,
        version: dbFlow.version || 1,
        hasUnpublishedChanges: hasUnpublishedChanges,
        // Add draft and published content for comparison
        draftContent,
        publishedContent
      };
    });
  }

  // Get flow by ID
  async getById(id: string): Promise<Flow | null> {
    const query = `
      SELECT f.*, 
             fd.nodes as draft_nodes, fd.settings as draft_settings, fd.theme as draft_theme,
             fp.nodes as published_nodes, fp.settings as published_settings, fp.theme as published_theme
      FROM flows f
      LEFT JOIN flow_drafts fd ON f.id = fd.flow_id
      LEFT JOIN flow_published fp ON f.id = fp.flow_id AND fp.version = f.version
      WHERE f.id = $1
    `;
    
    const flows = await executeQuery(query, [id]);
    if (flows.length === 0) return null;
    
    const dbFlow = flows[0];
    
    // For getById, we want to show the actual flow status from the flows table
    // but indicate if there are unpublished changes
    let nodes, settings, theme;
    let hasUnpublishedChanges = false;
    
    // Always prioritize published content for consistency
    if (dbFlow.published_nodes) {
      nodes = this.safeParseJson(dbFlow.published_nodes, []);
      settings = this.safeParseJson(dbFlow.published_settings, {});
      theme = this.safeParseJson(dbFlow.published_theme, {});
      
      // Check if there are draft changes that haven't been published
      if (dbFlow.draft_nodes) {
        hasUnpublishedChanges = true;
      }
    } else if (dbFlow.draft_nodes) {
      // Fallback to draft content if no published content available
      nodes = this.safeParseJson(dbFlow.draft_nodes, []);
      settings = this.safeParseJson(dbFlow.draft_settings, {});
      theme = this.safeParseJson(dbFlow.draft_theme, {});
    } else {
      // No content available
      nodes = [];
      settings = {};
      theme = {};
    }

    return {
      id: dbFlow.id,
      title: dbFlow.title || '',
      description: dbFlow.description || '',
      nodes: nodes,
      settings: settings,
      theme: theme,
      status: dbFlow.status || 'draft', // Use actual status from flows table
      created_at: dbFlow.created_at || new Date(),
      updated_at: dbFlow.updated_at || new Date(),
      published_at: dbFlow.published_at || undefined,
      created_by: dbFlow.created_by || undefined,
      version: dbFlow.version || 1,
      hasUnpublishedChanges: hasUnpublishedChanges
    };
  }

  // Get draft version of flow by ID
  async getDraftById(id: string): Promise<Flow | null> {
    // Query directly from flow_drafts table to get the actual draft content
    const query = `
      SELECT f.*, 
             fd.nodes as draft_nodes, fd.settings as draft_settings, fd.theme as draft_theme,
             fd.updated_at as draft_updated_at
      FROM flows f
      INNER JOIN flow_drafts fd ON f.id = fd.flow_id
      WHERE f.id = $1
    `;
    
    const flows = await executeQuery(query, [id]);
    if (flows.length === 0) return null;
    
    const dbFlow = flows[0];
    
    // Debug logging to see what we get from database
    console.log('🔍 getDraftById Debug:');
    console.log('  - Flow ID:', dbFlow.id);
    console.log('  - Status:', dbFlow.status);
    console.log('  - Draft nodes type:', typeof dbFlow.draft_nodes);
    console.log('  - Draft nodes:', dbFlow.draft_nodes ? (typeof dbFlow.draft_nodes === 'string' ? dbFlow.draft_nodes.substring(0, 100) + '...' : JSON.stringify(dbFlow.draft_nodes).substring(0, 100) + '...') : 'NULL');
    
    // Create a flow object with draft content
    const draftFlow: Flow = {
      id: dbFlow.id,
      title: dbFlow.title || '',
      description: dbFlow.description || '',
      nodes: this.safeParseJson(dbFlow.draft_nodes, []),
      settings: this.safeParseJson(dbFlow.draft_settings, {}),
      theme: this.safeParseJson(dbFlow.draft_theme, {}),
      status: 'draft' as const,
      created_at: dbFlow.created_at || new Date(),
      updated_at: dbFlow.draft_updated_at || new Date(),
      published_at: dbFlow.published_at || undefined,
      created_by: dbFlow.created_by || undefined,
      version: dbFlow.version || 1
    };
    
    console.log('  - Final nodes:', draftFlow.nodes);
    console.log('  - Final nodes length:', draftFlow.nodes.length);
    
    return draftFlow;
  }

  // Get published version of flow by ID
  async getPublishedById(id: string): Promise<Flow | null> {
    // Query directly from flow_published table to get the actual published content
    // Order by published_at DESC to get the most recently published version
    const query = `
      SELECT f.*, 
             fp.nodes as published_nodes, fp.settings as published_settings, fp.theme as published_theme,
             fp.published_at, fp.version
      FROM flows f
      INNER JOIN flow_published fp ON f.id = fp.flow_id
      WHERE f.id = $1
      ORDER BY fp.published_at DESC
      LIMIT 1
    `;
    
    const flows = await executeQuery(query, [id]);
    if (flows.length === 0) return null;
    
    const dbFlow = flows[0];
    
    // Debug logging to see what we get from database
    console.log('🔍 getPublishedById Debug:');
    console.log('  - Flow ID:', dbFlow.id);
    console.log('  - Status:', dbFlow.status);
    console.log('  - Published nodes type:', typeof dbFlow.published_nodes);
    console.log('  - Published nodes:', dbFlow.published_nodes ? (typeof dbFlow.published_nodes === 'string' ? dbFlow.published_nodes.substring(0, 100) + '...' : JSON.stringify(dbFlow.published_nodes).substring(0, 100) + '...') : 'NULL');
    console.log('  - Version:', dbFlow.version);
    
    // Create a flow object with published content
    const publishedFlow: Flow = {
      id: dbFlow.id,
      title: dbFlow.title || '',
      description: dbFlow.description || '',
      nodes: this.safeParseJson(dbFlow.published_nodes, []),
      settings: this.safeParseJson(dbFlow.published_settings, {}),
      theme: this.safeParseJson(dbFlow.published_theme, {}),
      status: 'published' as const,
      created_at: dbFlow.created_at || new Date(),
      updated_at: dbFlow.updated_at || new Date(),
      published_at: dbFlow.published_at || new Date(),
      created_by: dbFlow.created_by || undefined,
      version: dbFlow.version || 1
    };
    
    console.log('  - Final nodes:', publishedFlow.nodes);
    console.log('  - Final nodes length:', publishedFlow.nodes.length);
    
    return publishedFlow;
  }

  // Create new flow
  async create(flowData: Partial<Flow>): Promise<Flow> {
    const flowId = uuidv4();
    const now = new Date();
    
    const flow: Flow = {
      id: flowId,
      title: flowData.title || 'Untitled Flow',
      description: flowData.description || '',
      nodes: flowData.nodes || [],
      settings: flowData.settings || {},
      theme: flowData.theme || {},
      status: flowData.status || 'draft',
      created_at: now,
      updated_at: now,
      published_at: flowData.status === 'published' ? now : undefined,
      created_by: flowData.created_by,
      version: 1
    };

    const queries = [
      {
        query: `
          INSERT INTO flows (id, title, description, status, created_by, version)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        params: [flow.id, flow.title, flow.description, flow.status, flow.created_by, flow.version]
      },
      {
        query: `
          INSERT INTO flow_drafts (id, flow_id, nodes, settings, theme)
          VALUES ($1, $2, $3, $4, $5)
        `,
        params: [uuidv4(), flow.id, JSON.stringify(flow.nodes), JSON.stringify(flow.settings), JSON.stringify(flow.theme)]
      }
    ];

    if (flow.status === 'published') {
      queries.push({
        query: `
          INSERT INTO flow_published (id, flow_id, nodes, settings, theme, version)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        params: [uuidv4(), flow.id, JSON.stringify(flow.nodes), JSON.stringify(flow.settings), JSON.stringify(flow.theme), flow.version]
      });
    }

    await executeTransaction(queries);
    return flow;
  }

  // Update flow
  async update(id: string, updates: Partial<Flow>): Promise<Flow | null> {
    const existingFlow = await this.getById(id);
    if (!existingFlow) return null;

    const now = new Date();

    // For general updates, we only update metadata and draft content
    // We don't change the status or interact with published table
    const updatedFlow: Flow = {
      ...existingFlow,
      ...updates,
      // Don't change status on general updates - keep existing status
      status: existingFlow.status,
      updated_at: now
    };

    const queries = [
      {
        query: `
          UPDATE flows
          SET title = $1, description = $2, updated_at = $3
          WHERE id = $4
        `,
        params: [updatedFlow.title, updatedFlow.description, updatedFlow.updated_at, id]
      }
    ];

    // Always update draft table to track changes
    // This is the main purpose of the update method
    queries.push({
      query: `
        INSERT INTO flow_drafts (id, flow_id, nodes, settings, theme, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (flow_id)
        DO UPDATE SET nodes = $3, settings = $4, theme = $5, updated_at = $7
      `,
      params: [uuidv4(), id, JSON.stringify(updatedFlow.nodes), JSON.stringify(updatedFlow.settings), JSON.stringify(updatedFlow.theme), now, now]
    });

    await executeTransaction(queries);
    return updatedFlow;
  }

  async publish(id: string, flowData: Partial<Flow>): Promise<Flow | null> {
    const existingFlow = await this.getById(id);
    if (!existingFlow) return null;

    const now = new Date();
    const newVersion = existingFlow.version + 1;

    // Update main flows table with published status
    const publishedFlow: Flow = {
      ...existingFlow,
      ...flowData,
      status: 'published' as const,
      published_at: now,
      version: newVersion,
      updated_at: now
    };

    const queries = [
      {
        query: `
          UPDATE flows
          SET title = $1, description = $2, status = $3, published_at = $4, version = $5, updated_at = $6
          WHERE id = $7
        `,
        params: [publishedFlow.title, publishedFlow.description, publishedFlow.status, publishedFlow.published_at, publishedFlow.version, publishedFlow.updated_at, id]
      },
      {
        query: `
          INSERT INTO flow_published (id, flow_id, nodes, settings, theme, version, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (flow_id, version)
          DO UPDATE SET nodes = $3, settings = $4, theme = $5, published_at = $7
        `,
        params: [uuidv4(), id, JSON.stringify(publishedFlow.nodes), JSON.stringify(publishedFlow.settings), JSON.stringify(publishedFlow.theme), publishedFlow.version, now]
      }
    ];

    await executeTransaction(queries);
    return publishedFlow;
  }

  // Delete flow
  async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM flows WHERE id = $1';
      await executeQuery(query, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting flow:', error);
      return false;
    }
  }

  // Safe JSON parsing helper method
  private safeParseJson(jsonInput: any, defaultValue: any): any {
    if (!jsonInput) {
      return defaultValue;
    }
    
    // If already an object/array, return as is
    if (typeof jsonInput === 'object') {
      return jsonInput;
    }
    
    // If it's a string, try to parse it
    if (typeof jsonInput === 'string') {
      try {
        // First try: direct parse
        return JSON.parse(jsonInput);
      } catch (error1) {
        try {
          // Second try: handle double-escaped quotes
          // Replace "" with " to fix double-escaped JSON
          const fixedJson = jsonInput.replace(/""/g, '"');
          return JSON.parse(fixedJson);
        } catch (error2) {
          try {
            // Third try: remove outer quotes if they exist
            if (jsonInput.startsWith('"') && jsonInput.endsWith('"')) {
              const unquoted = jsonInput.slice(1, -1);
              const fixedJson = unquoted.replace(/""/g, '"');
              return JSON.parse(fixedJson);
            }
          } catch (error3) {
            // All parsing attempts failed
          }
          
          console.warn('Failed to parse JSON after multiple attempts:', jsonInput);
          console.warn('Parse errors:', { error1, error2 });
          return defaultValue;
        }
      }
    }
    
    // If it's neither string nor object, return default
    return defaultValue;
  }

  // Transform database response to API format
  public transformFlowResponse(dbFlow: any): Flow {
    // For dashboard display, we want to show the current published content
    // but indicate if there are unpublished changes
    let nodes, settings, theme;
    let hasUnpublishedChanges = false;
    
    // Always prioritize published content for dashboard display
    if (dbFlow.published_nodes) {
      nodes = this.safeParseJson(dbFlow.published_nodes, []);
      settings = this.safeParseJson(dbFlow.published_settings, {});
      theme = this.safeParseJson(dbFlow.published_theme, {});
      
      // Check if there are draft changes that haven't been published
      if (dbFlow.draft_nodes) {
        hasUnpublishedChanges = true;
      }
    } else if (dbFlow.draft_nodes) {
      // Fallback to draft content if no published content available
      nodes = this.safeParseJson(dbFlow.draft_nodes, []);
      settings = this.safeParseJson(dbFlow.draft_settings, {});
      theme = this.safeParseJson(dbFlow.draft_theme, {});
    } else {
      // No content available
      nodes = [];
      settings = {};
      theme = {};
    }

    return {
      id: dbFlow.id,
      title: dbFlow.title || '',
      description: dbFlow.description || '',
      nodes: nodes,
      settings: settings,
      theme: theme,
      status: dbFlow.status || 'draft',
      created_at: dbFlow.created_at || new Date(),
      updated_at: dbFlow.updated_at || new Date(),
      published_at: dbFlow.published_at || undefined,
      created_by: dbFlow.created_by || undefined,
      version: dbFlow.version || 1,
      // Add metadata about unpublished changes
      hasUnpublishedChanges: hasUnpublishedChanges
    };
  }
}

export const flowRepository = new FlowRepository();
