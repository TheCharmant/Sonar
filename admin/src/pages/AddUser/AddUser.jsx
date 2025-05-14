"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../AuthContext"
import "./AddUser.css"

const AddUser = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role,
    })
    setShowRoleDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }
      
      // Backend already logs this action
      
      navigate("/user-management")
    } catch (err) {
      console.error("Error creating user:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/user-management")
  }

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter user's full name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter Gmail address"
          />
          <small>Only Gmail addresses are allowed</small>
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <div className="role-selector">
            <button 
              type="button" 
              className="role-dropdown-button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              {formData.role || "Select Role"}
            </button>
            
            {showRoleDropdown && (
              <div className="role-options">
                <div 
                  className={`role-option ${formData.role === "user" ? "selected" : ""}`}
                  onClick={() => handleRoleSelect("user")}
                >
                  User
                </div>
                <div 
                  className={`role-option ${formData.role === "admin" ? "selected" : ""}`}
                  onClick={() => handleRoleSelect("admin")}
                >
                  Admin
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Creating..." : "Add New User"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddUser

