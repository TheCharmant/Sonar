import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaEnvelopeOpenText, FaEnvelope, FaChartBar, FaClipboardList, FaUsersCog, FaCog } from "react-icons/fa";
import "../styles/sidebar.css";
import powerpuffAvatar from "../assets/powerpuff.png";


function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Soñar</h2>
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="/admin-dashboard" activeClassName="active">
              <FaTachometerAlt className="icon" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inbound-mails" activeClassName="active">
              <FaEnvelopeOpenText className="icon" /> Inbound Mails
            </NavLink>
          </li>
          <li>
            <NavLink to="/outbound-mails" activeClassName="active">
              <FaEnvelope className="icon" /> Outbound Mails
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" activeClassName="active">
              <FaChartBar className="icon" /> Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/audit-logs" activeClassName="active">
              <FaClipboardList className="icon" /> Audit Logs
            </NavLink>
          </li>
          <li>
            <NavLink to="/user-management" activeClassName="active">
              <FaUsersCog className="icon" /> User Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" activeClassName="active">
              <FaCog className="icon" /> Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="profile">
        <img src={powerpuffAvatar} alt="User Avatar" />
        <div className="profile-info">
          <p className="name">Powerpuff Cuties</p>
          <p className="email">powerpuffs@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;