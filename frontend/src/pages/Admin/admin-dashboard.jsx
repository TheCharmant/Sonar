import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { Mail, FileText, Settings, Users, Clock, Inbox } from "lucide-react";

export default function AdminDashboard({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    setUser(null); // Reset user state
    navigate("/"); // Redirect to login page
    window.location.reload(); // Ensure full re-render
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soñar</h1>
          <div>
            <Button className="mr-2">New Email Communication</Button>
            <Button>Generate Email Report</Button>
            <button onClick={handleLogout} className="ml-4 p-2 bg-red-500 text-white rounded">
              Logout
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card className="bg-purple-200 text-center p-6">
            <h2 className="text-xl">Total Emails</h2>
            <p className="text-4xl font-bold">300</p>
          </Card>
          <Card className="bg-purple-200 text-center p-6">
            <h2 className="text-xl">Pending</h2>
            <p className="text-4xl font-bold">12</p>
          </Card>
          <Card className="bg-purple-200 text-center p-6">
            <h2 className="text-xl">Completed</h2>
            <p className="text-4xl font-bold">283</p>
          </Card>
          <Card className="bg-purple-200 text-center p-6 col-span-3">
            <h2 className="text-xl">Overdue</h2>
            <p className="text-4xl font-bold">5</p>
          </Card>
        </div>

        {/* Recent Logs Section */}
        <div className="bg-white p-4 mt-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Logs</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Table Rows (Replace with dynamic data) */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
