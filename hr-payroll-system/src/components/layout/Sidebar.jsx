import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextDefinition";
import {
  FiHome,
  FiUsers,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = {
    admin: [
      { icon: FiHome, label: "Dashboard", path: "/admin/dashboard" },
      { icon: FiUsers, label: "Employees", path: "/admin/employees" },
      { icon: FiClock, label: "Attendance", path: "/admin/attendance" },
      { icon: FiCalendar, label: "Leave Management", path: "/admin/leave" },
      { icon: FiDollarSign, label: "Payroll", path: "/admin/payroll" },
      { icon: FiFileText, label: "Reports", path: "/admin/reports" },
      { icon: FiSettings, label: "Settings", path: "/admin/settings" },
    ],
    hr: [
      { icon: FiHome, label: "Dashboard", path: "/hr/dashboard" },
      { icon: FiUsers, label: "Employees", path: "/hr/employees" },
      { icon: FiClock, label: "Attendance", path: "/hr/attendance" },
      { icon: FiCalendar, label: "Leave Requests", path: "/hr/leave" },
      { icon: FiDollarSign, label: "Payroll", path: "/hr/payroll" },
    ],
    employee: [
      { icon: FiHome, label: "Dashboard", path: "/employee/dashboard" },
      { icon: FiClock, label: "My Attendance", path: "/employee/attendance" },
      { icon: FiCalendar, label: "Leave", path: "/employee/leave" },
      { icon: FiDollarSign, label: "Payslips", path: "/employee/payslips" },
    ],
  };

  const currentMenu = menuItems[user?.role] || menuItems.employee;

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {currentMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "sidebar-item-active" : ""}`
              }
            >
              <item.icon className="sidebar-icon" />
              {!collapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </aside>
  );
};

export default Sidebar;
