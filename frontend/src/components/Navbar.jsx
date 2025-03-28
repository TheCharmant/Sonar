import "../styles/navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="brand">Soñar</div>
      <div className="navbar-content">
        <a href="/profile">Profile</a>
        <button>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
