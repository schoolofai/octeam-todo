import request from 'supertest';
import { app } from '../src/app';
import { todoStore } from '../src/storage/todoStore';
import { isValidPriority, validateCreateInput, validateUpdateInput } from '../src/models/todo';
import { DEFAULT_PRIORITY, VALID_PRIORITIES } from '../src/types';

describe('Priority Feature', () => {
  beforeEach(() => {
    todoStore.clear();
  });

  describe('Model - isValidPriority', () => {
    it('should accept valid priorities', () => {
      expect(isValidPriority('high')).toBe(true);
      expect(isValidPriority('medium')).toBe(true);
      expect(isValidPriority('low')).toBe(true);
    });

    it('should reject invalid priorities', () => {
      expect(isValidPriority('invalid')).toBe(false);
      expect(isValidPriority('')).toBe(false);
      expect(isValidPriority(null)).toBe(false);
      expect(isValidPriority(undefined)).toBe(false);
      expect(isValidPriority(123)).toBe(false);
    });
  });

  describe('Model - validateCreateInput with priority', () => {
    it('should accept input with valid priority', () => {
      expect(validateCreateInput({ title: 'Test', priority: 'high' })).toBe(true);
      expect(validateCreateInput({ title: 'Test', priority: 'medium' })).toBe(true);
      expect(validateCreateInput({ title: 'Test', priority: 'low' })).toBe(true);
    });

    it('should accept input without priority', () => {
      expect(validateCreateInput({ title: 'Test' })).toBe(true);
    });

    it('should reject input with invalid priority', () => {
      expect(validateCreateInput({ title: 'Test', priority: 'invalid' })).toBe(false);
      expect(validateCreateInput({ title: 'Test', priority: 123 })).toBe(false);
    });
  });

  describe('Model - validateUpdateInput with priority', () => {
    it('should accept update with valid priority', () => {
      expect(validateUpdateInput({ priority: 'high' })).toBe(true);
      expect(validateUpdateInput({ priority: 'low' })).toBe(true);
    });

    it('should reject update with invalid priority', () => {
      expect(validateUpdateInput({ priority: 'invalid' })).toBe(false);
    });
  });

  describe('Storage - filter by priority', () => {
    beforeEach(() => {
      todoStore.create({ title: 'High 1', priority: 'high' });
      todoStore.create({ title: 'High 2', priority: 'high' });
      todoStore.create({ title: 'Medium 1', priority: 'medium' });
      todoStore.create({ title: 'Low 1', priority: 'low' });
    });

    it('should filter by high priority', () => {
      const todos = todoStore.getAll({ priority: 'high' });
      expect(todos.length).toBe(2);
      todos.forEach(todo => expect(todo.priority).toBe('high'));
    });

    it('should filter by low priority', () => {
      const todos = todoStore.getAll({ priority: 'low' });
      expect(todos.length).toBe(1);
      expect(todos[0].priority).toBe('low');
    });

    it('should return all when no filter', () => {
      const todos = todoStore.getAll();
      expect(todos.length).toBe(4);
    });
  });

  describe('API - POST /todos with priority', () => {
    it('should create todo with specified priority', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'High Priority Task', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body.data.priority).toBe('high');
    });

    it('should default to medium priority when not specified', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Default Priority Task' });

      expect(res.status).toBe(201);
      expect(res.body.data.priority).toBe('medium');
    });

    it('should return 400 for invalid priority', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Invalid Priority', priority: 'urgent' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('priority');
    });
  });

  describe('API - PUT /todos/:id with priority', () => {
    it('should update todo priority', async () => {
      const created = todoStore.create({ title: 'Test', priority: 'low' });

      const res = await request(app)
        .put(`/todos/${created.id}`)
        .send({ priority: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('high');
    });

    it('should reject invalid priority update', async () => {
      const created = todoStore.create({ title: 'Test' });

      const res = await request(app)
        .put(`/todos/${created.id}`)
        .send({ priority: 'critical' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('priority');
    });
  });

  describe('API - GET /todos with priority filter', () => {
    beforeEach(async () => {
      await request(app).post('/todos').send({ title: 'High 1', priority: 'high' });
      await request(app).post('/todos').send({ title: 'High 2', priority: 'high' });
      await request(app).post('/todos').send({ title: 'Medium 1', priority: 'medium' });
      await request(app).post('/todos').send({ title: 'Low 1', priority: 'low' });
    });

    it('should filter by priority=high', async () => {
      const res = await request(app).get('/todos?priority=high');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((todo: any) => {
        expect(todo.priority).toBe('high');
      });
    });

    it('should filter by priority=low', async () => {
      const res = await request(app).get('/todos?priority=low');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].priority).toBe('low');
    });

    it('should return all when no filter', async () => {
      const res = await request(app).get('/todos');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
    });

    it('should return 400 for invalid priority filter', async () => {
      const res = await request(app).get('/todos?priority=urgent');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('priority');
    });
  });

  describe('Constants', () => {
    it('should have correct default priority', () => {
      expect(DEFAULT_PRIORITY).toBe('medium');
    });

    it('should have all valid priorities defined', () => {
      expect(VALID_PRIORITIES).toContain('high');
      expect(VALID_PRIORITIES).toContain('medium');
      expect(VALID_PRIORITIES).toContain('low');
      expect(VALID_PRIORITIES.length).toBe(3);
    });
  });
});
