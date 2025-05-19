import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="app-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inbox" className={({isActive}) => isActive ? "active" : ""}>
              Inbox
            </NavLink>
          </li>
          <li>
            <NavLink to="/sentbox" className={({isActive}) => isActive ? "active" : ""}>
              Sent
            </NavLink>
          </li>
          <li>
            <NavLink to="/compose" className={({isActive}) => isActive ? "active" : ""}>
              Compose
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;