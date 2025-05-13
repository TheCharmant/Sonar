"use client"

import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutGrid,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  ClipboardList,
  Users,
  SettingsIcon,
  LogOut,
} from "lucide-react"
import "./Layout.css"

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user] = useState({
    name: "Powerpuff Cuties",
    email: "powerpuffs@gmail.com",
  })

  const isActive = (path) => {
    return location.pathname === path ? "active" : ""
  }

  // Get the current page title based on the path
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/inbound-mails":
        return "Inbound Mails"
      case "/outbound-mails":
        return "Outbound Mails"
      case "/reports":
        return "Reports"
      case "/audit-logs":
        return "Audit Logs"
      case "/user-management":
        return "User Management"
      case "/settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Soñar" />
          <h1>Soñar</h1>
        </div>

        <nav className="nav-menu">
          <Link to="/dashboard" className={`nav-item ${isActive("/dashboard")}`}>
            <LayoutGrid size={20} />
            <span>Dashboard</span>
          </Link>

          <Link to="/inbound-mails" className={`nav-item ${isActive("/inbound-mails")}`}>
            <ArrowDownLeft size={20} />
            <span>Inbound Mails</span>
          </Link>

          <Link to="/outbound-mails" className={`nav-item ${isActive("/outbound-mails")}`}>
            <ArrowUpRight size={20} />
            <span>Outbound Mails</span>
          </Link>

          <Link to="/reports" className={`nav-item ${isActive("/reports")}`}>
            <BarChart2 size={20} />
            <span>Reports</span>
          </Link>

          <Link to="/audit-logs" className={`nav-item ${isActive("/audit-logs")}`}>
            <ClipboardList size={20} />
            <span>Audit Logs</span>
          </Link>

          <Link to="/user-management" className={`nav-item ${isActive("/user-management")}`}>
            <Users size={20} />
            <span>User Management</span>
          </Link>

          <Link to="/settings" className={`nav-item ${isActive("/settings")}`}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="user-profile">
          <div className="avatar">
            <img src="/placeholder.svg?height=40&width=40" alt="User" />
          </div>
          <div className="user-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="top-nav">
          <div className="top-nav-title">{getPageTitle()}</div>
          <div className="top-nav-actions">
            <button
              className="logout-button"
              onClick={() => {
                localStorage.removeItem("isAuthenticated")
                navigate("/login")
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

