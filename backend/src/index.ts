import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { dbService } from './services/database';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customer';
// import planRoutes from './routes/plan'; // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 6-7)
// import materialRoutes from './routes/material'; // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 8-9)
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { applySecurityMiddleware } from './middleware/securityHeaders';
import { corsMiddleware, corsErrorHandler, validateCorsConfig } from './middleware/corsConfig';
import { apiRateLimiter } from './middleware/rateLimiter';

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

// CRITICAL SECURITY: Validate CORS configuration in production
if (!validateCorsConfig()) {
  console.error('🔴 [cors]: Invalid CORS configuration - server cannot start');
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT || 3001;

// Security Middleware (MUST be first, before other middleware)
app.use(applySecurityMiddleware);

// CORS Middleware (hardened with whitelist-based origin checking)
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Middleware (protects all API endpoints)
// Applied globally to /api routes - 100 requests per 15 minutes per IP
app.use('/api', apiRateLimiter);
console.log('✅ [rate-limit]: API rate limiting enabled (100 req/15min per IP)');

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
      // plans: '/api/plans', // TEMPORARILY DISABLED: Schema mismatch (Sprint 6-7)
      // materials: '/api/materials', // TEMPORARILY DISABLED: Schema mismatch (Sprint 8-9)
      docs: '/api-docs (coming soon)'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Foundation Layer Routes
app.use('/api/customers', customerRoutes);
// app.use('/api/plans', planRoutes); // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 6-7)
// app.use('/api/materials', materialRoutes); // TEMPORARILY DISABLED: Schema mismatch - needs refactoring (Sprint 8-9)

// Error handling middleware (must be AFTER all routes)
app.use(notFoundHandler);
app.use(corsErrorHandler); // CORS-specific error handling
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
