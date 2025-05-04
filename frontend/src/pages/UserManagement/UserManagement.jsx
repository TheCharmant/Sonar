"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, ChevronDown, Edit, UserCog } from "lucide-react"
import "./UserManagement.css"

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState(null)

  const users = [
    { id: 1, name: "Issy Andrade", role: "Admin", status: "Admin", active: true },
    { id: 2, name: "Vice Ganda", role: "Admin", status: "Manager", active: false },
    { id: 3, name: "Baren Bliss", role: "Admin", status: "Manager", active: true },
    { id: 4, name: "Colou Rette", role: "Admin", status: "Manager", active: true },
  ]

  const handleToggleActive = (userId) => {
    const user = users.find((u) => u.id === userId)
    if (user.active) {
      setUserToDeactivate(user)
      setShowConfirmDialog(true)
    } else {
      // In a real app, you would update the user's active status
      console.log(`Activating user ${userId}`)
    }
  }

  const confirmDeactivate = () => {
    // In a real app, you would update the user's active status
    console.log(`Deactivating user ${userToDeactivate.id}`)
    setShowConfirmDialog(false)
    setUserToDeactivate(null)
  }

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>Users List</h1>
        <Link to="/add-user" className="add-user-button">
          Add New User
        </Link>
      </div>

      <div className="user-filters">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="role-filter">
          <button className="filter-button">
            <span>Admins</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>User</th>
              <th>Status</th>
              <th>Activate/Deactivate</th>
              <th colSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.role}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      <img src={`/placeholder.svg?height=30&width=30`} alt={user.name} />
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.status}</td>
                <td>
                  <label className="toggle">
                    <input type="checkbox" checked={user.active} onChange={() => handleToggleActive(user.id)} />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <button className="action-button">
                    <Edit size={16} />
                    <span>Edit User</span>
                  </button>
                </td>
                <td>
                  <button className="action-button">
                    <UserCog size={16} />
                    <span>Change role</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <div className="warning-icon">⚠️</div>
              <h3>Are you sure you want to deactivate this user?</h3>
            </div>
            <div className="confirm-dialog-actions">
              <button className="cancel-button" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="confirm-button" onClick={confirmDeactivate}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement

