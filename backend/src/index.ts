import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'MindFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to MindFlow API',
    version: '1.0.0',
    endpoints: {
      health: '/health'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
});

export default app;
