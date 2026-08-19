const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Decimal = require('decimal.js');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, async (req, res) => {
  const { amount, type } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.walletMetrics.findFirst({ where: { userId } });
      if (!wallet) throw new Error('Wallet not found');

      const decimalAmount = new Decimal(amount);
      const currentBalance = new Decimal(wallet.balance);
      
      const newBalance = type === 'DEPOSIT' ? currentBalance.plus(decimalAmount) : currentBalance.minus(decimalAmount);
      
      if (newBalance.isNegative()) {
         throw new Error('Insufficient funds');
      }

      await tx.walletMetrics.update({
        where: { id: wallet.id },
        data: { balance: newBalance.toNumber() }
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: decimalAmount.toNumber()
        }
      });

      return transaction;
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
