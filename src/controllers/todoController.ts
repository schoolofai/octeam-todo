import { Request, Response } from 'express';
import { todoStore } from '../storage/todoStore';
import { NotFoundError } from '../middleware/errorHandler';
import { ApiResponse, Todo, CreateTodoInput, UpdateTodoInput } from '../types';

/**
 * GET /todos - Get all todos
 */
export function getAllTodos(req: Request, res: Response): void {
  const todos = todoStore.getAll();
  const response: ApiResponse<Todo[]> = {
    success: true,
    data: todos
  };
  res.json(response);
}

/**
 * GET /todos/:id - Get a single todo by ID
 */
export function getTodoById(req: Request, res: Response): void {
  const { id } = req.params;
  const todo = todoStore.getById(id);
  
  if (!todo) {
    throw new NotFoundError(`Todo with id '${id}' not found`);
  }
  
  const response: ApiResponse<Todo> = {
    success: true,
    data: todo
  };
  res.json(response);
}

/**
 * POST /todos - Create a new todo
 */
export function createTodo(req: Request, res: Response): void {
  const input: CreateTodoInput = {
    title: req.body.title,
    description: req.body.description
  };
  
  const todo = todoStore.create(input);
  const response: ApiResponse<Todo> = {
    success: true,
    data: todo
  };
  res.status(201).json(response);
}

/**
 * PUT /todos/:id - Update an existing todo
 */
export function updateTodo(req: Request, res: Response): void {
  const { id } = req.params;
  const input: UpdateTodoInput = {};
  
  if (req.body.title !== undefined) input.title = req.body.title;
  if (req.body.description !== undefined) input.description = req.body.description;
  if (req.body.completed !== undefined) input.completed = req.body.completed;
  
  const todo = todoStore.update(id, input);
  
  if (!todo) {
    throw new NotFoundError(`Todo with id '${id}' not found`);
  }
  
  const response: ApiResponse<Todo> = {
    success: true,
    data: todo
  };
  res.json(response);
}

/**
 * DELETE /todos/:id - Delete a todo
 */
export function deleteTodo(req: Request, res: Response): void {
  const { id } = req.params;
  
  if (!todoStore.exists(id)) {
    throw new NotFoundError(`Todo with id '${id}' not found`);
  }
  
  todoStore.delete(id);
  const response: ApiResponse<{ deleted: boolean }> = {
    success: true,
    data: { deleted: true }
  };
  res.json(response);
}
