import { useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD:frontend/src/pages/Admin/login.jsx
import "../../styles/login.css";

const AdminLogin = ({ setUser }) => {
=======
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/Login.css";
import { login } from "../services/authService";

const Login = ({ setUser }) => {
>>>>>>> f4fc95d (email API integrated & report generation):frontend/src/pages/Login.jsx
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
<<<<<<< HEAD:frontend/src/pages/Admin/login.jsx
    if (email === "admin@example.com" && password === "password123") {
      const userData = { email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/admin-dashboard");
    } else {
      setError("Invalid credentials. Try again.");
=======
    try {
      const response = await login(email, password);
      if (response.success) {
        setUser(response.user);
        navigate("/dashboard");
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
>>>>>>> f4fc95d (email API integrated & report generation):frontend/src/pages/Login.jsx
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
<<<<<<< HEAD:frontend/src/pages/Admin/login.jsx
        {/* Toggle Sign Up & Log In Buttons */}
        <div className="toggle-buttons">
          <button className="nav-btn signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="nav-btn active" onClick={() => navigate("/login")}>Log In</button>
        </div>

        {/* Added Log In text below buttons */}
        <p className="toggle-text">Log In</p>

=======
        <h2>Login</h2>
>>>>>>> f4fc95d (email API integrated & report generation):frontend/src/pages/Login.jsx
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{ border: "none", outline: "none", background: "none", padding: 0 }}
              >
                {showPassword ? <EyeOff size={20} className="eye-icon" /> : <Eye size={20} className="eye-icon" />}
              </button>
            </div>
          </div>

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">Log me in</button>
        </form>
<<<<<<< HEAD:frontend/src/pages/Admin/login.jsx
=======
        <p className="hint-text">
        Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
>>>>>>> f4fc95d (email API integrated & report generation):frontend/src/pages/Login.jsx
      </div>
    </div>
  );
};

export default AdminLogin;