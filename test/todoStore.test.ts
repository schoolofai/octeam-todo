import { TodoStore } from '../src/storage/todoStore';

describe('TodoStore', () => {
  let store: TodoStore;

  beforeEach(() => {
    store = new TodoStore();
  });

  describe('create', () => {
    it('should create a new todo', () => {
      const todo = store.create({ title: 'Test Todo' });
      
      expect(todo.id).toBeDefined();
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
  });

  describe('getAll', () => {
    it('should return empty array when no todos', () => {
      expect(store.getAll()).toEqual([]);
    });

    it('should return all todos', () => {
      store.create({ title: 'Todo 1' });
      store.create({ title: 'Todo 2' });
      
      const todos = store.getAll();
      expect(todos.length).toBe(2);
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
  });

  describe('update', () => {
    it('should update todo title', () => {
      const created = store.create({ title: 'Original' });
      const updated = store.update(created.id, { title: 'Updated' });
      
      expect(updated?.title).toBe('Updated');
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should update todo completed status', () => {
      const created = store.create({ title: 'Test' });
      const updated = store.update(created.id, { completed: true });
      
      expect(updated?.completed).toBe(true);
    });

    it('should return undefined for non-existent id', () => {
      expect(store.update('non-existent', { title: 'Test' })).toBeUndefined();
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
  });

  describe('count', () => {
    it('should return correct count', () => {
      expect(store.count()).toBe(0);
      
      store.create({ title: 'Todo 1' });
      expect(store.count()).toBe(1);
      
      store.create({ title: 'Todo 2' });
      expect(store.count()).toBe(2);
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
  });
});
