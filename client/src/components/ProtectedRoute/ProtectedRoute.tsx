import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const ProtectedRoute = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Simple validation - in a real app, you'd validate with the backend
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;



