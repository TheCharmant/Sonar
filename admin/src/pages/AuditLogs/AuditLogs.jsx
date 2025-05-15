"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import "./AuditLogs.css"

const AuditLogs = () => {
  const [filters, setFilters] = useState({
    user: "",
    actionType: "",
    date: "",
  })

  const auditLogs = [
    { date: "Apr 26, 2020", user: "Baren Bliss", role: "Admin", type: "User Login", action: "Login to acc" },
    { date: "Jul 06, 2023", user: "Wat Sons", role: "Manager", type: "User Signup", action: "Created new acc" },
    { date: "Feb 27, 2024", user: "Absidy Luxe", role: "Admin", type: "User Management", action: "Deleted an acc" },
    {
      date: "Jul 29, 2021",
      user: "charyl@com.com",
      role: "Employee",
      type: "Admin",
      action: "Updated an inbound email",
    },
    {
      date: "Sep 08, 2024",
      user: "lily@gmail.com",
      role: "Employee",
      type: "Auditor",
      action: "Created a new outbound email",
    },
  ]

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  return (
    <div className="audit-logs-container">
      <h1>Audit Logs</h1>

      <div className="filters-container">
        <div className="filter">
          <button className="filter-button">
            User
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="filter">
          <button className="filter-button">
            Action Type
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="filter">
          <button className="filter-button">
            Date
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="logs-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Role</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.date}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      <img src={`/placeholder.svg?height=30&width=30`} alt={log.user} />
                    </div>
                    <span>{log.user}</span>
                  </div>
                </td>
                <td>{log.role}</td>
                <td>{log.type}</td>
                <td>
                  <span className={`action-badge ${getActionClass(log.action)}`}>{log.action}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Helper function to determine the class for action badges
const getActionClass = (action) => {
  if (action.includes("Created")) return "created"
  if (action.includes("Updated")) return "updated"
  if (action.includes("Deleted")) return "deleted"
  if (action.includes("Login")) return "login"
  return ""
}

export default AuditLogs
