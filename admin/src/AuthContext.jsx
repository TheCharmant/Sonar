import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [role, setRole] = useState(localStorage.getItem("adminRole") || null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("adminToken");
    const storedRole = localStorage.getItem("adminRole");
    
    if (storedToken) {
      setToken(storedToken);
      setRole(storedRole);
      
      // Validate token on startup
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);
  
  // Validate token with backend
  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/validate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenToValidate}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear auth state
        logout();
      }
    } catch (error) {
      console.error("Token validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const getCustomToken = async (uid) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/custom-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get custom token');
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting custom token:', error);
      throw error;
    }
  };

  const exchangeTokenIfNeeded = async (user) => {
    try {
      // Get a custom token that will work with our backend
      const customToken = await getCustomToken(user.uid);
      
      // Sign in with the custom token to get an ID token
      await signInWithCustomToken(auth, customToken);
      
      // Get the new ID token
      const newIdToken = await user.getIdToken(true);
      
      // Use this token instead
      return newIdToken;
    } catch (error) {
      console.error('Error exchanging token:', error);
      // Fall back to the original token
      return await user.getIdToken();
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, role, setRole, user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("❌ useAuth called outside of AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
