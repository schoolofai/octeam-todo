import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from './errorHandler';
import { validateCreateInput, validateUpdateInput, isValidPriority, isValidTags } from '../models/todo';

/**
 * Validates request body for creating a todo
 */
export function validateCreateTodo(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check priority first for specific error message
  if (req.body.priority !== undefined && !isValidPriority(req.body.priority)) {
    throw new BadRequestError(`Invalid priority: '${req.body.priority}'. Must be 'high', 'medium', or 'low'`);
  }
  
  // Check tags for specific error message
  if (req.body.tags !== undefined && !isValidTags(req.body.tags)) {
    throw new BadRequestError('Invalid tags: must be an array of strings');
  }
  
  if (!validateCreateInput(req.body)) {
    throw new BadRequestError('Invalid input: title is required and must be a non-empty string');
  }
  next();
}

/**
 * Validates request body for updating a todo
 */
export function validateUpdateTodo(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check priority first for specific error message
  if (req.body.priority !== undefined && !isValidPriority(req.body.priority)) {
    throw new BadRequestError(`Invalid priority: '${req.body.priority}'. Must be 'high', 'medium', or 'low'`);
  }
  
  // Check tags for specific error message
  if (req.body.tags !== undefined && !isValidTags(req.body.tags)) {
    throw new BadRequestError('Invalid tags: must be an array of strings');
  }
  
  if (!validateUpdateInput(req.body)) {
    throw new BadRequestError('Invalid input: title must be string, description must be string, completed must be boolean, priority must be high/medium/low, tags must be array of strings');
  }
  next();
}

/**
 * Validates that :id parameter exists
 */
export function validateIdParam(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new BadRequestError('Invalid ID parameter');
  }
  next();
}
