import { Todo, CreateTodoInput, UpdateTodoInput } from '../types';
import { createTodo, updateTodo } from '../models/todo';

/**
 * In-memory storage for Todo items
 */
export class TodoStore {
  private todos: Map<string, Todo> = new Map();

  /**
   * Get all todos
   */
  getAll(): Todo[] {
    return Array.from(this.todos.values());
  }

  /**
   * Get a todo by ID
   */
  getById(id: string): Todo | undefined {
    return this.todos.get(id);
  }

  /**
   * Create a new todo
   */
  create(input: CreateTodoInput): Todo {
    const todo = createTodo(input);
    this.todos.set(todo.id, todo);
    return todo;
  }

  /**
   * Update an existing todo
   */
  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const existing = this.todos.get(id);
    if (!existing) {
      return undefined;
    }
    const updated = updateTodo(existing, input);
    this.todos.set(id, updated);
    return updated;
  }

  /**
   * Delete a todo by ID
   */
  delete(id: string): boolean {
    return this.todos.delete(id);
  }

  /**
   * Check if a todo exists
   */
  exists(id: string): boolean {
    return this.todos.has(id);
  }

  /**
   * Get count of todos
   */
  count(): number {
    return this.todos.size;
  }

  /**
   * Clear all todos
   */
  clear(): void {
    this.todos.clear();
  }
}

// Default singleton instance
export const todoStore = new TodoStore();
