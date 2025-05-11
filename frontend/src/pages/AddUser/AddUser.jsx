"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, ChevronDown } from "lucide-react"
import "./AddUser.css"

const AddUser = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    mobile: "",
  })
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would add the user to the database
    navigate("/user-management")
  }

  const handleCancel = () => {
    navigate("/user-management")
  }

  return (
    <div className="add-user-container">
      <h1>Add New User</h1>

      <div className="add-user-form-container">
        <div className="avatar-upload">
          <div className="avatar-placeholder">
            <User size={32} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Input first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Input last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="select-container">
              <div className="custom-select" onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
                <span>{formData.role || "Role of the user"}</span>
                <ChevronDown size={16} />
              </div>

              {showRoleDropdown && (
                <div className="select-dropdown">
                  <div className="select-option" onClick={() => handleRoleSelect("Admin")}>
                    <User size={16} />
                    <span>Admin</span>
                  </div>
                  <div className="select-option" onClick={() => handleRoleSelect("Employee")}>
                    <User size={16} />
                    <span>Employee</span>
                  </div>
                  <div className="select-option" onClick={() => handleRoleSelect("Auditor")}>
                    <User size={16} />
                    <span>Auditor</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Input email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="mobile"
                placeholder="Input mobile number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add New User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUser

