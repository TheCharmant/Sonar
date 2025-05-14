"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, Loader, AlertCircle } from "lucide-react"
import "./Login.css"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase"
import { useAuth } from "../../AuthContext";


const Login = () => {
  const { setToken, setRole } = useAuth();
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [deactivatedError, setDeactivatedError] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    
    // Clear error when user starts typing
    if (loginError) setLoginError(null);
  }

  // Add this function to handle Firebase auth errors
  const handleFirebaseError = (error) => {
    console.error("Firebase auth error:", error.code, error.message);
    
    // Set appropriate error message based on Firebase error code
    if (error.code === 'auth/invalid-credential' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/user-not-found') {
      setLoginError('Invalid email or password');
    } else if (error.code === 'auth/too-many-requests') {
      setLoginError('Too many failed login attempts. Please try again later.');
    } else {
      setLoginError(error.message || 'Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setDeactivatedError(false);
    setIsLoading(true);
    
    try {
      // Show loading state
      setIsLoading(true);
      
      console.log("Attempting to sign in with:", formData.email);
      
      // Sign in with Firebase - add error handling
      try {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log("Firebase sign-in successful");
        
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        // Send token to backend
        console.log("Sending token to backend...");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: idToken }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          
          if (errorData.code === "account_deactivated") {
            setDeactivatedError(true);
            throw new Error(errorData.error);
          }
          
          throw new Error(errorData.error || "Login failed");
        }

        const data = await res.json();
        console.log("Backend login successful:", data);
        
        // Store JWT in localStorage and context
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminRole", data.role);
        setToken(data.token);
        setRole(data.role);

        // Force a small delay to ensure state is updated
        setTimeout(() => {
          // Navigate to dashboard
          console.log("Navigating to dashboard...");
          navigate("/dashboard");
        }, 100);
      } catch (firebaseError) {
        console.error("Firebase authentication error:", firebaseError);
        handleFirebaseError(firebaseError);
        return; // Stop execution if Firebase auth fails
      }
      
      // Rest of your code...
    } catch (err) {
      console.error("Login failed", err);
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-tabs">
          <Link to="/signup" className="auth-tab">
            Sign up
          </Link>
          <Link to="/login" className="auth-tab active">
            Log in
          </Link>
        </div>

        <div className="auth-form-container">
          <h2>Log In</h2>
          
          {loginError && (
            <div className="error-message">
              {loginError}
            </div>
          )}

          {deactivatedError && (
            <div className="deactivated-error">
              <AlertCircle size={18} />
              <span>Your account has been deactivated. Please contact an administrator.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
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

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="custom-checkbox"></span>
                Remember me
              </label>

              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <Loader size={20} className="spinner-icon" />
                  Logging in...
                </span>
              ) : (
                "Log me in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
