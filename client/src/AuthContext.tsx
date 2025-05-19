import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      validateToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Validate token with backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/validate-token`, {
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
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Update localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};