"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // Send token to backend
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: idToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    // ✅ Store JWT in localStorage (optional) and context
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminRole", data.role); // ✅ important for refresh
    setToken(data.token);
    setRole(data.role);

    navigate("/dashboard");
  } catch (err) {
    console.error("Login failed", err);
    alert(err.message);
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

            <button type="submit" className="auth-button">
              Log me in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
