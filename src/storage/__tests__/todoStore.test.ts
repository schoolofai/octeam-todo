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

    it('should set tags to empty array by default', () => {
      const todo = store.create({ title: 'Test' });
      expect(todo.tags).toEqual([]);
    });

    it('should create todo with specified tags', () => {
      const todo = store.create({ title: 'Test', tags: ['work', 'urgent'] });
      expect(todo.tags).toEqual(['work', 'urgent']);
    });

    it('should create todo with single tag', () => {
      const todo = store.create({ title: 'Test', tags: ['personal'] });
      expect(todo.tags).toEqual(['personal']);
    });

    it('should create multiple todos with different tags', () => {
      const todo1 = store.create({ title: 'Work task', tags: ['work'] });
      const todo2 = store.create({ title: 'Home task', tags: ['personal', 'home'] });
      
      expect(todo1.tags).toEqual(['work']);
      expect(todo2.tags).toEqual(['personal', 'home']);
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

    it('should filter todos by tag', () => {
      store.create({ title: 'Work 1', tags: ['work'] });
      store.create({ title: 'Personal 1', tags: ['personal'] });
      store.create({ title: 'Work 2', tags: ['work', 'urgent'] });
      store.create({ title: 'No tags' });
      
      const workTodos = store.getAll({ tag: 'work' });
      expect(workTodos.length).toBe(2);
      expect(workTodos.every(t => t.tags.includes('work'))).toBe(true);
    });

    it('should return empty array when no todos match tag filter', () => {
      store.create({ title: 'Work', tags: ['work'] });
      store.create({ title: 'Personal', tags: ['personal'] });
      
      const filtered = store.getAll({ tag: 'nonexistent' });
      expect(filtered).toEqual([]);
    });

    it('should return all todos when no filter provided', () => {
      store.create({ title: 'Work', tags: ['work'] });
      store.create({ title: 'Personal', tags: ['personal'] });
      store.create({ title: 'No tags' });
      
      const all = store.getAll();
      expect(all.length).toBe(3);
    });

    it('should filter by tag and return todos with multiple tags', () => {
      store.create({ title: 'Multi-tag', tags: ['work', 'urgent', 'important'] });
      store.create({ title: 'Single tag', tags: ['personal'] });
      
      const urgentTodos = store.getAll({ tag: 'urgent' });
      expect(urgentTodos.length).toBe(1);
      expect(urgentTodos[0].title).toBe('Multi-tag');
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

    it('should update todo tags', () => {
      const created = store.create({ title: 'Test', tags: ['work'] });
      const updated = store.update(created.id, { tags: ['work', 'urgent'] });
      
      expect(updated?.tags).toEqual(['work', 'urgent']);
    });

    it('should not change tags when not in update input', () => {
      const created = store.create({ title: 'Test', tags: ['personal'] });
      const updated = store.update(created.id, { title: 'New Title' });
      
      expect(updated?.tags).toEqual(['personal']);
    });

    it('should allow clearing tags with empty array', () => {
      const created = store.create({ title: 'Test', tags: ['work', 'urgent'] });
      const updated = store.update(created.id, { tags: [] });
      
      expect(updated?.tags).toEqual([]);
    });

    it('should allow replacing all tags', () => {
      const created = store.create({ title: 'Test', tags: ['work', 'urgent'] });
      const updated = store.update(created.id, { tags: ['personal', 'home'] });
      
      expect(updated?.tags).toEqual(['personal', 'home']);
    });

    it('should add tags to todo with empty tags', () => {
      const created = store.create({ title: 'Test' }); // defaults to empty tags
      expect(created.tags).toEqual([]);
      
      const updated = store.update(created.id, { tags: ['new-tag'] });
      expect(updated?.tags).toEqual(['new-tag']);
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

    it('should accept valid tags array in update', () => {
      expect(validateUpdateInput({ tags: [] })).toBe(true);
      expect(validateUpdateInput({ tags: ['work'] })).toBe(true);
      expect(validateUpdateInput({ tags: ['work', 'personal'] })).toBe(true);
    });

    it('should reject non-array tags in update', () => {
      expect(validateUpdateInput({ tags: 'work' })).toBe(false);
      expect(validateUpdateInput({ tags: 123 })).toBe(false);
      expect(validateUpdateInput({ tags: { tag: 'work' } })).toBe(false);
    });

    it('should reject tags array with non-string elements', () => {
      expect(validateUpdateInput({ tags: [123] })).toBe(false);
      expect(validateUpdateInput({ tags: ['work', 123] })).toBe(false);
      expect(validateUpdateInput({ tags: [null] })).toBe(false);
    });
  });

  describe('validateCreateInput with tags', () => {
    it('should accept valid tags array in create', () => {
      expect(validateCreateInput({ title: 'Test', tags: [] })).toBe(true);
      expect(validateCreateInput({ title: 'Test', tags: ['work'] })).toBe(true);
      expect(validateCreateInput({ title: 'Test', tags: ['work', 'personal'] })).toBe(true);
    });

    it('should accept create without tags', () => {
      expect(validateCreateInput({ title: 'Test' })).toBe(true);
    });

    it('should reject non-array tags in create', () => {
      expect(validateCreateInput({ title: 'Test', tags: 'work' })).toBe(false);
      expect(validateCreateInput({ title: 'Test', tags: 123 })).toBe(false);
    });

    it('should reject tags array with non-string elements in create', () => {
      expect(validateCreateInput({ title: 'Test', tags: [123] })).toBe(false);
      expect(validateCreateInput({ title: 'Test', tags: ['work', null] })).toBe(false);
    });
  });
});
