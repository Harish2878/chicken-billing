# 🐔 Sri Kanaka Durga Chicken Center - Billing Management System

A full-stack, enterprise-grade **Chicken Billing Management System** tailored for **Sri Kanaka Durga Chicken Center**, which supplies wholesale broiler chicken to **Novel Hotel**.

---

## 🚀 Key Features

1. **Role-Based Portals & Real Backend Security**:
   - **Supplier Portal (Full Access)**: Manage daily chicken dispatches, bills, payments, opening/previous balance, weekly statements, WhatsApp sharing, and printable invoices.
   - **Novel Hotel Portal (View-Only)**: View real-time daily supply weights, bill history, payments, previous balance, pending dues, weekly reports, and WhatsApp reports. Novel Hotel cannot edit, create, or alter bills or deduction rates.
2. **Automated Business Logic**:
   - Fixed Wholesale Rule: `Paper Rate − ₹60.00/kg Deduction = Final Rate`
   - Bill Amount: `Total Weight (kg) × Final Rate = Total Bill`
   - Live interactive calculator updates as you type.
3. **Double-Entry Balance Reconciliation**:
   - Formula: `Previous Balance + Current Bills − Payments Received = Pending Balance`
4. **Professional Invoicing & Challans**:
   - Unique bill numbers (`SKD-YYYY-XXXXX`).
   - Printable Delivery Challan with supplier & hotel details, itemized breakdown, and signature areas.
   - Downloadable HTML invoices.
5. **Weekly Reports (Monday to Sunday)**:
   - Aggregates birds, weights, bills, payments, and balances for any selected week.
   - One-click Print, Download, and WhatsApp Share.
6. **Instant WhatsApp Integration**:
   - Formatted WhatsApp message ready to send to desktop or Android/iOS WhatsApp app in one tap.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript, CSS3 (responsive for Desktop & Android), Lucide React icons
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), bcrypt password hashing, CORS
- **Database**: MySQL (relational schema with foreign keys and cascade integrity)

---

## 📁 Project Structure

```text
chicken-billing-system/
│
├── database/
│   └── schema.sql              # MySQL schema & pre-seeded users and data
│
├── backend/
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Active local environment settings
│   ├── package.json            # Node.js Express server dependencies
│   └── server.js               # Express API, JWT middleware & business routes
│
├── frontend/
│   ├── index.html              # HTML shell with Google Fonts & responsive viewport
│   ├── vite.config.js          # Vite config
│   ├── package.json            # React + Vite dependencies
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Complete React application & views
│       └── App.css             # Enterprise styling & print layouts
│
└── README.md                   # Full documentation & setup guide
```

---

## 🔑 Default Login Credentials

| User Type | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Supplier** (Sri Kanaka Durga) | `supplier` | `supplier123` | **Full Admin Access** (Dispatch, Bills, Payments, Rates, Balance) |
| **Novel Hotel** (Customer) | `hotel` | `hotel123` | **View-Only Access** (Bills, Challans, Payments, Balance, Reports) |

---

## ⚙️ Installation & Running Guide

### Step 1: Database Setup (MySQL)
1. Ensure your MySQL server (via XAMPP, WAMP, MySQL Workbench, or Command Line) is running on port `3306`.
2. Open your terminal or MySQL command line and import `database/schema.sql`:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *Or open `database/schema.sql` in phpMyAdmin / MySQL Workbench and execute the script.*
   This creates the `chicken_billing` database and tables (`hotels`, `users`, `daily_supplies`, `bills`, `payments`) with sample records and bcrypt password hashes.

---

### Step 2: Start the Backend Server
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Verify or edit `.env` with your MySQL credentials:
   ```env
   PORT=5000
   JWT_SECRET=skd_chicken_center_super_secret_jwt_key_2026
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=chicken_billing
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
   *Expected output:*
   ```text
   🍗 Sri Kanaka Durga Chicken Billing Server Running
   🌐 API Endpoint: http://localhost:5000/api
   ✅ [MySQL] Connected successfully to database: chicken_billing
   ```

---

### Step 3: Start the Frontend Application
1. Open a new terminal window in VS Code and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the URL shown (typically `http://localhost:5173`).

---

## 📱 Mobile & Android Testing
- The layout includes mobile navigation drawer, touch-friendly inputs, and single-column cards on smaller screens.
- WhatsApp sharing opens the WhatsApp application natively on Android/iOS via `api.whatsapp.com/send?text=...`.
- Invoice printing uses `@media print` to render a clean white paper invoice with zero UI clutter.
