const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-jwt-key-for-ctf';

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));

app.use(express.json());

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin
Disallow: /api/secret-token
Disallow: /flag-endpoint

# WARNING: The following path is RESTRICTED!
# /admin - Do NOT access this path!
# This path contains sensitive information and is forbidden by robots.txt`);
});

// The flag that will be encoded in the JWT
const FLAG = 'VBCtf{cOokI3s_In_w3B_arE_iN73R3sTin6}';

// Secret endpoint that returns the flag as a JWT cookie
app.get('/api/secret-token', (req, res) => {
  try {
    // Create JWT token with the flag
    const token = jwt.sign(
      { 
        flag: FLAG,
        timestamp: new Date().toISOString()
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Set the JWT as an HTTP-only cookie (for security)
    res.cookie('flag', token, {
      httpOnly: false, // Set to false so JavaScript can access it for the challenge
      secure: false, // Set to false for local development
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Flag cookie set!',
      token: token,
      hint: 'The JWT contains your flag. Decode it to see the payload.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Alternative: Admin page hint
app.get('/admin', (req, res) => {
  res.json({
    message: 'This is a restricted admin area. Hints: Check robots.txt for the real secret endpoint.'
  });
});

// Decode JWT endpoint (helper for users)
app.post('/api/decode-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.decode(token); // Decode without verification (for convenience)
    res.json({
      success: true,
      decoded: decoded,
      flag: decoded?.flag || 'Flag not found in token'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    hint: 'Try accessing /api/secret-token - find the hint in robots.txt'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Frontend will be on http://localhost:3001`);
  console.log(`🔑 Secret endpoint: http://localhost:${PORT}/api/secret-token`);
  console.log(`📋 Check robots.txt for hints!`);
});
