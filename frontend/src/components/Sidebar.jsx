import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <nav className="p-4 w-60 bg-gray-900 text-white h-screen">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/dashboard">Inbound Mails</Link></li>
        <li><Link to="/new-communication">Outbound Mails</Link></li>
        <li><Link to="/search-filters">Reports</Link></li>
        <li><Link to="/reports-analysis">Audit Logs</Link></li>
        <li><Link to="/notifications">User Management</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;

