import request from 'supertest';
import { app } from '../src/index';
import { todoStore } from '../src/storage/todoStore';

describe('Todo API', () => {
  beforeEach(() => {
    todoStore.clear();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Welcome to octeam-todo API');
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('GET /todos', () => {
    it('should return empty array when no todos', async () => {
      const res = await request(app).get('/todos');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return all todos', async () => {
      todoStore.create({ title: 'Todo 1' });
      todoStore.create({ title: 'Todo 2' });
      
      const res = await request(app).get('/todos');
      
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a todo by id', async () => {
      const todo = todoStore.create({ title: 'Test Todo' });
      
      const res = await request(app).get(`/todos/${todo.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Todo');
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).get('/todos/non-existent-id');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'New Todo', description: 'Test description' });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Todo');
      expect(res.body.data.description).toBe('Test description');
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ description: 'No title' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /todos/:id', () => {
    it('should update a todo', async () => {
      const todo = todoStore.create({ title: 'Original' });
      
      const res = await request(app)
        .put(`/todos/${todo.id}`)
        .send({ title: 'Updated', completed: true });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .put('/todos/non-existent')
        .send({ title: 'Updated' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete a todo', async () => {
      const todo = todoStore.create({ title: 'To Delete' });
      
      const res = await request(app).delete(`/todos/${todo.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
      expect(todoStore.getById(todo.id)).toBeUndefined();
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app).delete('/todos/non-existent');
      
      expect(res.status).toBe(404);
    });
  });
});
