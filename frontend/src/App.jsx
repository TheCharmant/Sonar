import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import AdminLogin from "./pages/admin/login"; 
import AdminDashboard from "./pages/admin/dashboard"; 
import SignUp from "./pages/admin/sign-up"; 
=======
import { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCommunication from "./pages/NewCommunication";
import SearchFilters from "./pages/Search";
import ReportsAnalysis from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import "./index.css";
>>>>>>> f4fc95d (email API integrated & report generation)



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
<<<<<<< HEAD
      <Routes>
        {/* Redirect to login if no user */}
        <Route path="/" element={user ? <Navigate to="/admin-dashboard" /> : <Navigate to="/login" />} />

        <Route path="/login" element={<AdminLogin setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Route - Only allow access if user exists */}
        <Route path="/admin-dashboard" element={user ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
      </Routes>
=======
      {user ? (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-communication" element={<NewCommunication />} />
              <Route path="/search-filters" element={<SearchFilters />} />
              <Route path="/reports-analysis" element={<ReportsAnalysis />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/" element={<Signup setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
>>>>>>> f4fc95d (email API integrated & report generation)
    </Router>
  );
};

export default App;
