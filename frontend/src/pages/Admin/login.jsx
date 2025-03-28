import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

const AdminLogin = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@example.com" && password === "password123") {
      const userData = { email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/admin-dashboard");
    } else {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Toggle Sign Up & Log In Buttons */}
        <div className="toggle-buttons">
          <button className="nav-btn signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          <button className="nav-btn active" onClick={() => navigate("/login")}>Log In</button>
        </div>

        {/* Added Log In text below buttons */}
        <p className="toggle-text">Log In</p>

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
              >
                {showPassword ? "Hide" : "Show"}
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
      </div>
    </div>
  );
};

export default AdminLogin;