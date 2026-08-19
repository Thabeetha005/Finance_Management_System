-- V43__Truncate_Audit_And_Activity_Logs.sql
-- Truncate audit_logs and activity_logs so all log records are removed and IDs restart from 1.

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;

TRUNCATE TABLE activity_logs;

SET FOREIGN_KEY_CHECKS = 1;
