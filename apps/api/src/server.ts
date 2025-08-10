import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import flowRoutes from './routes/flows.js';
import responseRoutes from './routes/responses.js';
import geolocationRoutes from './routes/geolocation.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { testConnection, healthCheck } from './config/database.js';
import './config/firebaseAdmin.js'; // Initialize Firebase Admin

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
console.log('🔌 Testing Azure PostgreSQL connection...');
testConnection().then(success => {
  if (success) {
    console.log('✅ Azure PostgreSQL connection successful');
  } else {
    console.error('❌ Azure PostgreSQL connection failed');
    process.exit(1);
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      storage: 'Azure PostgreSQL',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      storage: 'Azure PostgreSQL',
      error: error instanceof Error ? error.message : 'Database health check failed'
    });
  }
});

// Template list endpoints (fallback for external requests)
app.get('/get_template_list', (req, res) => {
  console.log('⚠️ Legacy template list endpoint called - this endpoint is deprecated');
  res.status(404).json({
    error: 'Endpoint not available',
    message: 'Template list endpoint is deprecated. Templates are now handled client-side.',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Handle both GET and POST for template list
app.get('/api/get_template_list', (req, res) => {
  console.log('⚠️ Legacy API template list endpoint called (GET) - this endpoint is deprecated');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(404).json({
    error: 'Endpoint not available',
    message: 'Template list endpoint is deprecated. Templates are now handled client-side.',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

app.post('/api/get_template_list', (req, res) => {
  console.log('⚠️ Legacy API template list endpoint called (POST) - this endpoint is deprecated');
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(404).json({
    error: 'Endpoint not available',
    message: 'Template list endpoint is deprecated. Templates are now handled client-side.',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Handle OPTIONS for CORS preflight
app.options('/api/get_template_list', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Global analytics endpoint (must be before /api/flows to avoid conflicts)
app.get('/api/analytics', async (req, res) => {
  console.log('📊 Global analytics endpoint called');
  
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    // Use analyticsRepository instead of storage.js
    const { analyticsRepository } = await import('./repositories/analyticsRepository.js');
    const summary = await analyticsRepository.getAnalyticsSummary();
    
    console.log('📊 Analytics summary:', summary);
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching global analytics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch global analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Handle OPTIONS for analytics CORS preflight
app.options('/api/analytics', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/geo', geolocationRoutes);

// 404 handler
app.use('*', notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Dynamic Flow API server running on port ${PORT}`);
  console.log(`📊 Storage: Azure PostgreSQL`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
