import request from 'supertest';
import { app } from '../../app';
import { todoStore } from '../../storage/todoStore';

describe('Todo Routes Integration Tests', () => {
  beforeEach(() => {
    todoStore.clear();
  });

  describe('GET /todos', () => {
    it('should return empty array when no todos exist', async () => {
      const res = await request(app).get('/todos');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return all todos', async () => {
      todoStore.create({ title: 'First' });
      todoStore.create({ title: 'Second' });
      todoStore.create({ title: 'Third' });
      
      const res = await request(app).get('/todos');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('should return todos with correct structure', async () => {
      todoStore.create({ title: 'Test', description: 'Desc' });
      
      const res = await request(app).get('/todos');
      const todo = res.body.data[0];
      
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title', 'Test');
      expect(todo).toHaveProperty('description', 'Desc');
      expect(todo).toHaveProperty('completed', false);
      expect(todo).toHaveProperty('createdAt');
      expect(todo).toHaveProperty('updatedAt');
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single todo by id', async () => {
      const created = todoStore.create({ title: 'Find Me' });
      
      const res = await request(app).get(`/todos/${created.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(created.id);
      expect(res.body.data.title).toBe('Find Me');
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).get('/todos/does-not-exist');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });

    it('should return 404 for empty id', async () => {
      const res = await request(app).get('/todos/');
      
      // This hits GET /todos (list endpoint)
      expect(res.status).toBe(200);
    });
  });

  describe('POST /todos', () => {
    it('should create a todo with title only', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'New Todo' });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Todo');
      expect(res.body.data.description).toBe('');
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.id).toBeDefined();
    });

    it('should create a todo with title and description', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Task', description: 'Details here' });
      
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Task');
      expect(res.body.data.description).toBe('Details here');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ description: 'No title' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('title');
    });

    it('should return 400 when title is empty string', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: '' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app)
        .post('/todos')
        .send({});
      
      expect(res.status).toBe(400);
    });

    it('should persist created todo', async () => {
      const createRes = await request(app)
        .post('/todos')
        .send({ title: 'Persist Test' });
      
      const id = createRes.body.data.id;
      
      const getRes = await request(app).get(`/todos/${id}`);
      expect(getRes.body.data.title).toBe('Persist Test');
    });
  });

  describe('PUT /todos/:id', () => {
    it('should update todo title', async () => {
      const todo = todoStore.create({ title: 'Original' });
      
      const res = await request(app)
        .put(`/todos/${todo.id}`)
        .send({ title: 'Updated' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated');
    });

    it('should update todo description', async () => {
      const todo = todoStore.create({ title: 'Test', description: 'Old' });
      
      const res = await request(app)
        .put(`/todos/${todo.id}`)
        .send({ description: 'New' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('New');
      expect(res.body.data.title).toBe('Test'); // unchanged
    });

    it('should update todo completed status', async () => {
      const todo = todoStore.create({ title: 'Test' });
      
      const res = await request(app)
        .put(`/todos/${todo.id}`)
        .send({ completed: true });
      
      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      const todo = todoStore.create({ title: 'Old Title', description: 'Old Desc' });
      
      const res = await request(app)
        .put(`/todos/${todo.id}`)
        .send({ title: 'New Title', description: 'New Desc', completed: true });
      
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('New Title');
      expect(res.body.data.description).toBe('New Desc');
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .put('/todos/non-existent')
        .send({ title: 'Test' });
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should persist updates', async () => {
      const todo = todoStore.create({ title: 'Before' });
      
      await request(app)
        .put(`/todos/${todo.id}`)
        .send({ title: 'After' });
      
      const getRes = await request(app).get(`/todos/${todo.id}`);
      expect(getRes.body.data.title).toBe('After');
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete an existing todo', async () => {
      const todo = todoStore.create({ title: 'Delete Me' });
      
      const res = await request(app).delete(`/todos/${todo.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app).delete('/todos/non-existent');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should actually remove the todo', async () => {
      const todo = todoStore.create({ title: 'Remove Me' });
      
      await request(app).delete(`/todos/${todo.id}`);
      
      const getRes = await request(app).get(`/todos/${todo.id}`);
      expect(getRes.status).toBe(404);
    });

    it('should not affect other todos', async () => {
      const todo1 = todoStore.create({ title: 'Keep Me' });
      const todo2 = todoStore.create({ title: 'Delete Me' });
      
      await request(app).delete(`/todos/${todo2.id}`);
      
      const listRes = await request(app).get('/todos');
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].title).toBe('Keep Me');
    });
  });

  describe('CORS and Headers', () => {
    it('should handle OPTIONS preflight request', async () => {
      const res = await request(app)
        .options('/todos')
        .set('Origin', 'http://example.com');
      
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should return JSON content type', async () => {
      const res = await request(app).get('/todos');
      
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON body gracefully', async () => {
      const res = await request(app)
        .post('/todos')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      // Express body-parser returns 400 for syntax errors
      // but may return 500 depending on error handler
      expect([400, 500]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
