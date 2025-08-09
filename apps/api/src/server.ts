import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import flowRoutes from './routes/flows.js';
import responseRoutes from './routes/responses.js';
import { initializeStorage } from './utils/storage.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

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

// Initialize storage
await initializeStorage();

// Routes
app.use('/api/flows', flowRoutes);
app.use('/api/responses', responseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    storage: 'JSON file-based'
  });
});

// 404 handler
app.use('*', notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Dynamic Flow API server running on port ${PORT}`);
  console.log(`📊 Storage: JSON file-based`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
