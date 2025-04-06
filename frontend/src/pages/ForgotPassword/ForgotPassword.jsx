"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail } from "lucide-react"
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you would send a password reset email here
    setSubmitted(true)
    setTimeout(() => {
      navigate("/login")
    }, 3000)
  }

  return (
    <div className="auth-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="forgot-password-subtitle">Enter your email and we'll send you a link to reset your password.</p>

        {submitted ? (
          <div className="success-message">
            <p>Password reset link has been sent to your email.</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

