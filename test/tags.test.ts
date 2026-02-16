import request from 'supertest';
import { app } from '../src/app';
import { todoStore } from '../src/storage/todoStore';
import { isValidTags, validateCreateInput, validateUpdateInput } from '../src/models/todo';
import { DEFAULT_TAGS } from '../src/types';

describe('Tags Feature', () => {
  beforeEach(() => {
    todoStore.clear();
  });

  describe('Model - isValidTags', () => {
    it('should accept valid tags arrays', () => {
      expect(isValidTags([])).toBe(true);
      expect(isValidTags(['tag1'])).toBe(true);
      expect(isValidTags(['tag1', 'tag2', 'tag3'])).toBe(true);
      expect(isValidTags(['urgent', 'work', 'important'])).toBe(true);
    });

    it('should reject non-array values', () => {
      expect(isValidTags('tag')).toBe(false);
      expect(isValidTags(null)).toBe(false);
      expect(isValidTags(undefined)).toBe(false);
      expect(isValidTags(123)).toBe(false);
      expect(isValidTags({})).toBe(false);
    });

    it('should reject arrays with non-string elements', () => {
      expect(isValidTags([1, 2, 3])).toBe(false);
      expect(isValidTags(['tag', 123])).toBe(false);
      expect(isValidTags(['tag', null])).toBe(false);
      expect(isValidTags([{ tag: 'value' }])).toBe(false);
    });
  });

  describe('Model - validateCreateInput with tags', () => {
    it('should accept input with valid tags', () => {
      expect(validateCreateInput({ title: 'Test', tags: ['urgent'] })).toBe(true);
      expect(validateCreateInput({ title: 'Test', tags: [] })).toBe(true);
      expect(validateCreateInput({ title: 'Test', tags: ['a', 'b', 'c'] })).toBe(true);
    });

    it('should accept input without tags', () => {
      expect(validateCreateInput({ title: 'Test' })).toBe(true);
    });

    it('should reject input with invalid tags', () => {
      expect(validateCreateInput({ title: 'Test', tags: 'not-array' })).toBe(false);
      expect(validateCreateInput({ title: 'Test', tags: [1, 2] })).toBe(false);
    });
  });

  describe('Model - validateUpdateInput with tags', () => {
    it('should accept update with valid tags', () => {
      expect(validateUpdateInput({ tags: ['new-tag'] })).toBe(true);
      expect(validateUpdateInput({ tags: [] })).toBe(true);
    });

    it('should reject update with invalid tags', () => {
      expect(validateUpdateInput({ tags: 'invalid' })).toBe(false);
      expect(validateUpdateInput({ tags: [123] })).toBe(false);
    });
  });

  describe('Storage - filter by tag', () => {
    beforeEach(() => {
      todoStore.create({ title: 'Work Task', tags: ['work', 'urgent'] });
      todoStore.create({ title: 'Personal Task', tags: ['personal'] });
      todoStore.create({ title: 'Urgent Personal', tags: ['personal', 'urgent'] });
      todoStore.create({ title: 'No Tags', tags: [] });
    });

    it('should filter by tag', () => {
      const todos = todoStore.getAll({ tag: 'urgent' });
      expect(todos.length).toBe(2);
      todos.forEach(todo => expect(todo.tags).toContain('urgent'));
    });

    it('should return empty when tag not found', () => {
      const todos = todoStore.getAll({ tag: 'nonexistent' });
      expect(todos.length).toBe(0);
    });

    it('should return all when no filter', () => {
      const todos = todoStore.getAll();
      expect(todos.length).toBe(4);
    });

    it('should combine priority and tag filters', () => {
      todoStore.clear();
      todoStore.create({ title: 'High Urgent', priority: 'high', tags: ['urgent'] });
      todoStore.create({ title: 'High Work', priority: 'high', tags: ['work'] });
      todoStore.create({ title: 'Low Urgent', priority: 'low', tags: ['urgent'] });
      
      const todos = todoStore.getAll({ priority: 'high', tag: 'urgent' });
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('High Urgent');
    });
  });

  describe('API - POST /todos with tags', () => {
    it('should create todo with specified tags', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Tagged Task', tags: ['work', 'urgent'] });

      expect(res.status).toBe(201);
      expect(res.body.data.tags).toEqual(['work', 'urgent']);
    });

    it('should default to empty array when tags not specified', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'No Tags Task' });

      expect(res.status).toBe(201);
      expect(res.body.data.tags).toEqual([]);
    });

    it('should accept empty tags array', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Empty Tags', tags: [] });

      expect(res.status).toBe(201);
      expect(res.body.data.tags).toEqual([]);
    });

    it('should return 400 for non-array tags', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Invalid Tags', tags: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('tags');
    });

    it('should return 400 for array with non-strings', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Invalid Tags', tags: [123, 456] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('API - PUT /todos/:id with tags', () => {
    it('should update todo tags', async () => {
      const created = todoStore.create({ title: 'Test', tags: ['old'] });

      const res = await request(app)
        .put(`/todos/${created.id}`)
        .send({ tags: ['new', 'updated'] });

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toEqual(['new', 'updated']);
    });

    it('should clear tags with empty array', async () => {
      const created = todoStore.create({ title: 'Test', tags: ['tag1', 'tag2'] });

      const res = await request(app)
        .put(`/todos/${created.id}`)
        .send({ tags: [] });

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toEqual([]);
    });

    it('should reject invalid tags update', async () => {
      const created = todoStore.create({ title: 'Test' });

      const res = await request(app)
        .put(`/todos/${created.id}`)
        .send({ tags: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('tags');
    });
  });

  describe('API - GET /todos with tag filter', () => {
    beforeEach(async () => {
      await request(app).post('/todos').send({ title: 'Work 1', tags: ['work'] });
      await request(app).post('/todos').send({ title: 'Work 2', tags: ['work', 'urgent'] });
      await request(app).post('/todos').send({ title: 'Personal', tags: ['personal'] });
      await request(app).post('/todos').send({ title: 'No Tags', tags: [] });
    });

    it('should filter by tag=work', async () => {
      const res = await request(app).get('/todos?tag=work');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((todo: any) => {
        expect(todo.tags).toContain('work');
      });
    });

    it('should filter by tag=urgent', async () => {
      const res = await request(app).get('/todos?tag=urgent');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].tags).toContain('urgent');
    });

    it('should return empty for non-existent tag', async () => {
      const res = await request(app).get('/todos?tag=nonexistent');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should return all when no tag filter', async () => {
      const res = await request(app).get('/todos');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
    });
  });

  describe('Constants', () => {
    it('should have correct default tags', () => {
      expect(DEFAULT_TAGS).toEqual([]);
    });
  });
});
