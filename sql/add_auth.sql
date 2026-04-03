-- =============================================================
-- CSI2132 e-Hotels — add_auth.sql
-- Adds email + password columns to Customer and Employee.
-- NOTE: Passwords stored as plain text for demo purposes only.
-- Run this ONCE after populate.sql.
-- =============================================================

ALTER TABLE Customer
    ADD COLUMN IF NOT EXISTS email    VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS password VARCHAR(100);

ALTER TABLE Employee
    ADD COLUMN IF NOT EXISTS email    VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS password VARCHAR(100);

-- Generate unique emails from names + ID, set password for all
UPDATE Customer SET
    email    = LOWER(firstname) || customerid || '@email.com',
    password = 'password123';

UPDATE Employee SET
    email    = LOWER(firstname) || employeeid || '@ehotels.com',
    password = 'password123';
