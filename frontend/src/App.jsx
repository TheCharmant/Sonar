import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLogin from "./pages/Admin/login";
import AdminDashboard from "./pages/admin/dashboard"; 
import Signup from "./pages/Signup";
import Login from "./pages/Admin/login";
import NewCommunication from "./pages/NewCommunication";
import SearchFilters from "./pages/Search";
import ReportsAnalysis from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import "./index.css";

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
        <Route path="/" element={user ? <Navigate to="/admin-dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/admin-login" element={<AdminLogin setUser={setUser} />} />
        
        <Route
          path="/admin-dashboard"
          element={user ? (
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <AdminDashboard user={user} />
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />
        {/* Nested inside admin layout */}
        {user && (
          <>
            <Route
              path="/dashboard"
              element={
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6">
                    <Dashboard />
                  </main>
                </div>
              }
            />
            <Route path="/new-communication" element={<NewCommunication />} />
            <Route path="/search-filters" element={<SearchFilters />} />
            <Route path="/reports-analysis" element={<ReportsAnalysis />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
