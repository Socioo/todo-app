const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/todos - Get user's own todos
router.get('/', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/todos/:id - Get specific todo
router.get('/:id', async (req, res) => {
  try {
    const todo = await prisma.todo.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - Create new todo
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user.userId
      }
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, dueDate } = req.body;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await prisma.todo.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim(),
        description: description?.trim(),
        completed: completed !== undefined ? completed : existingTodo.completed,
        dueDate: dueDate ? new Date(dueDate) : existingTodo.dueDate
      }
    });

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', async (req, res) => {
  try {
    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await prisma.todo.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// ADMIN ROUTES

// GET /api/todos/admin/all - Get all todos (Admin only)
router.get('/admin/all', requireRole(['ADMIN']), async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    console.error('Admin get all todos error:', error);
    res.status(500).json({ error: 'Failed to fetch all todos' });
  }
});

// DELETE /api/todos/admin/:id - Delete any todo (Admin only)
router.delete('/admin/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.todo.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Todo deleted by admin' });
  } catch (error) {
    console.error('Admin delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;