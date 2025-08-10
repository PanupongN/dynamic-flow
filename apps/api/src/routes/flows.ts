import express from 'express';
import { v4 as uuidv4, validate as validateUuid } from 'uuid';
import Joi from 'joi';
import { flowRepository } from '../repositories/flowRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to transform flow storage format to API response format
const transformFlowResponse = (flow: any) => {
  if (!flow) return null;
  
  // The flow object from repository already has the correct nodes, settings, theme
  // because it was processed by repository's transformFlowResponse
  return {
    id: flow.id,
    title: flow.title,
    description: flow.description,
    status: flow.status,
    createdAt: flow.created_at,
    updatedAt: flow.updated_at,
    publishedAt: flow.published_at,
    nodes: flow.nodes || [],
    settings: flow.settings || {},
    theme: flow.theme || {},
    createdBy: flow.created_by,
    version: flow.version
  };
};

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
    
    const flows = await flowRepository.getAll(
      status as string,
      search as string,
      parseInt(limit as string),
      parseInt(page as string)
    );
    
    // Transform to API response format
    const transformedFlows = flows.map(transformFlowResponse);
    
    res.json({
      success: true,
      data: transformedFlows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: flows.length
      }
    });
  } catch (error) {
    console.error('Error fetching flows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flows',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/flows/:id - Get flow by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const flow = await flowRepository.getById(id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    res.json({
      success: true,
      data: flow // flow object from repository already has correct format
    });
  } catch (error) {
    console.error('Error fetching flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/flows/:id/draft - Get draft version of flow
router.get('/:id/draft', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const flow = await flowRepository.getDraftById(id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow draft not found'
      });
    }
    
    res.json({
      success: true,
      data: flow // flow object from repository already has correct format
    });
  } catch (error) {
    console.error('Error fetching flow draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flow draft',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/flows/:id/published - Get published version of flow
router.get('/:id/published', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const flow = await flowRepository.getPublishedById(id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow published version not found'
      });
    }
    
    res.json({
      success: true,
      data: flow // flow object from repository already has correct format
    });
  } catch (error) {
    console.error('Error fetching flow published version:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flow published version',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/flows - Create new flow
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = createFlowSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    const flowData = {
      ...value,
      created_by: req.user?.uid || 'anonymous'
    };
    
    const flow = await flowRepository.create(flowData);
    
    // Record analytics event if enabled
    if (flowData.settings?.collectAnalytics !== false) {
      try {
        await analyticsRepository.recordEvent({
          flow_id: flow.id,
          event_type: 'view',
          user_id: req.user?.uid,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
      } catch (analyticsError) {
        console.warn('Failed to record analytics event:', analyticsError);
      }
    }
    
    res.status(201).json({
      success: true,
      data: transformFlowResponse(flow),
      message: 'Flow created successfully'
    });
  } catch (error) {
    console.error('Error creating flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/flows/:id - Update flow
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const { error, value } = updateFlowSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    const existingFlow = await flowRepository.getById(id);
    
    if (!existingFlow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Check if user has permission to edit this flow
    if (existingFlow.created_by && existingFlow.created_by !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this flow'
      });
    }
    
    const updatedFlow = await flowRepository.update(id, value);
    
    if (!updatedFlow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update flow'
      });
    }
    
    res.json({
      success: true,
      data: transformFlowResponse(updatedFlow),
      message: 'Flow updated successfully'
    });
  } catch (error) {
    console.error('Error updating flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/flows/:id - Delete flow
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const existingFlow = await flowRepository.getById(id);
    
    if (!existingFlow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Check if user has permission to delete this flow
    if (existingFlow.created_by && existingFlow.created_by !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this flow'
      });
    }
    
    const deleted = await flowRepository.delete(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete flow'
      });
    }
    
    res.json({
      success: true,
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/flows/:id/publish - Publish flow
router.post('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const existingFlow = await flowRepository.getById(id);
    
    if (!existingFlow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Check if user has permission to publish this flow
    if (existingFlow.created_by && existingFlow.created_by !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to publish this flow'
      });
    }
    
    // Get current flow data and publish it
    // Use the new publish method that handles published table separately
    // Merge existing flow data with request body data for publishing
    const publishData = {
      ...existingFlow,
      ...req.body,
      nodes: req.body.nodes || existingFlow.nodes,
      settings: req.body.settings || existingFlow.settings,
      theme: req.body.theme || existingFlow.theme
    };
    
    const updatedFlow = await flowRepository.publish(id, publishData);
    
    if (!updatedFlow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to publish flow'
      });
    }
    
    res.json({
      success: true,
      data: transformFlowResponse(updatedFlow),
      message: 'Flow published successfully'
    });
  } catch (error) {
    console.error('Error publishing flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/flows/:id/fix-status - Fix flow status (for debugging, no auth required)
router.post('/:id/fix-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be draft, published, or archived'
      });
    }
    
    const existingFlow = await flowRepository.getById(id);
    
    if (!existingFlow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Update only the status field
    const updatedFlow = await flowRepository.update(id, { status });
    
    if (!updatedFlow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update flow status'
      });
    }
    
    res.json({
      success: true,
      data: transformFlowResponse(updatedFlow),
      message: `Flow status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating flow status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update flow status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/flows/:id/archive - Archive flow
router.post('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateUuid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flow ID format'
      });
    }
    
    const existingFlow = await flowRepository.getById(id);
    
    if (!existingFlow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Check if user has permission to archive this flow
    if (existingFlow.created_by && existingFlow.created_by !== req.user?.uid) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to archive this flow'
      });
    }
    
    const updatedFlow = await flowRepository.update(id, { status: 'archived' });
    
    if (!updatedFlow) {
      return res.status(500).json({
        success: false,
        error: 'Failed to archive flow'
      });
    }
    
    res.json({
      success: true,
      data: transformFlowResponse(updatedFlow),
      message: 'Flow archived successfully'
    });
  } catch (error) {
    console.error('Error archiving flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive flow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
