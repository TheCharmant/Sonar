"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Loader, ArrowLeft } from "lucide-react"
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [resetLink, setResetLink] = useState("")
  const [showResetLink, setShowResetLink] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess("")
    
    try {
      // Validate email format (Gmail only)
      if (!email.endsWith('@gmail.com')) {
        throw new Error("Only Gmail addresses are allowed")
      }
      
      // Skip the check-email endpoint since it's not available
      // and directly call the reset-password endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/reset-password?sendEmail=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific error cases from the reset-password endpoint
        if (data.error === "User not found") {
          throw new Error("No account found with this email address")
        } else if (data.error === "Account inactive") {
          throw new Error("This account has been deactivated. Please contact an administrator.")
        } else {
          throw new Error(data.error || "Failed to generate password reset link")
        }
      }
      
      setResetLink(data.resetLink || "")
      
      // Show success message if email was sent
      if (data.emailSent) {
        setSuccess(`Password reset link has been sent to ${email}`)
        setSubmitted(true)
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        // If email wasn't sent but we have a reset link, show it
        setShowResetLink(true)
      }
    } catch (err) {
      console.error("Error generating password reset link:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResetLink = () => {
    navigator.clipboard.writeText(resetLink)
    alert("Password reset link copied to clipboard!")
  }

  return (
    <div className="auth-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="forgot-password-subtitle">Enter your email and we'll send you a link to reset your password.</p>

        {submitted ? (
          <div className="success-message">
            <p>{success}</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
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
                <small>Only Gmail addresses are allowed</small>
              </div>

              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <Loader size={20} className="spinner-icon" />
                    Sending...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
              
              <Link to="/login" className="back-to-login">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
            
            {showResetLink && resetLink && (
              <div className="reset-link-container">
                <p>Copy this link to reset your password:</p>
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
                <p className="note">This link will expire in 24 hours.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

