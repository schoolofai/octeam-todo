import express, { Application, Request, Response, NextFunction } from 'express';
import { todoRoutes } from './routes/todoRoutes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

/**
 * Request logging middleware
 */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (config.logging.enabled) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
  }
  next();
}

/**
 * CORS middleware
 */
function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = config.cors.origin;
  if (typeof origin === 'string') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (config.cors.credentials) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: config.env
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to octeam-todo API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        todos: '/todos'
      }
    });
  });

  // API routes
  app.use('/todos', todoRoutes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
