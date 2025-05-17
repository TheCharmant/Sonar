"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { getAuthUrl } from "../../utils/api";
import { v4 as uuid } from "uuid";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
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
    try {
      setLoading(true);
      const state = uuid();
      sessionStorage.setItem("oauth_state", state);

      console.log("Generated state:", state);
      console.log("Calling getAuthUrl...");

      const authUrl = await getAuthUrl(state);

      console.log("Redirecting to:", authUrl);

      // Make sure we have a valid URL before redirecting
      if (!authUrl || typeof authUrl !== 'string' || !authUrl.startsWith('http')) {
        throw new Error(`Invalid auth URL: ${authUrl}`);
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setLoading(false);
      // Show an error message to the user
      alert("Failed to connect to Google. Please try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {deactivatedError && (
          <div className="deactivated-error">
            <AlertCircle size={18} />
            <span>Your account has been deactivated. Please contact an administrator.</span>
          </div>
        )}

        <h1>Welcome to <span className="brand-name">Soñar</span></h1>

        <button
          onClick={handleGoogleLogin}
          className="google-login-btn"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
};