import React, { useState } from 'react';
import './App.css';

// Use relative paths - nginx will proxy to backend
// This works in both Docker and local dev
const API_URL = '';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!username) {
      setError('Please enter a username to search');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`/api/user/${username}`);
      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(data.error || 'User not found');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔓 SQL Injection CTF Challenge</h1>
        <p className="subtitle">Find the flag hidden in the database</p>
      </header>

      <div className="container">
        <div className="card">
          <h2>Login Form</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>User Search</h2>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Search by username"
              disabled={loading}
            />
            <button
              onClick={handleSearchUser}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="card error-card">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="card response-card">
            <h3>📋 Response</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
            {response.flag && (
              <div className="flag-found">
                <h2>🎉 Flag Found!</h2>
                <p className="flag">{response.flag}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
