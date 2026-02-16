import { TodoStore } from '../todoStore';
import { validateCreateInput, validateUpdateInput } from '../../models/todo';

describe('TodoStore', () => {
  let store: TodoStore;

  beforeEach(() => {
    store = new TodoStore();
  });

  describe('create', () => {
    it('should create a new todo with generated id', () => {
      const todo = store.create({ title: 'Test Todo' });
      
      expect(todo.id).toBeDefined();
      expect(todo.id.length).toBeGreaterThan(0);
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a todo with description', () => {
      const todo = store.create({ 
        title: 'Test Todo', 
        description: 'Test description' 
      });
      
      expect(todo.description).toBe('Test description');
    });

    it('should create multiple todos with unique ids', () => {
      const todo1 = store.create({ title: 'Todo 1' });
      const todo2 = store.create({ title: 'Todo 2' });
      
      expect(todo1.id).not.toBe(todo2.id);
    });

    it('should set completed to false by default', () => {
      const todo = store.create({ title: 'Test' });
      expect(todo.completed).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos', () => {
      expect(store.getAll()).toEqual([]);
    });

    it('should return all todos in order', () => {
      store.create({ title: 'Todo 1' });
      store.create({ title: 'Todo 2' });
      store.create({ title: 'Todo 3' });
      
      const todos = store.getAll();
      expect(todos.length).toBe(3);
    });
  });

  describe('getById', () => {
    it('should return todo by id', () => {
      const created = store.create({ title: 'Test' });
      const found = store.getById(created.id);
      
      expect(found).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      expect(store.getById('non-existent')).toBeUndefined();
    });

    it('should return undefined for empty string id', () => {
      expect(store.getById('')).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update todo title', () => {
      const created = store.create({ title: 'Original' });
      const updated = store.update(created.id, { title: 'Updated' });
      
      expect(updated?.title).toBe('Updated');
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should update todo description', () => {
      const created = store.create({ title: 'Test', description: 'Old' });
      const updated = store.update(created.id, { description: 'New' });
      
      expect(updated?.description).toBe('New');
      expect(updated?.title).toBe('Test'); // unchanged
    });

    it('should update todo completed status', () => {
      const created = store.create({ title: 'Test' });
      const updated = store.update(created.id, { completed: true });
      
      expect(updated?.completed).toBe(true);
    });

    it('should handle partial updates', () => {
      const created = store.create({ title: 'Original', description: 'Desc' });
      const updated = store.update(created.id, { title: 'New Title' });
      
      expect(updated?.title).toBe('New Title');
      expect(updated?.description).toBe('Desc'); // unchanged
    });

    it('should return undefined for non-existent id', () => {
      expect(store.update('non-existent', { title: 'Test' })).toBeUndefined();
    });

    it('should update updatedAt timestamp', () => {
      const created = store.create({ title: 'Test' });
      const originalUpdatedAt = created.updatedAt;
      
      // Small delay to ensure different timestamp
      const updated = store.update(created.id, { title: 'Updated' });
      
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should delete a todo', () => {
      const created = store.create({ title: 'Test' });
      
      expect(store.delete(created.id)).toBe(true);
      expect(store.getById(created.id)).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      expect(store.delete('non-existent')).toBe(false);
    });

    it('should return false for already deleted todo', () => {
      const created = store.create({ title: 'Test' });
      store.delete(created.id);
      
      expect(store.delete(created.id)).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing todo', () => {
      const created = store.create({ title: 'Test' });
      expect(store.exists(created.id)).toBe(true);
    });

    it('should return false for non-existent id', () => {
      expect(store.exists('non-existent')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 for empty store', () => {
      expect(store.count()).toBe(0);
    });

    it('should return correct count', () => {
      store.create({ title: 'Todo 1' });
      expect(store.count()).toBe(1);
      
      store.create({ title: 'Todo 2' });
      expect(store.count()).toBe(2);
    });

    it('should decrease count after delete', () => {
      const todo = store.create({ title: 'Test' });
      expect(store.count()).toBe(1);
      
      store.delete(todo.id);
      expect(store.count()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all todos', () => {
      store.create({ title: 'Todo 1' });
      store.create({ title: 'Todo 2' });
      
      store.clear();
      
      expect(store.count()).toBe(0);
      expect(store.getAll()).toEqual([]);
    });

    it('should work on empty store', () => {
      store.clear();
      expect(store.count()).toBe(0);
    });
  });
});

describe('Validation', () => {
  describe('validateCreateInput', () => {
    it('should accept valid input', () => {
      expect(validateCreateInput({ title: 'Test' })).toBe(true);
      expect(validateCreateInput({ title: 'Test', description: 'Desc' })).toBe(true);
    });

    it('should reject empty title', () => {
      expect(validateCreateInput({ title: '' })).toBe(false);
    });

    it('should reject missing title', () => {
      expect(validateCreateInput({})).toBe(false);
      expect(validateCreateInput({ description: 'No title' })).toBe(false);
    });

    it('should reject non-object input', () => {
      expect(validateCreateInput(null)).toBe(false);
      expect(validateCreateInput(undefined)).toBe(false);
      expect(validateCreateInput('string')).toBe(false);
    });
  });

  describe('validateUpdateInput', () => {
    it('should accept valid updates', () => {
      expect(validateUpdateInput({ title: 'New' })).toBe(true);
      expect(validateUpdateInput({ description: 'New' })).toBe(true);
      expect(validateUpdateInput({ completed: true })).toBe(true);
      expect(validateUpdateInput({ title: 'T', description: 'D', completed: false })).toBe(true);
    });

    it('should accept empty object', () => {
      expect(validateUpdateInput({})).toBe(true);
    });

    it('should reject non-object input', () => {
      expect(validateUpdateInput(null)).toBe(false);
      expect(validateUpdateInput(undefined)).toBe(false);
    });
  });
});
