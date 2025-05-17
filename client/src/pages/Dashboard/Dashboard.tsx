import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailList from "../../components/EmailList/EmailList";
import EmailDetail from "../../components/EmailDetail/EmailDetail";
import AnalyticsDashboard from "../../components/Analytics/AnalyticsDasboard";
import { useAuth } from "../../context/AuthContext";
import type { EmailContent } from "../../components/EmailDetail/EmailDetail";
import "./Dashboard.css";

const Dashboard = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for token in URL and in auth context
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Remove token from URL to prevent it from being visible
      navigate("/dashboard", { replace: true });
    } else if (!token) {
      // If no token in URL and no token in context, redirect to login
      navigate("/");
    } else {
      // We have a token, but let's validate it
      validateToken();
    }
  }, [token, navigate, setToken]);

  // Add this function to validate the token
  const validateToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validate-token`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token is invalid
        handleTokenError();
        return;
      }
      
      // Token is valid, we can proceed
      setIsLoading(false);
    } catch (error) {
      console.error("Error validating token:", error);
      handleTokenError();
    }
  };

  // Define a new state value for dashboard view
  const [view, setView] = useState<"dashboard" | "inbox" | "sent">("dashboard");
  const [currentScreen, setCurrentScreen] = useState<"list" | "detail">("list");
  const [selectedEmail, setSelectedEmail] = useState<EmailContent | null>(null);

  // Handle navigation to dashboard
  const navigateToDashboard = () => {
    setView("dashboard");
    setCurrentScreen("list");
    setSelectedEmail(null);
    setError(null);
  };

  // Handle navigation to inbox
  const navigateToInbox = () => {
    setView("inbox");
    setCurrentScreen("list");
    setSelectedEmail(null);
    setError(null);
  };

  // Handle navigation to sentbox
  const navigateToSentbox = () => {
    setView("sent");
    setCurrentScreen("list");
    setSelectedEmail(null);
    setError(null);
  };

  // Handle token refresh or error
  const handleTokenError = () => {
    setIsLoading(true);
    setError("Session expired. Please log in again.");
    // Clear the token
    setToken("");
    // Redirect to login after a short delay
    setTimeout(() => {
      navigate("/");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>Soñar</h2>
        </div>
        <div className="profile-icon">
          <div className="icon-placeholder"></div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={view === "dashboard" ? "active" : ""}
              onClick={navigateToDashboard}
            >
              <div className="nav-icon dashboard-icon"></div>
              <span>Dashboard</span>
            </li>
            <li 
              className={view === "inbox" ? "active" : ""}
              onClick={navigateToInbox}
            >
              <div className="nav-icon inbox-icon"></div>
              <span>Inbox</span>
              {view === "inbox" && <span className="badge">2</span>}
            </li>
            <li 
              className={view === "sent" ? "active" : ""}
              onClick={navigateToSentbox}
            >
              <div className="nav-icon sent-icon"></div>
              <span>Sentbox</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {isLoading ? (
          <div className="loading-container">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : currentScreen === "list" ? (
          <>
            <header className="dashboard-header">
              <h1>{view === "inbox" ? "Inbox" : view === "sent" ? "Sentbox" : "Dashboard"}</h1>
            </header>
            
            {/* Only show stats and charts on the main dashboard view */}
            {view === "dashboard" && (
              <AnalyticsDashboard />
            )}
            
            {/* Show email list for inbox and sentbox views */}
            {(view === "inbox" || view === "sent") && (
              <EmailList
                key={view}
                folder={view}
                onSelectEmail={(email) => {
                  setSelectedEmail(email);
                  setCurrentScreen("detail");
                }}
                onError={(errorMsg) => {
                  if (errorMsg.includes("unauthorized") || errorMsg.includes("token")) {
                    handleTokenError();
                  } else {
                    setError(errorMsg);
                  }
                }}
              />
            )}
          </>
        ) : (
          <div className="email-detail-container">
            <div className="back-button-container">
              <button
                onClick={() => setCurrentScreen("list")}
                className="back-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to {view === "inbox" ? "Inbox" : "Sentbox"}
              </button>
            </div>
            <EmailDetail
              emailContent={selectedEmail}
              folder={view === "dashboard" ? "inbox" : view}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;