import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { getAuthUrl } from "../../utils/api";
import { v4 as uuid } from "uuid";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [deactivatedError, setDeactivatedError] = useState(false);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // Check for token and redirect to dashboard if already logged in
  useEffect(() => {
    // If we have a deactivation error, don't redirect regardless of token
    if (token && !deactivatedError) {
      navigate("/dashboard");
    }
  }, [token, navigate, deactivatedError]);

  // Check for deactivation error in URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('code');
    
    if (error && errorCode === 'account_deactivated') {
      setDeactivatedError(true);
      // Clear token when account is deactivated
      logout();
      // Remove the error params from URL to prevent showing on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [logout]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setDeactivatedError(false);
    // Clear any existing tokens that might be invalid
    localStorage.removeItem("token");
    try {
      const uid = uuid(); // temporary unique session
      const url = await getAuthUrl(uid);
      window.location.href = url;
    } catch (error) {
      console.error("Error initiating Google login:", error);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      {deactivatedError && (
        <div className="deactivated-error mb-4 max-w-md">
          <AlertCircle size={18} />
          <span>Your account has been deactivated. Please contact an administrator.</span>
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </div>
  );
};

export default Login;




