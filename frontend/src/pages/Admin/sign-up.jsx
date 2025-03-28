import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/sign-up.css";

const SignUp = ({ setUser }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("All fields are required!");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms and Conditions!");
      return;
    }

    const newUser = { fullName, email, role };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    navigate("/admin-dashboard");
  };

  // Conditional classes for role-based styling
  const getRoleClass = () => {
    if (role === "") return ""; 
    return "role-selected"; 
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        {/* Toggle Buttons */}
        <div className="toggle-buttons">
          <button className="nav-btn active">Sign Up</button>
          <button className="nav-btn login-btn" onClick={() => navigate("/")}>
            Log In
          </button>
        </div>

        {/* Title */}
        <p className="toggle-text">Sign Up</p>
        <p className="bottom-text">Create your account to start improving communication</p>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Sign-Up Form */}
        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label>Your Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Your Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Enter Your Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Select Role */}
          <div className="input-group">
            <label>Select Your Role</label>
            <select
              className={getRoleClass()}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>Select Role</option> {/* Placeholder */}
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
            />
            <span>I agree with the Terms and Conditions</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="signup-btn">Create Account</button>
        </form>

        {/* Additional Text Below "Create Account" */}
        <p className="hint-text">By signing up, you agree to our Terms and Privacy Policy.</p>
      </div>
    </div>
  );
};

export default SignUp;