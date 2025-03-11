import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Admin/Admin-Login";
import AdminDashboard from "./pages/Admin/admin-dashboard";
import InboundMails from "./pages/Admin/inbound-mails";
import AuditLogs from "./pages/Admin/audit-logs";
import Reports from "./pages/Admin/Reports";
import OutboundMails from "./pages/Admin/outbound-mails";
import Settings from "./pages/Admin/Settings";
import UserManagement from "./pages/Admin/user-management";
import Sidebar from "./components/Sidebar";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes (Login) */}
        {!user ? (
          <>
            <Route path="/" element={<Login setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            {/* Admin Dashboard & Other Pages */}
            <Route path="/admin-dashboard" element={<AdminDashboard setUser={setUser} />} />
            <Route path="/inbound-mails" element={<InboundMails />} />
            <Route path="/outbound-mails" element={<OutboundMails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
