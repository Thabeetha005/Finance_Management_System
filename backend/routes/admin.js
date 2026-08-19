const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middlewares/auth');

const adminRoles = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'ACCOUNTANT', 'MANAGER'];

const verifyUserExists = async (req, res, next) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  next();
};

router.use('/users/:userId', authenticate, authorize(adminRoles), verifyUserExists);

router.get('/users/:userId/overview', async (req, res) => {
  // Log ADMIN_VIEWED_USER_PROFILE audit log
  console.log(`Audit: ADMIN_VIEWED_USER_PROFILE for user ${req.params.userId} by ${req.user.id}`);
  res.json({ message: 'overview' });
});

router.get('/users/:userId/wallet', async (req, res) => {
  res.json({ message: 'wallet' });
});

router.get('/users/:userId/transactions', async (req, res) => {
  res.json({ message: 'transactions' });
});

router.get('/users/:userId/investments', async (req, res) => {
  res.json({ message: 'investments' });
});

router.get('/users/:userId/loans', async (req, res) => {
  res.json({ message: 'loans' });
});

router.get('/users/:userId/payments', async (req, res) => {
  res.json({ message: 'payments' });
});

router.get('/users/:userId/portfolio-assets', async (req, res) => {
  res.json({ message: 'portfolio-assets' });
});

router.get('/users/:userId/activity', async (req, res) => {
  res.json({ message: 'activity' });
});

router.get('/users/:userId/audit-logs', async (req, res) => {
  res.json({ message: 'audit-logs' });
});

router.get('/users/:userId/documents', async (req, res) => {
  res.json({ message: 'documents' });
});

module.exports = router;
