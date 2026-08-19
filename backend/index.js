const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const invoiceRoutes = require('./routes/invoices');
const adminRoutes = require('./routes/admin');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
