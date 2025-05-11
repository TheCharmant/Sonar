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
  )
}

export default App

