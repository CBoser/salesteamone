import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbService } from './services/database';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customer';
// import planRoutes from './routes/plan'; // TEMPORARILY DISABLED: Schema mismatch - needs refactoring
import materialRoutes from './routes/material';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { applySecurityMiddleware } from './middleware/securityHeaders';

dotenv.config();

// CRITICAL SECURITY: Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  🔴 FATAL ERROR: JWT_SECRET is not set in production!');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error('  The JWT_SECRET environment variable is REQUIRED in production');
    console.error('  to ensure secure authentication token generation.');
    console.error('');
    console.error('  Please set JWT_SECRET to a cryptographically secure random');
    console.error('  string (minimum 32 characters).');
    console.error('');
    console.error('  Generate a secure secret:');
    console.error('    node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('');
    console.error('  Then set it in your environment:');
    console.error('    export JWT_SECRET="your-generated-secret-here"');
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }

  // Validate JWT_SECRET length (minimum 32 characters for security)
  if (process.env.JWT_SECRET.length < 32) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  🔴 FATAL ERROR: JWT_SECRET is too short!');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error(`  Current length: ${process.env.JWT_SECRET.length} characters`);
    console.error('  Minimum required: 32 characters');
    console.error('');
    console.error('  A short JWT_SECRET compromises security.');
    console.error('  Please use a cryptographically secure secret.');
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }

  console.log('✅ [security]: JWT_SECRET validated (production mode)');
}

// Warn in development if JWT_SECRET is not set
if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
  console.warn('');
  console.warn('⚠️  WARNING: JWT_SECRET not set - using development default');
  console.warn('   This is ONLY acceptable in development mode.');
  console.warn('   NEVER run production without a proper JWT_SECRET!');
  console.warn('');
}

const app: Express = express();
const port = process.env.PORT || 3001;

// Security Middleware (MUST be first, before other middleware)
app.use(applySecurityMiddleware);

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
      // plans: '/api/plans', // TEMPORARILY DISABLED: Schema mismatch
      materials: '/api/materials',
      docs: '/api-docs (coming soon)'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Foundation Layer Routes
app.use('/api/customers', customerRoutes);
// app.use('/api/plans', planRoutes); // TEMPORARILY DISABLED: Schema mismatch - needs refactoring
app.use('/api/materials', materialRoutes);

// Error handling middleware (must be AFTER all routes)
app.use(notFoundHandler);
app.use(errorHandler);

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
