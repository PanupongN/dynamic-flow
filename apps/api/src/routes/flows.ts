import express from 'express';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import Joi from 'joi';
import { flowsStorage, updateAnalytics, getAnalytics } from '../utils/storage.js';

const router = express.Router();

// Flow content schema (used for both draft and published)
const flowContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  nodes: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required(),
    position: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required()
    }).required(),
    data: Joi.object().required(),
    connections: Joi.array().items(Joi.object()).default([])
  })).default([]),
  settings: Joi.object({
    allowMultipleSubmissions: Joi.boolean().default(false),
    showProgressBar: Joi.boolean().default(true),
    requireAuth: Joi.boolean().default(false),
    collectAnalytics: Joi.boolean().default(true),
    redirectUrl: Joi.string().uri().allow(''),
    webhookUrl: Joi.string().uri().allow('')
  }).default({}),
  theme: Joi.object().default({})
});

// Validation schemas
const createFlowSchema = flowContentSchema.keys({
  status: Joi.string().valid('draft', 'published', 'archived').default('draft')
});

const updateFlowSchema = flowContentSchema.keys({
  id: Joi.string().optional(), // Allow id but ignore it
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  createdAt: Joi.date().optional(), // Allow but ignore
  updatedAt: Joi.date().optional(), // Allow but ignore
  publishedAt: Joi.date().optional() // Allow but ignore
}).unknown(true);

// GET /api/flows - Get all flows
router.get('/', async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    
    let flows = await flowsStorage.read();
    
    // Filter by status
    if (status) {
      flows = flows.filter((flow: any) => flow.status === status);
    }
    
    // Search by title or description
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      flows = flows.filter((flow: any) => 
        flow.title.toLowerCase().includes(searchTerm) ||
        flow.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedFlows = flows.slice(startIndex, endIndex);
    
    res.json({
      flows: paginatedFlows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: flows.length,
        pages: Math.ceil(flows.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// GET /api/flows/:id - Get specific flow (returns draft for editing)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!validateUuid(id)) {
      return res.status(400).json({ 
        error: 'Invalid flow ID format',
        details: ['Flow ID must be a valid UUID']
      });
    }
    
    const flow = await flowsStorage.findById(id) as any;
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Track view for analytics
    if (flow.draft?.settings?.collectAnalytics || flow.settings?.collectAnalytics) {
      await updateAnalytics(id, 'view');
    }
    
    // Handle both old and new flow structures for backward compatibility
    const responseFlow = flow.draft ? {
      // New structure: merge draft content at root level
      id: flow.id,
      status: flow.status,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      publishedAt: flow.publishedAt,
      ...flow.draft,
      // Include version info for debugging
      versions: {
        draft: flow.draft,
        published: flow.published
      }
    } : {
      // Old structure: return as-is
      ...flow
    };
    
    res.json(responseFlow);
  } catch (error) {
    console.error('Error fetching flow:', error);
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
});

// GET /api/flows/:id/draft - Get draft version
router.get('/:id/draft', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({ 
        error: 'Invalid flow ID format',
        details: ['Flow ID must be a valid UUID']
      });
    }
    
    const flow = await flowsStorage.findById(id) as any;
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Return draft version with metadata
    const draftFlow = {
      id: flow.id,
      status: flow.status,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      publishedAt: flow.publishedAt,
      version: 'draft',
      ...(flow.draft || flow)
    };
    
    res.json(draftFlow);
  } catch (error) {
    console.error('Error fetching draft flow:', error);
    res.status(500).json({ error: 'Failed to fetch draft flow' });
  }
});

// GET /api/flows/:id/published - Get published version (for public access)
router.get('/:id/published', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({ 
        error: 'Invalid flow ID format',
        details: ['Flow ID must be a valid UUID']
      });
    }
    
    const flow = await flowsStorage.findById(id) as any;
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    if (flow.status !== 'published' || !flow.published) {
      return res.status(404).json({ error: 'Flow is not published' });
    }
    
    // Update analytics for public view
    if (flow.published?.settings?.collectAnalytics) {
      await updateAnalytics(id, 'view');
    }
    
    // Return published version
    const publishedFlow = {
      id: flow.id,
      status: flow.status,
      publishedAt: flow.publishedAt,
      version: 'published',
      ...flow.published
    };
    
    res.json(publishedFlow);
  } catch (error) {
    console.error('Error fetching published flow:', error);
    res.status(500).json({ error: 'Failed to fetch published flow' });
  }
});

// POST /api/flows - Create new flow
router.post('/', async (req, res) => {
  try {
    console.log('Creating flow with payload:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = createFlowSchema.validate(req.body);
    
    if (error) {
      console.error('Validation error:', error.details);
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    // Remove any id, createdAt, updatedAt, publishedAt from the payload
    const { id, createdAt, updatedAt, publishedAt, ...cleanValue } = value;
    
    const flowId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Extract content (everything except status)
    const { status, ...content } = cleanValue;
    
    const flow = {
      id: flowId,
      status: status || 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: status === 'published' ? timestamp : null,
      // Store draft content (current working version)
      draft: content,
      // Store published content (only when published)
      published: status === 'published' ? content : null
    };
    
    console.log('Creating flow:', flow.id, flow.title);
    
    const savedFlow = await flowsStorage.create(flow);
    res.status(201).json(savedFlow);
  } catch (error) {
    console.error('Error creating flow:', error);
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

// PUT /api/flows/:id - Update flow
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!validateUuid(id)) {
      return res.status(400).json({ 
        error: 'Invalid flow ID format',
        details: ['Flow ID must be a valid UUID']
      });
    }
    
    console.log('Updating flow with payload:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = updateFlowSchema.validate(req.body);
    
    if (error) {
      console.error('Validation error:', error.details);
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    const existingFlow = await flowsStorage.findById(id);
    if (!existingFlow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Remove system fields that shouldn't be updated directly
    const { id: payloadId, createdAt, ...updateData } = value;
    
    const timestamp = new Date().toISOString();
    const { status, ...content } = updateData;
    
    // Handle both old and new flow structures
    const existingFlowData = existingFlow as any;
    
    // If it's an old flow structure (no draft/published), migrate it
    const currentDraft = existingFlowData.draft || {
      title: existingFlowData.title,
      description: existingFlowData.description,
      nodes: existingFlowData.nodes || [],
      settings: existingFlowData.settings || {},
      theme: existingFlowData.theme || {}
    };
    
    // Always update draft content when saving
    const updatedFlow = await flowsStorage.update(id, {
      id: existingFlowData.id,
      status: status || existingFlowData.status || 'draft',
      createdAt: existingFlowData.createdAt,
      updatedAt: timestamp,
      publishedAt: existingFlowData.publishedAt || null,
      
      // Always update draft content
      draft: { ...currentDraft, ...content },
      
      // Only update published content if status changes to published
      published: status === 'published' && existingFlowData.status !== 'published'
        ? { ...currentDraft, ...content }
        : existingFlowData.published || null
    });
    
    console.log('Updated flow:', id, (updatedFlow as any)?.title);
    
    res.json(updatedFlow);
  } catch (error) {
    console.error('Error updating flow:', error);
    res.status(500).json({ error: 'Failed to update flow' });
  }
});

// DELETE /api/flows/:id - Delete flow
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!validateUuid(id)) {
      return res.status(400).json({ 
        error: 'Invalid flow ID format',
        details: ['Flow ID must be a valid UUID']
      });
    }
    
    const deleted = await flowsStorage.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    console.log('Deleted flow:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting flow:', error);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

// POST /api/flows/:id/publish - Publish flow (copy draft to published)
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await flowsStorage.findById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const timestamp = new Date().toISOString();
    
    const updatedFlow = await flowsStorage.update(id, {
      ...(flow as any),
      status: 'published',
      publishedAt: timestamp,
      updatedAt: timestamp,
      // Copy current draft to published version
      published: (flow as any).draft
    });
    
    res.json(updatedFlow);
  } catch (error) {
    console.error('Error publishing flow:', error);
    res.status(500).json({ error: 'Failed to publish flow' });
  }
});

// POST /api/flows/:id/unpublish - Unpublish flow
router.post('/:id/unpublish', async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await flowsStorage.findById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const updatedFlow = await flowsStorage.update(id, {
      status: 'draft',
      updatedAt: new Date().toISOString()
    });
    
    res.json(updatedFlow);
  } catch (error) {
    console.error('Error unpublishing flow:', error);
    res.status(500).json({ error: 'Failed to unpublish flow' });
  }
});

// GET /api/flows/:id/analytics - Get flow analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await flowsStorage.findById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const analytics = await getAnalytics(id);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/flows/:id/duplicate - Duplicate flow
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const originalFlow = await flowsStorage.findById(id);
    
    if (!originalFlow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const duplicatedFlow = {
      ...(originalFlow as any),
      id: uuidv4(),
      title: `${(originalFlow as any).title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null
    };
    
    const savedFlow = await flowsStorage.create(duplicatedFlow);
    res.status(201).json(savedFlow);
  } catch (error) {
    console.error('Error duplicating flow:', error);
    res.status(500).json({ error: 'Failed to duplicate flow' });
  }
});

export default router;
