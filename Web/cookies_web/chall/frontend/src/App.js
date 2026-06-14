import React from 'react';
import './App.css';

function App() {
  const isAdmin = window.location.pathname === '/admin';

  if (isAdmin) {
    return (
      <div className="App">
        <div className="admin-container">
          <h1>🔒 ADMIN PANEL</h1>
          
          <div className="warning">
            ⚠️ YOU HAVE ACCESSED A RESTRICTED AREA ⚠️
          </div>

          <div className="success-message">
            ❓ Is the admin really that lethargic to give out the flag so easily?
          </div>

          <div className="robots-grid">
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
          </div>

          <p style={{ color: '#00d4ff', textAlign: 'center', margin: '20px 0' }}>
            These robots guard secrets on the web. They follow robots.txt rules, but you ignored their warnings...
          </p>

          <div className="footer">
            In fact the admin likes COOKIES
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="robot-container">
          <div className="robots-grid">
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
            <div className="robot">🤖</div>
          </div>
          <h1>What do these robots do in the web?</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
