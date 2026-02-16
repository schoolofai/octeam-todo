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
 * Default tags for new todos
 */
export const DEFAULT_TAGS: string[] = [];

/**
 * Todo item interface
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
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
  tags?: string[];
}

/**
 * Input for updating an existing todo
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
