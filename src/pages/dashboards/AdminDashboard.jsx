import React, { useEffect, useState } from "react";
import Card, { CardHeader, CardBody } from "../../components/common/Card";
import { employeeService, leaveService } from "../../services/api";
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import "./Dashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayPresent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [employeesRes, leavesRes] = await Promise.all([
        employeeService.getAll(),
        leaveService.getAll(),
      ]);

      const employees = employeesRes.data;
      const leaves = leavesRes.data;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "active").length,
        pendingLeaves: leaves.filter((l) => l.status === "pending").length,
        todayPresent: Math.floor(employees.length * 0.85), // Mock data
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: FiUsers,
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: FiCheckCircle,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      icon: FiCalendar,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Today Present",
      value: stats.todayPresent,
      icon: FiClock,
      color: "#14b8a6",
      bgColor: "#f0fdfa",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard animate-fadeIn">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-gray">
            Welcome back! Here's your organization overview
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className="stat-card" hover>
            <div className="stat-content">
              <div
                className="stat-icon"
                style={{ backgroundColor: stat.bgColor, color: stat.color }}
              >
                <stat.icon size={28} />
              </div>
              <div className="stat-info">
                <p className="stat-label">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <CardHeader>
            <h3>Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className="quick-actions">
              <button className="action-btn">
                <FiUsers />
                <span>Add Employee</span>
              </button>
              <button className="action-btn">
                <FiClock />
                <span>Mark Attendance</span>
              </button>
              <button className="action-btn">
                <FiCalendar />
                <span>Manage Leave</span>
              </button>
              <button className="action-btn">
                <FiDollarSign />
                <span>Process Payroll</span>
              </button>
            </div>
          </CardBody>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <h3>Recent Activities</h3>
          </CardHeader>
          <CardBody>
            <div className="activity-list">
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                >
                  <FiUsers />
                </div>
                <div className="activity-content">
                  <p className="activity-title">New employee added</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ backgroundColor: "#fffbeb", color: "#f59e0b" }}
                >
                  <FiCalendar />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Leave request submitted</p>
                  <p className="activity-time">4 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div
                  className="activity-icon"
                  style={{ backgroundColor: "#f0fdf4", color: "#10b981" }}
                >
                  <FiDollarSign />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Payroll processed</p>
                  <p className="activity-time">Yesterday</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
