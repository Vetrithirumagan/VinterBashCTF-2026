const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with tables and sample data
function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT
    )
  `);

  // Create secrets table (contains the flag)
  db.run(`
    CREATE TABLE IF NOT EXISTS secrets (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      flag TEXT
    )
  `);

  // Insert sample users
  db.run(`INSERT OR IGNORE INTO users (id, username, password, email) VALUES (1, 'admin', 'admin123', 'admin@ctf.local')`);
  db.run(`INSERT OR IGNORE INTO users (id, username, password, email) VALUES (2, 'user', 'password123', 'user@ctf.local')`);

  // Insert flag into secrets table
  db.run(`INSERT OR IGNORE INTO secrets (id, username, password, flag) VALUES (1, 'admin', 'super_secret', 'FLAG{SQL_INJ3CT10N_M4ST3R}')`);
}

// VULNERABLE ENDPOINT - SQL Injection vulnerability
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  // VULNERABLE: String concatenation without sanitization
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }

    if (row) {
      return res.json({ success: true, message: 'Login successful', user: row });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// VULNERABLE ENDPOINT - Another SQL injection point
app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;
  console.log('Received request for user:', username);

  // VULNERABLE: String concatenation without sanitization
  const query = `SELECT * FROM users WHERE username = '${username}'`;

  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (row) {
      return res.json(row);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SQL Injection CTF Backend', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('⚠️  WARNING: This server contains intentional vulnerabilities for educational purposes only!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
