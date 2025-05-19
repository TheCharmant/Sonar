"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../AuthContext"
import {
  LayoutGrid,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  ClipboardList,
  Users,
  LogOut,
} from "lucide-react"
import "./Layout.css"

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  
  // Fetch user profile when component mounts
  useEffect(() => {
    if (token) {
      fetchUserProfile()
    }
  }, [token])
  
  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }
      
      const data = await response.json()
      setUserProfile(data.user)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

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
      default:
        return "Dashboard"
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (userProfile && userProfile.name) {
      return userProfile.name.charAt(0).toUpperCase();
    }
    return "A";
  }

  return (
    <div className="app-container">
      {/* Fixed Violet Header */}
      <div className="app-header">
        <h1 className="app-logo">
          <span className="app-logo-icon">🌙</span>
          <strong>SOÑAR</strong>
        </h1>
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

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className={isActive("/dashboard")}>
                <Link to="/dashboard" className="nav-item">
                  <LayoutGrid size={20} className="nav-icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className={isActive("/inbound-mails")}>
                <Link to="/inbound-mails" className="nav-item">
                  <ArrowDownLeft size={20} className="nav-icon" />
                  <span>Inbound Mails</span>
                </Link>
              </li>
              <li className={isActive("/outbound-mails")}>
                <Link to="/outbound-mails" className="nav-item">
                  <ArrowUpRight size={20} className="nav-icon" />
                  <span>Outbound Mails</span>
                </Link>
              </li>
              <li className={isActive("/reports")}>
                <Link to="/reports" className="nav-item">
                  <BarChart2 size={20} className="nav-icon" />
                  <span>Reports</span>
                </Link>
              </li>
              <li className={isActive("/audit-logs")}>
                <Link to="/audit-logs" className="nav-item">
                  <ClipboardList size={20} className="nav-icon" />
                  <span>Audit Logs</span>
                </Link>
              </li>
              <li className={isActive("/user-management")}>
                <Link to="/user-management" className="nav-item">
                  <Users size={20} className="nav-icon" />
                  <span>User Management</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* User profile at bottom of sidebar */}
          <div className="user-profile-bottom">
            <div className="avatar-circle" style={{backgroundColor: '#c066e8'}}>
              {getInitials()}
            </div>
            <div className="user-info-bottom">
              <p className="user-name">{userProfile?.name || "Admin User"}</p>
              <p className="user-email">{userProfile?.email || "admin@example.com"}</p>
            </div>
          </div>
        </aside>

        <div className="main-content">
          <div className="page-title">{getPageTitle()}</div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout

