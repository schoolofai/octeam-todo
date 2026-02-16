import { Todo, CreateTodoInput, UpdateTodoInput, Priority, VALID_PRIORITIES, DEFAULT_PRIORITY, DEFAULT_TAGS } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Check if a value is a valid priority
 */
export function isValidPriority(value: unknown): value is Priority {
  return typeof value === 'string' && VALID_PRIORITIES.includes(value as Priority);
}

/**
 * Check if a value is a valid tags array
 */
export function isValidTags(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(item => typeof item === 'string');
}

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
    priority: input.priority || DEFAULT_PRIORITY,
    tags: input.tags || [...DEFAULT_TAGS],
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
    priority: input.priority !== undefined ? input.priority : todo.priority,
    tags: input.tags !== undefined ? input.tags : todo.tags,
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
  
  // Title is required and must be non-empty string
  if (typeof obj.title !== 'string' || obj.title.length === 0) {
    return false;
  }
  
  // Priority is optional, but if provided must be valid
  if (obj.priority !== undefined && !isValidPriority(obj.priority)) {
    return false;
  }
  
  // Tags is optional, but if provided must be valid array of strings
  if (obj.tags !== undefined && !isValidTags(obj.tags)) {
    return false;
  }
  
  return true;
}

/**
 * Validates an UpdateTodoInput
 */
export function validateUpdateInput(input: unknown): input is UpdateTodoInput {
  if (typeof input !== 'object' || input === null) {
    return false;
  }
  const obj = input as Record<string, unknown>;
  
  const hasValidTitle = obj.title === undefined || typeof obj.title === 'string';
  const hasValidDescription = obj.description === undefined || typeof obj.description === 'string';
  const hasValidCompleted = obj.completed === undefined || typeof obj.completed === 'boolean';
  const hasValidPriority = obj.priority === undefined || isValidPriority(obj.priority);
  const hasValidTags = obj.tags === undefined || isValidTags(obj.tags);
  
  return hasValidTitle && hasValidDescription && hasValidCompleted && hasValidPriority && hasValidTags;
}

/**
 * Validates priority query parameter
 */
export function validatePriorityFilter(value: unknown): value is Priority {
  return isValidPriority(value);
}
