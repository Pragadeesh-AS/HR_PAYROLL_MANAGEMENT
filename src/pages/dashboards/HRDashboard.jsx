import React, { useEffect, useState } from "react";
import Card, { CardHeader, CardBody } from "../../components/common/Card";
import { leaveService, employeeService } from "../../services/api";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import "./Dashboard.css";

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedToday: 0,
    presentToday: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
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
      const pending = leaves.filter((l) => l.status === "pending");

      setStats({
        totalEmployees: employees.length,
        pendingLeaves: pending.length,
        approvedToday: 2, // Mock data
        presentToday: Math.floor(employees.length * 0.85),
      });

      setPendingLeaves(pending.slice(0, 5));
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
      title: "Pending Leave Requests",
      value: stats.pendingLeaves,
      icon: FiCalendar,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      title: "Approved Today",
      value: stats.approvedToday,
      icon: FiCheckCircle,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
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
          <h1>HR Dashboard</h1>
          <p className="text-gray">Manage employee requests and attendance</p>
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
            <h3>Pending Leave Requests</h3>
          </CardHeader>
          <CardBody>
            {pendingLeaves.length === 0 ? (
              <p className="text-gray text-center">No pending requests</p>
            ) : (
              <div className="leave-list">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="leave-item">
                    <div className="leave-info">
                      <p className="leave-name">{leave.employeeName}</p>
                      <p className="leave-details">
                        {leave.leaveType} • {leave.days} days
                      </p>
                      <p className="leave-date text-sm text-gray">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <div className="leave-actions">
                      <button className="btn-approve">
                        <FiCheckCircle /> Approve
                      </button>
                      <button className="btn-reject">
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

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
                <span>View All Leaves</span>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
