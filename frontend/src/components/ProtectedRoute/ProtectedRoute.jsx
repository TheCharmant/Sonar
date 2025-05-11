import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  // This would normally check for authentication
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoute

