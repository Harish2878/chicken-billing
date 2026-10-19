-- ==========================================================
-- Sri Kanaka Durga Chicken Center - Billing Management System
-- Database Schema for MySQL
-- Customer: Novel Hotel
-- ==========================================================

CREATE DATABASE IF NOT EXISTS chicken_billing;
USE chicken_billing;

-- Drop tables if needed to recreate cleanly (in reverse foreign key order)
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS daily_supplies;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS hotels;

-- 1. Hotels Table
CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  opening_balance DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('supplier', 'hotel') NOT NULL,
  hotel_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Chicken Supplies Table
CREATE TABLE daily_supplies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT DEFAULT 1,
  supply_date DATE NOT NULL,
  chickens INT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  paper_rate DECIMAL(10,2) NOT NULL,
  deduction DECIMAL(10,2) NOT NULL DEFAULT 60.00,
  final_rate DECIMAL(10,2) NOT NULL,
  total_bill DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
);

-- 4. Bills Table
CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  supply_id INT NOT NULL,
  payment_status ENUM('Pending', 'Partial', 'Paid') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supply_id) REFERENCES daily_supplies(id) ON DELETE CASCADE
);

-- 5. Payments Table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT DEFAULT 1,
  payment_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('Cash', 'UPI', 'Bank Transfer') NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
);

-- ==========================================================
-- SEED DATA
-- Default Credentials:
-- 1. Supplier:    username = MUNAMA123 | password = Harish@2007
-- 2. Novel Hotel: username = hotel     | password = hotel123
-- ==========================================================

-- Insert Hotel Info
INSERT INTO hotels (id, hotel_name, contact_person, phone, address, opening_balance)
VALUES (1, 'Novel Hotel', 'N Ravi Kumar', '+91 95507 14566', 'Station Road, Beside Clock Tower', 0.00);

-- Insert Users (bcrypt hashes for Harish@2007 and hotel123)
INSERT INTO users (username, password_hash, role, hotel_name)
VALUES
('MUNAMA123', '$2a$10$FUVQFXMMS16i38ZiyVYmj.JmwZyfaW3hWHBtA6nmT4bO2dCZ82uWW', 'supplier', NULL),
('hotel', '$2a$10$reu60m5qEzL0FlFJFEqwNuX0LtxYiHafE7b8w/WucIiVXw0J/Nahq', 'hotel', 'Novel Hotel');

-- Optional Sample Data (Uncomment if you want demo records)
-- INSERT INTO daily_supplies (id, hotel_id, supply_date, chickens, weight, paper_rate, deduction, final_rate, total_bill)
-- VALUES
-- (1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 22, 42.50, 240.00, 60.00, 180.00, 7650.00),
-- (2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 25, 48.00, 250.00, 60.00, 190.00, 9120.00),
-- (3, 1, CURDATE(),                           20, 40.00, 250.00, 60.00, 190.00, 7600.00);

-- INSERT INTO bills (id, bill_number, supply_id, payment_status)
-- VALUES
-- (1, CONCAT('SKD-', YEAR(CURDATE()), '-00001'), 1, 'Paid'),
-- (2, CONCAT('SKD-', YEAR(CURDATE()), '-00002'), 2, 'Partial'),
-- (3, CONCAT('SKD-', YEAR(CURDATE()), '-00003'), 3, 'Pending');

-- INSERT INTO payments (hotel_id, payment_date, amount, method, notes)
-- VALUES
-- (1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 7650.00, 'UPI', 'UPI Ref: 4291882910 - Bill #1 Full Payment'),
-- (1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 4000.00, 'Bank Transfer', 'NEFT Transfer - Partial payment for Bill #2');
