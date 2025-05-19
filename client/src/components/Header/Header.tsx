import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { logout } = useAuth();
  
  return (
    <div className="app-header">
      <h1 className="app-logo">
        <span className="app-logo-icon">🌙</span>
        SOÑAR
      </h1>
      <div className="header-actions">
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Header;