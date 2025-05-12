import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< Updated upstream:frontend/src/App.jsx
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
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import Signup from "./pages/Signup/Signup"
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"
import Dashboard from "./pages/Dashboard/Dashboard"
import InboundMails from "./pages/InboundMails/InboundMails"
import OutboundMails from "./pages/OutboundMails/OutboundMails"
import Reports from "./pages/Reports/Reports"
import AuditLogs from "./pages/AuditLogs/AuditLogs"
import UserManagement from "./pages/UserManagement/UserManagement"
import Settings from "./pages/Settings/Settings"
import AddUser from "./pages/AddUser/AddUser"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import "./App.css"
=======
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import InboundMails from "./pages/InboundMails/InboundMails";
import OutboundMails from "./pages/OutboundMails/OutboundMails";
import Reports from "./pages/Reports/Reports";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import UserManagement from "./pages/UserManagement/UserManagement";
import Settings from "./pages/Settings/Settings";
import AddUser from "./pages/AddUser/AddUser";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import "./App.css";
>>>>>>> Stashed changes:admin/src/App.jsx

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbound-mails" element={<InboundMails />} />
            <Route path="/outbound-mails" element={<OutboundMails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

<<<<<<< Updated upstream:frontend/src/App.jsx


=======
export default App;
>>>>>>> Stashed changes:admin/src/App.jsx
