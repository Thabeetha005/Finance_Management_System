-- Migration: V47__drop_unused_scaffolding.sql
-- Purpose: Safely drop unused early prototyping scaffolding tables (V2/V3) that have no backend service or active frontend callers.
-- Audit Trace:
--   Unused tables: invoice_items, invoices, clients, vendors, budgets, expenses, incomes.
-- Manual Rollback:
--   See V2__finance_tables.sql and V3__clients_vendors.sql for table definitions if re-creation is ever required.

DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS incomes;
