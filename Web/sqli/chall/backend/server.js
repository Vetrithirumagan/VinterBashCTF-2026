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
      email TEXT,
      flag TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      // Insert sample users after table is created
      db.run(`INSERT OR IGNORE INTO users (id, username, password, email, flag) VALUES (1, 'admin', 'Vetri.123@VinterBashCTF@FirstTime', 'admin@ctf.local', 'VBCtf{5QL_iNJec7I0N_15_A1WaYS_fUN}')`, (err) => {
        if (err) console.error('Error inserting admin:', err);
      });
      db.run(`INSERT OR IGNORE INTO users (id, username, password, email, flag) VALUES (2, 'user', 'password123', 'user@ctf.local', 'user doesn''t have enough permission to store flag')`, (err) => {
        if (err) console.error('Error inserting user:', err);
      });
    }
  });
}


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }

    if (row) {
      const response = {
        success: true,
        message: 'Login successful',
        user: {
          id: row.id,
          username: row.username,
          email: row.email
        }
      };

      if (row.username === 'admin') {
        response.flag = row.flag;
      }

      return res.json(response);
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/api/user/:username', (req, res) => {
  const { username } = req.params;
  console.log('Received request for user:', username);

  const query = `SELECT * FROM users WHERE username = '${username}'`;

  console.log('Executing query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (row) {
      const response = {
        username: row.username,
        email: row.email
      };
      return res.json(response);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
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
