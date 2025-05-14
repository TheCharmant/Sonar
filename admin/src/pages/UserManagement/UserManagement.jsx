"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, ChevronDown, Edit, UserCog } from "lucide-react"
import axios from "axios"
import "./UserManagement.css"

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roleFilter, setRoleFilter] = useState("All")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/users', {
        withCredentials: true
      })
      setUsers(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId) => {
    const user = users.find((u) => u.id === userId)
    if (user.active) {
      setUserToDeactivate(user)
      setShowConfirmDialog(true)
    } else {
      await activateUser(userId)
    }
  }

  const activateUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/activate`, {}, {
        withCredentials: true
      })
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: true } : user
      ))
    } catch (err) {
      console.error("Error activating user:", err)
      alert("Failed to activate user. Please try again.")
    }
  }

  const confirmDeactivate = async () => {
    try {
      await axios.put(`/api/admin/users/${userToDeactivate.id}/deactivate`, {}, {
        withCredentials: true
      })
      // Update local state
      setUsers(users.map(user => 
        user.id === userToDeactivate.id ? { ...user, active: false } : user
      ))
    } catch (err) {
      console.error("Error deactivating user:", err)
      alert("Failed to deactivate user. Please try again.")
    } finally {
      setShowConfirmDialog(false)
      setUserToDeactivate(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "All" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) return <div className="loading">Loading users...</div>
  if (error) return <div className="error-message">{error}</div>

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
            <span>{roleFilter}</span>
            <ChevronDown size={16} />
          </button>
          <div className="dropdown-content">
            <div onClick={() => setRoleFilter("All")}>All</div>
            <div onClick={() => setRoleFilter("Admin")}>Admin</div>
            <div onClick={() => setRoleFilter("Manager")}>Manager</div>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <p className="no-results">No users found</p>
        ) : (
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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.role}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        <img src={user.avatar || `/placeholder.svg?height=30&width=30`} alt={user.name} />
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.status}</td>
                  <td>
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={user.active} 
                        onChange={() => handleToggleActive(user.id)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <Link to={`/edit-user/${user.id}`} className="action-button">
                      <Edit size={16} />
                      <span>Edit User</span>
                    </Link>
                  </td>
                  <td>
                    <Link to={`/change-role/${user.id}`} className="action-button">
                      <UserCog size={16} />
                      <span>Change role</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

