import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  checkUserStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  checkUserStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize token from localStorage
  const [token, setTokenState] = useState<string | null>(null);

  // Update localStorage when token changes
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // Check user status function
  const checkUserStatus = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return false;
      
      console.log("Checking user status with token:", currentToken.substring(0, 10) + "...");
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check-status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${currentToken}`
        }
      });
      
      console.log("Status check response:", response.status);
      
      if (response.status === 401) {
        // Token is invalid or expired
        console.log("Token is invalid or expired, logging out");
        logout();
        return false;
      }
      
      if (!response.ok) {
        const data = await response.json();
        console.log("Error response data:", data);
        
        if (data.code === 'account_deactivated') {
          logout();
          return false;
        }
        
        // Handle other errors
        console.error("Error checking status:", data.error);
        return false;
      }
      
      // If we get here, the user is active
      console.log("User status check successful");
      return true;
    } catch (error) {
      console.error("Error checking user status:", error);
      logout();
      return false;
    }
  };

  // Add this function to validate the token
  const validateStoredToken = async (storedToken: string) => {
    try {
      console.log("Validating stored token...");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validate-token`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${storedToken}`
        }
      });
      
      if (response.ok) {
        // Token is valid, set it in state
        console.log("Token is valid");
        setTokenState(storedToken);
      } else {
        // Token is invalid, clear it
        console.log("Stored token is invalid, clearing");
        localStorage.removeItem("token");
        setTokenState("");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      localStorage.removeItem("token");
      setTokenState("");
    }
  };

  // Add this to debug the API URL
  useEffect(() => {
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
  }, []);

  // Update the useEffect to use this function
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      validateStoredToken(storedToken);
    } else {
      setTokenState("");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, logout, checkUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};


