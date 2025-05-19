import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Inbox from './pages/Inbox/Inbox';
import Sentbox from './pages/Sentbox/Sentbox';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  const { setToken } = useAuth();

  // Handle token in URL on initial load
  useEffect(() => {
    // Check if we have a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      console.log("Found token in URL, saving token");
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      
      // Remove token from URL for security
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [setToken]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with shared layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/sentbox" element={<Sentbox />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
