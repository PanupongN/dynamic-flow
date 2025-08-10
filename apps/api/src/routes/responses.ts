import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { responseRepository } from '../repositories/responseRepository.js';
import { flowRepository } from '../repositories/flowRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';

const router = express.Router();

// Validation schema for form responses
const responseSchema = Joi.object({
  flowId: Joi.string().required(),
  responses: Joi.array().items(Joi.object({
    nodeId: Joi.string().required(),
    questionId: Joi.string().required(),
    value: Joi.any().required(),
    type: Joi.string().required()
  })).required(),
  metadata: Joi.object({
    userAgent: Joi.string().allow(''),
    ipAddress: Joi.string().allow(''),
    referrer: Joi.string().allow(''),
    completionTime: Joi.number().min(0).required(),
    deviceType: Joi.string().valid('desktop', 'tablet', 'mobile').default('desktop'),
    startedAt: Joi.date().iso(),
    submittedAt: Joi.date().iso()
  }).default({})
});

// GET /api/responses - Get all responses (with filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      flowId, 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1,
      sortBy = 'submitted_at',
      sortOrder = 'desc'
    } = req.query;
    
    if (flowId) {
      // Get responses for specific flow
      const responses = await responseRepository.getByFlowId(
        flowId as string, 
        Number(limit), 
        Number(page)
      );
      
      res.json({
        success: true,
        data: responses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: responses.length
        }
      });
    } else {
      // Get all responses (implement if needed)
      res.status(400).json({
        success: false,
        error: 'flowId is required for this endpoint'
      });
    }
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch responses',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/responses/:id - Get specific response
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await responseRepository.getById(id);
    
    if (!response) {
      return res.status(404).json({ 
        success: false,
        error: 'Response not found' 
      });
    }
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/responses - Submit new form response
router.post('/', async (req, res) => {
  try {
    const { error, value } = responseSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verify that the flow exists
    const flow = await flowRepository.getById(value.flowId);
    if (!flow) {
      return res.status(404).json({ 
        success: false,
        error: 'Flow not found' 
      });
    }
    
    // Check if flow is published
    if (flow.status !== 'published') {
      return res.status(400).json({ 
        success: false,
        error: 'Flow is not published' 
      });
    }
    
    // Create response record
    const responseData = {
      flow_id: value.flowId,
      responses: value.responses,
      metadata: {
        ...value.metadata,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        referrer: req.headers.referer || '',
        submittedAt: new Date().toISOString()
      },
      user_id: req.headers.authorization ? 'authenticated' : undefined,
      session_id: req.headers['x-session-id'] as string,
      ip_address: req.ip || req.connection.remoteAddress || '',
      user_agent: req.headers['user-agent'] || ''
    };
    
    const savedResponse = await responseRepository.create(responseData);
    
    // Record analytics event
    if (flow.settings?.collectAnalytics !== false) {
      try {
        await analyticsRepository.recordEvent({
          flow_id: value.flowId,
          event_type: 'complete',
          event_data: {
            responseId: savedResponse.id,
            completionTime: value.metadata?.completionTime,
            deviceType: value.metadata?.deviceType
          },
          user_id: req.headers.authorization ? 'authenticated' : undefined,
          session_id: req.headers['x-session-id'] as string,
          ip_address: req.ip || req.connection.remoteAddress || '',
          user_agent: req.headers['user-agent'] || ''
        });
      } catch (analyticsError) {
        console.warn('Failed to record analytics event:', analyticsError);
      }
    }
    
    // TODO: Send webhook if configured
    if (flow.settings?.webhookUrl) {
      try {
        // Implement webhook sending logic here
        console.log(`📤 Webhook would be sent to: ${flow.settings.webhookUrl}`);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the response if webhook fails
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: savedResponse.id,
        message: 'Response submitted successfully',
        submittedAt: savedResponse.submitted_at
      }
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/responses/flow/:flowId/export - Export responses for a flow
router.get('/flow/:flowId/export', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { format = 'json' } = req.query;
    
    // Verify flow exists
    const flow = await flowRepository.getById(flowId);
    if (!flow) {
      return res.status(404).json({ 
        success: false,
        error: 'Flow not found' 
      });
    }
    
    const responses = await responseRepository.getByFlowId(flowId, 1000, 1);
    
    if (format === 'csv') {
      // Convert to CSV format
      if (responses.length === 0) {
        return res.status(200).send('No responses found');
      }
      
      // Extract headers from first response
      const firstResponse = responses[0];
      const headers = ['id', 'submitted_at', 'completionTime'];
      
      // Add dynamic headers from response data
      if (firstResponse.responses && firstResponse.responses.length > 0) {
        firstResponse.responses.forEach((resp: any) => {
          if (!headers.includes(resp.questionId)) {
            headers.push(resp.questionId);
          }
        });
      }
      
      // Create CSV content
      let csv = headers.join(',') + '\n';
      
      responses.forEach((response) => {
        const row = [];
        row.push(response.id);
        row.push(response.submitted_at);
        row.push(response.metadata?.completionTime || 0);
        
        // Add response values
        headers.slice(3).forEach(header => {
          const responseData = response.responses?.find((r: any) => r.questionId === header);
          row.push(responseData ? `"${responseData.value}"` : '');
        });
        
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="flow-${flowId}-responses.csv"`);
      res.send(csv);
    } else {
      // Default JSON format
      res.json({
        success: true,
        data: {
          flowId,
          flowTitle: flow.title,
          totalResponses: responses.length,
          responses,
          exportedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export responses',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/responses/flow/:flowId/analytics - Get response analytics for a flow
router.get('/flow/:flowId/analytics', async (req, res) => {
  try {
    const { flowId } = req.params;
    
    // Verify flow exists
    const flow = await flowRepository.getById(flowId);
    if (!flow) {
      return res.status(404).json({ 
        success: false,
        error: 'Flow not found' 
      });
    }
    
    const responses = await responseRepository.getByFlowId(flowId, 1000, 1);
    
    // Calculate analytics
    const totalResponses = responses.length;
    const avgCompletionTime = responses.length > 0
      ? responses.reduce((sum: number, r) => sum + (r.metadata?.completionTime || 0), 0) / responses.length
      : 0;
    
    // Group by date
    const responsesByDate: Record<string, number> = {};
    responses.forEach((response) => {
      const date = new Date(response.submitted_at).toISOString().split('T')[0];
      responsesByDate[date] = (responsesByDate[date] || 0) + 1;
    });
    
    // Group by device type
    const deviceStats: Record<string, number> = {
      desktop: 0,
      tablet: 0,
      mobile: 0
    };
    
    responses.forEach((response) => {
      const deviceType = response.metadata?.deviceType || 'desktop';
      deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
    });
    
    // Question completion rates
    const questionStats: Record<string, { completed: number, skipped: number }> = {};
    
    responses.forEach((response) => {
      if (response.responses) {
        response.responses.forEach((r: any) => {
          if (!questionStats[r.questionId]) {
            questionStats[r.questionId] = { completed: 0, skipped: 0 };
          }
          
          if (r.value !== null && r.value !== undefined && r.value !== '') {
            questionStats[r.questionId].completed++;
          } else {
            questionStats[r.questionId].skipped++;
          }
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        flowId,
        totalResponses,
        averageCompletionTime: Math.round(avgCompletionTime),
        responsesByDate,
        deviceStats,
        questionStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/responses/:id - Delete specific response
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await responseRepository.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Response not found' 
      });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
