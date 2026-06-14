# Cookies Web Challenge

## Overview
This is a web security challenge that teaches about HTTP cookies, JWT (JSON Web Tokens), and how to discover sensitive information through robots.txt files.

## Challenge Objective
Find the hidden flag that's stored as a JWT cookie in a restricted endpoint.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

#### Backend Setup
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000`

#### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm start
```
The frontend will automatically open at `http://localhost:3000`

## How the Challenge Works

1. **Discovery Phase**: Users should check the `robots.txt` file for hints about restricted paths
   - Access: `http://localhost:3000/robots.txt`
   
2. **Restricted Endpoint**: The robots.txt hints at `/api/secret-token`
   - Users can either:
     - Click the "Access Secret Token" button in the React app
     - Manually visit `http://localhost:5000/api/secret-token`

3. **Cookie Reception**: When accessing the endpoint, the server responds with:
   - A JWT token containing the flag
   - The token is set as a cookie named `flag`

4. **Flag Extraction**: Users must:
   - Access the restricted endpoint
   - Extract the JWT from cookies (visible in browser DevTools)
   - Decode the JWT to reveal the flag

## Key Concepts Taught

- **robots.txt**: Understanding web crawlers and hidden paths
- **HTTP Cookies**: How cookies are set and stored
- **JWT (JSON Web Tokens)**: Token-based authentication and data encoding
- **CORS**: Cross-Origin Resource Sharing
- **Browser DevTools**: Using developer tools to inspect cookies

## Files

- `frontend/`: React application with UI for the challenge
- `backend/`: Express.js server that handles the secret endpoint
- `frontend/public/robots.txt`: Hints about the restricted path

## The Flag

The flag is: `VBCtf{cOokI3s_In_w3B_arE_iN73R3sTin6}`

This flag is encoded as a JWT token and returned as a cookie when the restricted endpoint is accessed.

## Hints for Players

1. Always check `robots.txt` when exploring websites
2. The robots.txt mentions paths that should be disallowed
3. One of those disallowed paths contains the secret
4. Open Browser DevTools (F12) → Application → Cookies to see the JWT
5. Decode the JWT to extract the flag (use online JWT decoders or NodeJS)

## Running Both Services

Use two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
```

## Technical Details

- **Backend Port**: 5000
- **Frontend Port**: 3000
- **JWT Secret**: `super-secret-jwt-key-for-ctf` (configurable via environment variable)
- **Token Expiration**: 24 hours
- **Cookie Name**: `flag`
