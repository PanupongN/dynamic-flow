import express from 'express';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import Joi from 'joi';
import { flowsStorage, updateAnalytics, getAnalytics } from '../utils/storage.js';

const router = express.Router();

// Validation schemas
const createFlowSchema = Joi.object({
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
  theme: Joi.object().default({}),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft')
});

const updateFlowSchema = Joi.object({
  id: Joi.string().optional(), // Allow id but ignore it
  title: Joi.string().min(1).max(200).optional(),
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
  })),
  settings: Joi.object({
    allowMultipleSubmissions: Joi.boolean(),
    showProgressBar: Joi.boolean(),
    requireAuth: Joi.boolean(),
    collectAnalytics: Joi.boolean(),
    redirectUrl: Joi.string().uri().allow(''),
    webhookUrl: Joi.string().uri().allow('')
  }),
  theme: Joi.object(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  createdAt: Joi.date().optional(), // Allow but ignore
  updatedAt: Joi.date().optional(), // Allow but ignore
  publishedAt: Joi.date().optional() // Allow but ignore
});

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

// GET /api/flows/:id - Get specific flow
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
    
    const flow = await flowsStorage.findById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Track view for analytics
    if ((flow as any).settings?.collectAnalytics) {
      await updateAnalytics(id, 'view');
    }
    
    res.json(flow);
  } catch (error) {
    console.error('Error fetching flow:', error);
    res.status(500).json({ error: 'Failed to fetch flow' });
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
    
    const flow = {
      id: uuidv4(),
      ...cleanValue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: cleanValue.status === 'published' ? new Date().toISOString() : null
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
    
    const updatedFlow = await flowsStorage.update(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
      publishedAt: updateData.status === 'published' && (existingFlow as any).status !== 'published' 
        ? new Date().toISOString() 
        : (existingFlow as any).publishedAt
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

// POST /api/flows/:id/publish - Publish flow
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await flowsStorage.findById(id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const updatedFlow = await flowsStorage.update(id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
