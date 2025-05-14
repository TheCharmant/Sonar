"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../AuthContext"
import "./EditUser.css"

const EditUser = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [resetLink, setResetLink] = useState("")
  const [resetLinkLoading, setResetLinkLoading] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    try {
      // Get the token from localStorage if not available from context
      const authToken = token || localStorage.getItem('adminToken')
      
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.")
      }
      
      // Try the JWT endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch user")
      }
      
      const userData = await response.json()
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "user"
      })
    } catch (err) {
      console.error("Error fetching user:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      
      // Try the JWT endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user")
      }
      
      navigate("/user-management")
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/user-management")
  }

  const handleGeneratePasswordReset = async () => {
    setResetLinkLoading(true)
    setSuccess("")
    try {
      const authToken = token || localStorage.getItem('adminToken')
      
      if (!authToken) {
        throw new Error("Authentication token not found. Please log in again.")
      }
      
      // Add sendEmail=true parameter to automatically send the email
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users-jwt/${id}/reset-password?sendEmail=true`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.hasPassword) {
          setError("This user already has a password set up.")
        } else {
          throw new Error(data.error || "Failed to generate password reset link")
        }
        return
      }
      
      setResetLink(data.resetLink)
      
      // Show success message if email was sent
      if (data.emailSent) {
        setSuccess(`Password reset link has been sent to ${data.userEmail}`)
      }
      
      // Always show the modal with the link for copying
      setShowPasswordResetModal(true)
    } catch (err) {
      console.error("Error generating password reset link:", err)
      setError(err.message)
    } finally {
      setResetLinkLoading(false)
    }
  }

  const handleCopyResetLink = () => {
    navigator.clipboard.writeText(resetLink)
    alert("Password reset link copied to clipboard!")
  }

  const handleCloseResetModal = () => {
    setShowPasswordResetModal(false)
  }

  if (loading && !error) {
    return <div className="loading">Loading user data...</div>
  }

  return (
    <div className="edit-user-container">
      <h1>Edit User</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="edit-user-form">
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
        
        <div className="form-group">
          <label>Admin Access</label>
          <button 
            type="button" 
            className="password-reset-button"
            onClick={handleGeneratePasswordReset}
            disabled={resetLinkLoading || formData.role !== "admin"}
          >
            {resetLinkLoading ? "Generating..." : "Generate Password Reset Link"}
          </button>
          <small>Only needed for Google users promoted to admin who need to access the admin dashboard</small>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
      {showPasswordResetModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseResetModal}>&times;</span>
            <h2>Password Reset Link</h2>
            
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}
            
            <p>Share this link with the user to set up their password:</p>
            <div className="reset-link-container">
              <textarea 
                readOnly 
                value={resetLink} 
                className="reset-link"
              />
              <button 
                type="button"
                className="copy-button"
                onClick={handleCopyResetLink}
              >
                Copy Link
              </button>
            </div>
            <p className="note">This link will expire in 24 hours.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditUser




