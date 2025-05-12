import { useEffect, useState } from "react";
import AdminEmailList from "../../components/AdminEmailList";
import { useAuth } from "../../AuthContext"; 


const Dashboard = () => {
  const { user, role, token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) setLoading(false);
  }, [token]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.displayName || user?.email || "User"}</p>

      {role === "admin" ? (
        <AdminEmailList />
      ) : (
        <p className="text-red-500 font-medium">You do not have permission to view admin data.</p>
      )}
    </div>
  );
};

export default Dashboard;
