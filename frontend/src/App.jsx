import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('libraryUser')) || null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  function handleLogin(loggedInUser) {
    localStorage.setItem('libraryUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    navigate('/');
  }

  function handleLogout() {
    localStorage.removeItem('libraryUser');
    setUser(null);
    navigate('/login');
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
