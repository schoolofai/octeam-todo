import { Router } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todoController';
import {
  validateCreateTodo,
  validateUpdateTodo,
  validateIdParam
} from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /todos - List all todos
 */
router.get('/', asyncHandler(async (req, res) => {
  getAllTodos(req, res);
}));

/**
 * GET /todos/:id - Get a specific todo
 */
router.get('/:id', validateIdParam, asyncHandler(async (req, res) => {
  getTodoById(req, res);
}));

/**
 * POST /todos - Create a new todo
 */
router.post('/', validateCreateTodo, asyncHandler(async (req, res) => {
  createTodo(req, res);
}));

/**
 * PUT /todos/:id - Update an existing todo
 */
router.put('/:id', validateIdParam, validateUpdateTodo, asyncHandler(async (req, res) => {
  updateTodo(req, res);
}));

/**
 * DELETE /todos/:id - Delete a todo
 */
router.delete('/:id', validateIdParam, asyncHandler(async (req, res) => {
  deleteTodo(req, res);
}));

export { router as todoRoutes };
