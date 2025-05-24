"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Building, Loader } from "lucide-react"
import "./Signup.css"
import { auth } from "../../firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Validate email format (Gmail only)
      if (!formData.email.endsWith('@gmail.com')) {
        throw new Error("Only Gmail addresses are allowed")
      }
      
      // Validate password strength
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      const user = userCredential.user
      const idToken = await user.getIdToken()
      
      // Send user data to backend with pending status
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          status: "pending" // Set status as pending for approval
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }
      
      console.log("Account created successfully:", data)
      // Show success message and navigate to login
      setSuccessMessage("User created! Waiting for admin approval.")
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      console.error("Error creating account:", err)
      
      // Handle Firebase-specific errors
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already exists")
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email format")
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak")
      } else {
        setError(err.message || "Failed to create account")
      }
    } finally {
      setLoading(false)
    }
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
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <User size={16} style={{ left: '8px' }} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '60px', textIndent: '20px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Mail size={16} style={{ left: '8px' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '60px', textIndent: '20px' }}
                />
              </div>
              <small>Only Gmail addresses are allowed</small>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Lock size={16} style={{ left: '8px' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '60px', paddingRight: '55px', textIndent: '20px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ right: '20px' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <small>Password must be at least 6 characters long</small>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <Building size={16} style={{ left: '8px' }} />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  required 
                  className="select-role"
                  style={{ paddingLeft: '60px', textIndent: '20px' }}
                >
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <div className="loading-spinner">
                  <Loader size={20} className="spinner-icon" />
                  <div className="loading-text">Creating account...</div>
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup

