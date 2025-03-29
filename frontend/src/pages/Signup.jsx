import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/Login.css";
import { Link } from "react-router-dom";  // Import Link
import { register } from "../services/authService";

const Signup = ({ setUser }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (fullName && email && password) {
      try {
        const response = await register(fullName, email, password);
        if (response.success) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user)); // Persist user session
          navigate("/dashboard");
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError("Signup failed. Please try again.");
      }
    } else {
      setError("All fields are required.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
          <button type="submit" className="login-btn">Sign Up</button>
        </form>
        <p className="hint-text">
            Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;