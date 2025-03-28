import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLogin from "./pages/admin/login"; 
import AdminDashboard from "./pages/admin/dashboard"; 
import SignUp from "./pages/admin/sign-up"; 



const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect to login if no user */}
        <Route path="/" element={user ? <Navigate to="/admin-dashboard" /> : <Navigate to="/login" />} />

        <Route path="/login" element={<AdminLogin setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Route - Only allow access if user exists */}
        <Route path="/admin-dashboard" element={user ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
