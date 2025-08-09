import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { responsesStorage, flowsStorage, updateAnalytics } from '../utils/storage.js';

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
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;
    
    let responses = await responsesStorage.read();
    
    // Filter by flowId
    if (flowId) {
      responses = responses.filter((response: any) => response.flowId === flowId);
    }
    
    // Filter by date range
    if (startDate) {
      responses = responses.filter((response: any) => 
        new Date(response.submittedAt) >= new Date(startDate.toString())
      );
    }
    
    if (endDate) {
      responses = responses.filter((response: any) => 
        new Date(response.submittedAt) <= new Date(endDate.toString())
      );
    }
    
    // Sort responses
    responses.sort((a: any, b: any) => {
      const aValue = a[sortBy.toString()];
      const bValue = b[sortBy.toString()];
      
      if (sortOrder === 'desc') {
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      } else {
        return new Date(aValue).getTime() - new Date(bValue).getTime();
      }
    });
    
    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedResponses = responses.slice(startIndex, endIndex);
    
    res.json({
      responses: paginatedResponses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: responses.length,
        pages: Math.ceil(responses.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// GET /api/responses/:id - Get specific response
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await responsesStorage.findById(id);
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

// POST /api/responses - Submit new form response
router.post('/', async (req, res) => {
  try {
    const { error, value } = responseSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    // Verify that the flow exists
    const flow = await flowsStorage.findById(value.flowId);
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Check if flow is published
    if ((flow as any).status !== 'published') {
      return res.status(400).json({ error: 'Flow is not published' });
    }
    
    // Create response record
    const response = {
      id: uuidv4(),
      ...value,
      submittedAt: new Date().toISOString(),
      metadata: {
        ...value.metadata,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        referrer: req.headers.referer || '',
        submittedAt: new Date().toISOString()
      }
    };
    
    const savedResponse = await responsesStorage.create(response);
    
    // Update analytics
    if ((flow as any).settings?.collectAnalytics) {
      await updateAnalytics(value.flowId, 'submit');
    }
    
    // TODO: Send webhook if configured
    if ((flow as any).settings?.webhookUrl) {
      try {
        // Implement webhook sending logic here
        console.log(`📤 Webhook would be sent to: ${(flow as any).settings.webhookUrl}`);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the response if webhook fails
      }
    }
    
    res.status(201).json({
      id: (savedResponse as any).id,
      message: 'Response submitted successfully',
      submittedAt: (savedResponse as any).submittedAt
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// GET /api/responses/flow/:flowId/export - Export responses for a flow
router.get('/flow/:flowId/export', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { format = 'json' } = req.query;
    
    // Verify flow exists
    const flow = await flowsStorage.findById(flowId);
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const responses = await responsesStorage.search({ flowId });
    
    if (format === 'csv') {
      // Convert to CSV format
      if (responses.length === 0) {
        return res.status(200).send('No responses found');
      }
      
      // Extract headers from first response
      const firstResponse = responses[0] as any;
      const headers = ['id', 'submittedAt', 'completionTime'];
      
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
      
      responses.forEach((response: any) => {
        const row = [];
        row.push(response.id);
        row.push(response.submittedAt);
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
        flowId,
        flowTitle: (flow as any).title,
        totalResponses: responses.length,
        responses,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ error: 'Failed to export responses' });
  }
});

// GET /api/responses/flow/:flowId/analytics - Get response analytics for a flow
router.get('/flow/:flowId/analytics', async (req, res) => {
  try {
    const { flowId } = req.params;
    
    // Verify flow exists
    const flow = await flowsStorage.findById(flowId);
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const responses = await responsesStorage.search({ flowId });
    
    // Calculate analytics
    const totalResponses = responses.length;
    const avgCompletionTime = responses.length > 0
      ? responses.reduce((sum: number, r: any) => sum + (r.metadata?.completionTime || 0), 0) / responses.length
      : 0;
    
    // Group by date
    const responsesByDate: Record<string, number> = {};
    responses.forEach((response: any) => {
      const date = new Date(response.submittedAt).toISOString().split('T')[0];
      responsesByDate[date] = (responsesByDate[date] || 0) + 1;
    });
    
    // Group by device type
    const deviceStats: Record<string, number> = {
      desktop: 0,
      tablet: 0,
      mobile: 0
    };
    
    responses.forEach((response: any) => {
      const deviceType = response.metadata?.deviceType || 'desktop';
      deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
    });
    
    // Question completion rates
    const questionStats: Record<string, { completed: number, skipped: number }> = {};
    
    responses.forEach((response: any) => {
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
      flowId,
      totalResponses,
      averageCompletionTime: Math.round(avgCompletionTime),
      responsesByDate,
      deviceStats,
      questionStats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// DELETE /api/responses/:id - Delete specific response
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await responsesStorage.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

export default router;
