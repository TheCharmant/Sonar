import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setUser(currentUser);
          setToken(idToken);
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        setUser(null);
        setToken(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Update authentication state when token changes
    setIsAuthenticated(!!token);
    
    if (token) {
      // Try to get role from localStorage if it exists
      const storedRole = localStorage.getItem("adminRole");
      if (storedRole) {
        setRole(storedRole);
      }
      
      localStorage.setItem("adminToken", token);
      if (role) {
        localStorage.setItem("adminRole", role);
      }
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRole");
    }
  }, [token, role]);

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      setToken, 
      role, 
      setRole, 
      isAuthenticated,
      loading,
      logout
    }}>
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