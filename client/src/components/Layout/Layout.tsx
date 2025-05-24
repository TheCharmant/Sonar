import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";
// Replace the icon imports
import { LogOut } from "react-feather";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, token } = useAuth();
  const [userProfile, setUserProfile] = useState<{name?: string, email?: string, uid?: string}>({});
  
  // Navigation handlers
  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  const navigateToInbox = () => {
    navigate("/inbox");
  };

  const navigateToSentbox = () => {
    navigate("/sentbox");
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  // Get current path to highlight active nav item
  const path = location.pathname;
  
  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get token from context or localStorage
        const currentToken = token || localStorage.getItem("token");
        
        console.log("Token available:", !!currentToken);
        
        if (!currentToken) {
          console.error("No token available");
          return;
        }
        
        // The correct URL should include /api prefix
        const profileUrl = `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`;
        console.log("Fetching user profile from:", profileUrl);
        
        // Fetch user profile from the backend
        const response = await fetch(profileUrl, {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        });
        
        console.log("Profile response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("User profile data:", data);
        
        setUserProfile(data.user);
        console.log("User profile set:", data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Add this to see when the profile changes
  useEffect(() => {
    console.log("Current user profile state:", userProfile);
  }, [userProfile]);
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!userProfile || !userProfile.name) return "U";
    return userProfile.name.charAt(0).toUpperCase();
  };
  
  return (
    <div className="app-container">
      {/* Fixed Header */}
      <div className="app-header">
        <h1 className="app-logo">
          <img src="/src/assets/sonar-logo.png" alt="SOÑAR" className="app-logo-icon" />
          SOÑAR
        </h1>
        <div className="top-nav-actions">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="dashboard-layout">
        {/* Sidebar Navigation with updated icons */}
        <div className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className={path === '/dashboard' ? 'active' : ''}>
                <div onClick={navigateToDashboard}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </div>
              </li>
              <li className={path === '/inbox' ? 'active' : ''}>
                <div onClick={navigateToInbox}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12h-6l-2 3h-4l-2-3H2"></path>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                  </svg>
                  Inbox
                </div>
              </li>
              <li className={path === '/sentbox' ? 'active' : ''}>
                <div onClick={navigateToSentbox}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Sent
                </div>
              </li>
            </ul>
          </nav>
          
          {/* User profile at bottom of sidebar */}
          <div className="user-profile-bottom">
            <div className="avatar-circle" style={{backgroundColor: '#c066e8'}}>
              {getInitials()}
            </div>
            <div className="user-info-bottom">
              <p className="user-name">{userProfile?.name || "User"}</p>
              <p className="user-email">{userProfile?.email || "user@example.com"}</p>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;



















