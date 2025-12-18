const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth.js');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true,
        _count: {
          select: { todos: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });

    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// GET /api/admin/stats - Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTodos = await prisma.todo.count();
    const completedTodos = await prisma.todo.count({
      where: { completed: true }
    });
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    res.json({
      totalUsers,
      totalTodos,
      completedTodos,
      completionRate: totalTodos > 0 ? (completedTodos / totalTodos * 100).toFixed(1) : 0,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count;
        return acc;
      }, {}),
      recentActivity: await prisma.todo.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, name: true }
          }
        }
      })
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;