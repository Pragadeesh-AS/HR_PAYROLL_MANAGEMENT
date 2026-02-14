import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextDefinition";
import { FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleName = (role) => {
    const roleNames = {
      admin: "Administrator",
      hr: "HR Manager",
      employee: "Employee",
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h2>HR & Payroll</h2>
        </div>

        <div className="navbar-right">
          <div
            className="navbar-user"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              <img src={user?.avatar} alt={user?.name} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{getRoleName(user?.role)}</span>
            </div>
            <FiChevronDown className="dropdown-icon" />

            {showDropdown && (
              <div className="navbar-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <FiUser /> My Profile
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
