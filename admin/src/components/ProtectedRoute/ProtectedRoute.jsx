import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
