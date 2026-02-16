/**
 * Shared TypeScript types for the Todo application
 */

/**
 * Priority levels for todos
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Valid priority values
 */
export const VALID_PRIORITIES: Priority[] = ['high', 'medium', 'low'];

/**
 * Default priority for new todos
 */
export const DEFAULT_PRIORITY: Priority = 'medium';

/**
 * Todo item interface
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new todo
 */
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
}

/**
 * Input for updating an existing todo
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
