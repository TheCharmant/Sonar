"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Building } from "lucide-react"
import "./Signup.css"

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would validate and create account here
    navigate("/login")
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/signup" className="auth-tab active">
            Sign up
          </Link>
          <Link to="/login" className="auth-tab">
            Log in
          </Link>
        </div>

        <div className="auth-form-container">
          <h2>Sign Up</h2>
          <p className="auth-subtitle">Create your account to start improving communication.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Building size={18} />
                <select name="role" value={formData.role} onChange={handleChange} required className="select-role">
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span className="custom-checkbox"></span>I agree with Terms & Conditions
              </label>
            </div>

            <button type="submit" className="auth-button">
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup

