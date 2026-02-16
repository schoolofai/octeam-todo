import express, { Application } from 'express';
import { todoRoutes } from './routes/todoRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to octeam-todo API',
    version: '1.0.0',
    endpoints: {
      todos: '/todos'
    }
  });
});

// API routes
app.use('/todos', todoRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { app };
