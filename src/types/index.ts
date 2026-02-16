/**
 * Shared TypeScript types for the Todo application
 */

/**
 * Todo item interface
 */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new todo
 */
export interface CreateTodoInput {
  title: string;
  description?: string;
}

/**
 * Input for updating an existing todo
 */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
