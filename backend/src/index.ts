import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './services/database';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customer';
import planRoutes from './routes/plan';
import materialRoutes from './routes/material';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (includes database status)
app.get('/health', async (req: Request, res: Response) => {
  const dbHealthy = await dbService.healthCheck();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'ok' : 'degraded',
    message: 'MindFlow API is running',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to MindFlow API',
    version: '1.0.0',
    description: 'Construction Management Platform - Foundation Layer',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      customers: '/api/customers',
      plans: '/api/plans',
      materials: '/api/materials',
      docs: '/api-docs (coming soon)'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Foundation Layer Routes
app.use('/api/customers', customerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/materials', materialRoutes);

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await dbService.connect();

    // Start Express server
    app.listen(port, () => {
      console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
      console.log(`📊 [database]: Connected to PostgreSQL`);
      console.log(`🚀 [ready]: MindFlow API is ready to accept requests`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 [shutdown]: Gracefully shutting down...');
  await dbService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 [shutdown]: Gracefully shutting down...');
  await dbService.disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
