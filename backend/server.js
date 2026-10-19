import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "skd_chicken_center_super_secret_jwt_key_2026";

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// MySQL Connection Pool (Supports both local and cloud databases like Railway, Render, Aiven, PlanetScale)
const dbConfig = process.env.DATABASE_URL || process.env.MYSQL_URL
  ? process.env.DATABASE_URL || process.env.MYSQL_URL
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "chicken_billing",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
    };

const pool = mysql.createPool(dbConfig);

// Auto-initialize tables and seed data on startup (Ensures seamless online server deployment)
async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ [MySQL] Connected successfully to database`);

    // 1. hotels
    await conn.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        address VARCHAR(255),
        opening_balance DECIMAL(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('supplier', 'hotel') NOT NULL,
        hotel_name VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. daily_supplies
    await conn.query(`
      CREATE TABLE IF NOT EXISTS daily_supplies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT DEFAULT 1,
        supply_date DATE NOT NULL,
        chickens INT NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        paper_rate DECIMAL(10,2) NOT NULL,
        deduction DECIMAL(10,2) DEFAULT 60.00,
        final_rate DECIMAL(10,2) NOT NULL,
        total_bill DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_supply_date (supply_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. bills
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_number VARCHAR(50) NOT NULL UNIQUE,
        supply_id INT NOT NULL,
        payment_status ENUM('Pending', 'Partial', 'Paid') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. payments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT DEFAULT 1,
        payment_date DATE NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        method ENUM('Cash', 'UPI', 'Bank Transfer') NOT NULL,
        notes VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_date (payment_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed Novel Hotel info if missing
    const [hotels] = await conn.query("SELECT id FROM hotels LIMIT 1");
    if (hotels.length === 0) {
      await conn.query(`
        INSERT INTO hotels (id, hotel_name, contact_person, phone, address, opening_balance)
        VALUES (1, 'Novel Hotel', 'N Ravi Kumar', '+91 95507 14566', 'Station Road, Beside Clock Tower', 0.00)
      `);
      console.log("🌱 [MySQL] Auto-seeded Novel Hotel default record.");
    }

    // Seed default credentials if missing
    const [users] = await conn.query("SELECT id FROM users LIMIT 1");
    if (users.length === 0) {
      const supplierHash = await bcrypt.hash("Harish@2007", 10);
      const hotelHash = await bcrypt.hash("hotel123", 10);
      await conn.query(`
        INSERT INTO users (username, password_hash, role, hotel_name)
        VALUES 
        ('MUNAMA123', ?, 'supplier', NULL),
        ('hotel', ?, 'hotel', 'Novel Hotel')
      `, [supplierHash, hotelHash]);
      console.log("🌱 [MySQL] Auto-seeded users: MUNAMA123 (Supplier) & hotel (Novel Hotel).");
    }

    conn.release();
  } catch (err) {
    console.warn(`⚠️ [MySQL Warning] Database initialization notice: ${err.message}`);
  }
}
initDatabase();

// ==========================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ==========================================

// Verify JWT Token
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
  }
}

// Supplier-only access control
function supplierOnly(req, res, next) {
  if (!req.user || req.user.role !== "supplier") {
    return res.status(403).json({
      message: "Access denied. Only Sri Kanaka Durga Supplier can perform this action. Novel Hotel has view-only access."
    });
  }
  next();
}

// ==========================================
// ROUTES
// ==========================================

// Health Check
app.get("/api/health", (_, res) => {
  res.json({ status: "healthy", service: "Sri Kanaka Durga Chicken Billing API", time: new Date() });
});

// 1. LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username.trim()]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        hotelName: user.hotel_name || "Novel Hotel"
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        hotelName: user.hotel_name || (user.role === "hotel" ? "Novel Hotel" : null)
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login. Please check MySQL database connection." });
  }
});

// 2. GET CURRENT USER
app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// 3. DASHBOARD METRICS
app.get("/api/dashboard", auth, async (_, res) => {
  try {
    // Today's supplies
    const [[todaySupply]] = await pool.query(`
      SELECT
        COALESCE(SUM(chickens), 0) AS todayChickens,
        COALESCE(SUM(weight), 0) AS todayWeight,
        COALESCE(SUM(total_bill), 0) AS todayBill
      FROM daily_supplies
      WHERE supply_date = CURDATE()
    `);

    // All-time supplies total
    const [[allBills]] = await pool.query(`
      SELECT COALESCE(SUM(total_bill), 0) AS totalBilled FROM daily_supplies
    `);

    // All-time payments total
    const [[allPaid]] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM payments
    `);

    // Opening balance from hotels table
    const [[hotelInfo]] = await pool.query(`
      SELECT COALESCE(opening_balance, 0) AS openingBalance, hotel_name, contact_person, phone
      FROM hotels WHERE id = 1
    `);

    const openingBalance = Number(hotelInfo?.openingBalance ?? 0);
    const totalBilled = Number(allBills?.totalBilled || 0);
    const totalPaid = Number(allPaid?.totalPaid || 0);
    const pendingBalance = openingBalance + totalBilled - totalPaid;

    // Recent 5 supplies
    const [recentSupplies] = await pool.query(`
      SELECT s.*, b.bill_number, b.payment_status
      FROM daily_supplies s
      LEFT JOIN bills b ON b.supply_id = s.id
      ORDER BY s.supply_date DESC, s.id DESC
      LIMIT 5
    `);

    // Recent 5 payments
    const [recentPayments] = await pool.query(`
      SELECT * FROM payments
      ORDER BY payment_date DESC, id DESC
      LIMIT 5
    `);

    res.json({
      todayChickens: Number(todaySupply.todayChickens),
      todayWeight: Number(todaySupply.todayWeight),
      todayBill: Number(todaySupply.todayBill),
      totalBilled,
      totalPaid,
      previousBalance: openingBalance,
      pendingBalance,
      hotel: hotelInfo || { hotel_name: "Novel Hotel", contact_person: "N Ravi Kumar", phone: "+91 95507 14566" },
      recentSupplies,
      recentPayments
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard metrics. " + error.message });
  }
});

// 4. DAILY SUPPLIES & BILLS LIST
app.get("/api/supplies", auth, async (_, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.id,
        s.supply_date,
        s.chickens,
        s.weight,
        s.paper_rate,
        s.deduction,
        s.final_rate,
        s.total_bill,
        s.created_at,
        b.id AS bill_id,
        b.bill_number,
        b.payment_status
      FROM daily_supplies s
      LEFT JOIN bills b ON b.supply_id = s.id
      ORDER BY s.supply_date DESC, s.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Supplies fetch error:", error);
    res.status(500).json({ message: "Failed to fetch supply records. " + error.message });
  }
});

// 5. CREATE DAILY SUPPLY (Supplier only)
// Business calculation:
// Paper Rate - ₹60/kg Deduction = Final Rate
// Total Bill = Weight * Final Rate
app.post("/api/supplies", auth, supplierOnly, async (req, res) => {
  const { supplyDate, chickens, weight, paperRate } = req.body;

  if (!supplyDate || !chickens || !weight || !paperRate) {
    return res.status(400).json({ message: "All fields (Date, Chickens, Weight, Paper Rate) are required." });
  }

  const numChickens = parseInt(chickens, 10);
  const numWeight = parseFloat(weight);
  const numPaperRate = parseFloat(paperRate);

  if (numChickens <= 0 || isNaN(numChickens)) {
    return res.status(400).json({ message: "Number of chickens must be a positive integer." });
  }
  if (numWeight <= 0 || isNaN(numWeight)) {
    return res.status(400).json({ message: "Weight must be greater than 0 kg." });
  }
  if (numPaperRate < 60 || isNaN(numPaperRate)) {
    return res.status(400).json({ message: "Paper rate must be at least ₹60/kg." });
  }

  // Automatic ₹60 deduction calculation
  const deduction = 60.00;
  const finalRate = parseFloat((numPaperRate - deduction).toFixed(2));
  const totalBill = parseFloat((numWeight * finalRate).toFixed(2));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert into daily_supplies
    const [supplyResult] = await conn.query(
      `INSERT INTO daily_supplies
        (hotel_id, supply_date, chickens, weight, paper_rate, deduction, final_rate, total_bill)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [supplyDate, numChickens, numWeight, numPaperRate, deduction, finalRate, totalBill]
    );

    const supplyId = supplyResult.insertId;

    // 2. Generate Unique Bill Number (e.g. SKD-2026-00004)
    const year = new Date(supplyDate).getFullYear() || new Date().getFullYear();
    const billNumber = `SKD-${year}-${String(supplyId).padStart(5, "0")}`;

    // 3. Insert into bills
    const [billResult] = await conn.query(
      `INSERT INTO bills (bill_number, supply_id, payment_status)
       VALUES (?, ?, 'Pending')`,
      [billNumber, supplyId]
    );

    await conn.commit();

    res.status(201).json({
      message: "Daily supply and bill created successfully.",
      supply: {
        id: supplyId,
        billId: billResult.insertId,
        billNumber,
        supplyDate,
        chickens: numChickens,
        weight: numWeight,
        paperRate: numPaperRate,
        deduction,
        finalRate,
        totalBill,
        paymentStatus: "Pending"
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error("Supply creation error:", error);
    res.status(500).json({ message: "Failed to save daily supply. " + error.message });
  } finally {
    conn.release();
  }
});

// 6. UPDATE BILL PAYMENT STATUS (Supplier only)
app.put("/api/bills/:id/status", auth, supplierOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Partial", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Status must be Pending, Partial, or Paid." });
    }

    await pool.query("UPDATE bills SET payment_status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Bill status updated successfully.", status });
  } catch (error) {
    console.error("Bill status update error:", error);
    res.status(500).json({ message: "Failed to update bill status. " + error.message });
  }
});

// 7. GET PAYMENTS LIST & BALANCE OVERVIEW
app.get("/api/payments", auth, async (_, res) => {
  try {
    const [payments] = await pool.query("SELECT * FROM payments ORDER BY payment_date DESC, id DESC");

    const [[allBills]] = await pool.query("SELECT COALESCE(SUM(total_bill), 0) AS totalBilled FROM daily_supplies");
    const [[allPaid]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM payments");
    const [[hotelInfo]] = await pool.query("SELECT COALESCE(opening_balance, 0) AS openingBalance FROM hotels WHERE id = 1");

    const openingBalance = Number(hotelInfo?.openingBalance ?? 0);
    const totalBilled = Number(allBills?.totalBilled || 0);
    const totalPaid = Number(allPaid?.totalPaid || 0);
    const pendingBalance = openingBalance + totalBilled - totalPaid;

    res.json({
      payments,
      summary: {
        totalBilled,
        totalPaid,
        previousBalance: openingBalance,
        pendingBalance
      }
    });
  } catch (error) {
    console.error("Payments fetch error:", error);
    res.status(500).json({ message: "Failed to fetch payments. " + error.message });
  }
});

// 8. RECORD PAYMENT (Supplier only)
app.post("/api/payments", auth, supplierOnly, async (req, res) => {
  try {
    const { paymentDate, amount, method, notes } = req.body;

    if (!paymentDate || !amount || !method) {
      return res.status(400).json({ message: "Payment date, amount, and payment method are required." });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid number greater than 0." });
    }

    if (!["Cash", "UPI", "Bank Transfer"].includes(method)) {
      return res.status(400).json({ message: "Payment method must be Cash, UPI, or Bank Transfer." });
    }

    const [result] = await pool.query(
      "INSERT INTO payments (hotel_id, payment_date, amount, method, notes) VALUES (1, ?, ?, ?, ?)",
      [paymentDate, numAmount, method, notes ? notes.trim() : null]
    );

    res.status(201).json({
      message: "Payment recorded successfully.",
      payment: {
        id: result.insertId,
        paymentDate,
        amount: numAmount,
        method,
        notes
      }
    });
  } catch (error) {
    console.error("Payment insert error:", error);
    res.status(500).json({ message: "Failed to record payment. " + error.message });
  }
});

// 9. PREVIOUS BALANCE MANAGEMENT
app.get("/api/balance", auth, async (_, res) => {
  try {
    const [[hotelInfo]] = await pool.query("SELECT * FROM hotels WHERE id = 1");
    const [[allBills]] = await pool.query("SELECT COALESCE(SUM(total_bill), 0) AS totalBilled FROM daily_supplies");
    const [[allPaid]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM payments");

    const openingBalance = Number(hotelInfo?.opening_balance ?? 0);
    const totalBilled = Number(allBills?.totalBilled || 0);
    const totalPaid = Number(allPaid?.totalPaid || 0);
    const pendingBalance = openingBalance + totalBilled - totalPaid;

    res.json({
      hotel: hotelInfo || { hotel_name: "Novel Hotel" },
      previousBalance: openingBalance,
      totalBilled,
      totalPaid,
      pendingBalance,
      formula: "Previous Balance + Current Bills - Payments = Pending Balance"
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    res.status(500).json({ message: "Failed to fetch balance details. " + error.message });
  }
});

// Update Opening Previous Balance (Supplier only)
app.put("/api/balance", auth, supplierOnly, async (req, res) => {
  try {
    const { openingBalance } = req.body;
    const numBalance = parseFloat(openingBalance);

    if (isNaN(numBalance)) {
      return res.status(400).json({ message: "Opening balance must be a valid number." });
    }

    await pool.query("UPDATE hotels SET opening_balance = ? WHERE id = 1", [numBalance]);
    res.json({ message: "Opening previous balance updated successfully.", openingBalance: numBalance });
  } catch (error) {
    console.error("Balance update error:", error);
    res.status(500).json({ message: "Failed to update balance. " + error.message });
  }
});

// 10. WEEKLY REPORTS (Monday to Sunday)
app.get("/api/reports/weekly", auth, async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    // Default to current week (Monday to Sunday)
    if (!startDate || !endDate) {
      const today = new Date();
      const day = today.getDay(); // 0 is Sunday, 1 is Monday
      const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);

      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(today.setDate(monday.getDate() + 6));

      startDate = monday.toISOString().slice(0, 10);
      endDate = sunday.toISOString().slice(0, 10);
    }

    // Weekly aggregate supplies
    const [[weeklySupplies]] = await pool.query(
      `SELECT
        COALESCE(SUM(chickens), 0) AS totalChickens,
        COALESCE(SUM(weight), 0) AS totalWeight,
        COALESCE(SUM(total_bill), 0) AS totalBills
       FROM daily_supplies
       WHERE supply_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Weekly aggregate payments
    const [[weeklyPayments]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalPayments
       FROM payments
       WHERE payment_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Supplies prior to this week (for accurate balance calculation)
    const [[priorBills]] = await pool.query(
      `SELECT COALESCE(SUM(total_bill), 0) AS billed
       FROM daily_supplies
       WHERE supply_date < ?`,
      [startDate]
    );

    // Payments prior to this week
    const [[priorPayments]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS paid
       FROM payments
       WHERE payment_date < ?`,
      [startDate]
    );

    const [[hotelInfo]] = await pool.query("SELECT COALESCE(opening_balance, 0) AS openingBalance FROM hotels WHERE id = 1");
    const openingBalance = Number(hotelInfo?.openingBalance ?? 0);

    const previousBalance = openingBalance + Number(priorBills.billed) - Number(priorPayments.paid);
    const totalBills = Number(weeklySupplies.totalBills);
    const totalPayments = Number(weeklyPayments.totalPayments);
    const pendingBalance = previousBalance + totalBills - totalPayments;

    // Daily breakdown for this week
    const [dailyBreakdown] = await pool.query(
      `SELECT
        s.id,
        s.supply_date,
        s.chickens,
        s.weight,
        s.paper_rate,
        s.deduction,
        s.final_rate,
        s.total_bill,
        b.bill_number,
        b.payment_status
       FROM daily_supplies s
       LEFT JOIN bills b ON b.supply_id = s.id
       WHERE s.supply_date BETWEEN ? AND ?
       ORDER BY s.supply_date ASC`,
      [startDate, endDate]
    );

    res.json({
      startDate,
      endDate,
      totalChickens: Number(weeklySupplies.totalChickens),
      totalWeight: Number(weeklySupplies.totalWeight),
      totalBills,
      totalPayments,
      previousBalance,
      pendingBalance,
      dailyBreakdown
    });
  } catch (error) {
    console.error("Weekly report error:", error);
    res.status(500).json({ message: "Failed to generate weekly report. " + error.message });
  }
});

// 11. DELETE DAILY SUPPLY & BILL (Supplier only)
app.delete("/api/supplies/:id", auth, supplierOnly, async (req, res) => {
  const supplyId = req.params.id;
  try {
    await pool.query("DELETE FROM bills WHERE supply_id = ?", [supplyId]);
    const [result] = await pool.query("DELETE FROM daily_supplies WHERE id = ?", [supplyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supply record not found." });
    }
    res.json({ message: "Supply and bill cleared successfully." });
  } catch (error) {
    console.error("Delete supply error:", error);
    res.status(500).json({ message: "Failed to delete supply record. " + error.message });
  }
});

// Also support /api/bills/:id DELETE
app.delete("/api/bills/:id", auth, supplierOnly, async (req, res) => {
  const billId = req.params.id;
  try {
    const [[bill]] = await pool.query("SELECT supply_id FROM bills WHERE id = ?", [billId]);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found." });
    }
    await pool.query("DELETE FROM bills WHERE id = ?", [billId]);
    await pool.query("DELETE FROM daily_supplies WHERE id = ?", [bill.supply_id]);
    res.json({ message: "Bill cleared successfully." });
  } catch (error) {
    console.error("Delete bill error:", error);
    res.status(500).json({ message: "Failed to delete bill. " + error.message });
  }
});

// 12. DELETE PAYMENT (Supplier only)
app.delete("/api/payments/:id", auth, supplierOnly, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM payments WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment record not found." });
    }
    res.json({ message: "Payment cleared successfully." });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Failed to delete payment. " + error.message });
  }
});

// Serve Frontend static build if dist folder exists (Single-Server Cloud Production)
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🍗 Sri Kanaka Durga Chicken Billing Server Running`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
