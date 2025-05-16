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

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setTokenState(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, logout, checkUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};


