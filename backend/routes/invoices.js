const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { userId: req.user.id }
  });
  res.json(invoices);
});

router.post('/', authenticate, async (req, res) => {
  const { amount } = req.body;
  const invoice = await prisma.invoice.create({
    data: {
      userId: req.user.id,
      amount
    }
  });
  res.json(invoice);
});

module.exports = router;
