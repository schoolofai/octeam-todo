import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a new Todo object from input
 */
export function createTodo(input: CreateTodoInput): Todo {
  const now = new Date();
  return {
    id: uuidv4(),
    title: input.title,
    description: input.description || '',
    completed: false,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Updates an existing Todo with new values
 */
export function updateTodo(todo: Todo, input: UpdateTodoInput): Todo {
  return {
    ...todo,
    title: input.title !== undefined ? input.title : todo.title,
    description: input.description !== undefined ? input.description : todo.description,
    completed: input.completed !== undefined ? input.completed : todo.completed,
    updatedAt: new Date()
  };
}

/**
 * Validates a CreateTodoInput
 */
export function validateCreateInput(input: unknown): input is CreateTodoInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  const obj = input as Record<string, unknown>;
  return typeof obj.title === 'string' && obj.title.length > 0;
}

/**
 * Validates an UpdateTodoInput
 */
export function validateUpdateInput(input: unknown): input is UpdateTodoInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  const obj = input as Record<string, unknown>;
  
  // At least one valid field must be present
  const hasValidTitle = obj.title === undefined || typeof obj.title === 'string';
  const hasValidDescription = obj.description === undefined || typeof obj.description === 'string';
  const hasValidCompleted = obj.completed === undefined || typeof obj.completed === 'boolean';
  
  return hasValidTitle && hasValidDescription && hasValidCompleted;
}
