import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <nav className="p-4 w-60 bg-gray-900 text-white h-screen">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/new-communication">New Communication</Link></li>
        <li><Link to="/search-filters">Search & Filters</Link></li>
        <li><Link to="/reports-analysis">Reports & Analysis</Link></li>
        <li><Link to="/notifications">Notifications</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;

