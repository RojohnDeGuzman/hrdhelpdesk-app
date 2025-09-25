// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TicketDetail from './components/TicketDetail';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  // Remove unused setIsLoading

  const handleLogin = (userData) => {
    setUser(userData);
    // Store user data in localStorage for persistence
    localStorage.setItem('hr_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hr_user');
  };

  // Check if user is already logged in
  React.useEffect(() => {
    const savedUser = localStorage.getItem('hr_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Remove unused loading screen since we're not using it
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/ticket/:ticketId" element={<TicketDetail user={user} />} />
        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;