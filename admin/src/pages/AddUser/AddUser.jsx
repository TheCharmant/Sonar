"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../AuthContext"
import { Plus } from "lucide-react"
import "./AddUser.css"

const AddUser = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: ""
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
      // Get the token from localStorage if not available from context
      const authToken = token || localStorage.getItem('adminToken')
      
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.")
      }
      
      console.log("Submitting user data:", formData)
      console.log("Using token:", authToken.substring(0, 10) + "...")
      
      // Try the JWT endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }
      
      console.log("User created successfully:", data)
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter temporary password"
          />
          <small>User will be prompted to change this on first login</small>
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <div className="role-selector">
            <button 
              type="button" 
              className="role-dropdown-button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              {formData.role === "admin" ? "Admin" : "User"}
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
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddUser

