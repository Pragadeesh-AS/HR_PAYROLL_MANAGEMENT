import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContextDefinition";
import Card, { CardHeader, CardBody } from "../../components/common/Card";
import { FiCalendar, FiClock, FiDollarSign, FiFileText } from "react-icons/fi";
import { leaveService } from "../../services/api";
import "./Dashboard.css";

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    leaveBalance: 24, // Assuming 24 days total allowance
    leaveTaken: 0,
    presentDays: 22,
    absentDays: 2,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const leavesRes = await leaveService.getByEmployee();
        const leaves = leavesRes.data;
        
        // Sum all 'Approved' leave days
        const approvedDays = leaves
          .filter(l => l.status.toLowerCase() === 'approved')
          .reduce((sum, l) => sum + (l.days || 0), 0);

        setStats(prev => ({
          ...prev,
          leaveTaken: approvedDays,
          leaveBalance: 24 - approvedDays
        }));
      } catch (err) {
        console.error("Failed to load real stats", err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Leave Balance",
      value: stats.leaveBalance,
      icon: FiCalendar,
      color: "#2563eb",
      bgColor: "#eff6ff",
      suffix: " days",
    },
    {
      title: "Leave Taken",
      value: stats.leaveTaken,
      icon: FiCalendar,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      suffix: " days",
    },
    {
      title: "Present (This Month)",
      value: stats.presentDays,
      icon: FiClock,
      color: "#10b981",
      bgColor: "#f0fdf4",
      suffix: " days",
    },
    {
      title: "Absent",
      value: stats.absentDays,
      icon: FiClock,
      color: "#ef4444",
      bgColor: "#fef2f2",
      suffix: " days",
    },
  ];

  const recentPayslip = {
    month: "January 2024",
    basic: 50000,
    allowances: 10000,
    deductions: 5000,
    netSalary: 55000,
  };

  return (
    <div className="dashboard animate-fadeIn">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p className="text-gray">Here's your personal dashboard</p>
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
                <h2 className="stat-value">
                  {stat.value}
                  {stat.suffix}
                </h2>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <CardHeader>
            <h3>Latest Payslip</h3>
          </CardHeader>
          <CardBody>
            <div className="payslip-preview">
              <div className="payslip-header">
                <FiDollarSign size={32} color="#2563eb" />
                <span className="payslip-month">{recentPayslip.month}</span>
              </div>
              <div className="payslip-details">
                <div className="payslip-row">
                  <span>Basic Salary</span>
                  <span className="font-semibold">
                    ₹{recentPayslip.basic.toLocaleString()}
                  </span>
                </div>
                <div className="payslip-row">
                  <span>Allowances</span>
                  <span className="font-semibold">
                    ₹{recentPayslip.allowances.toLocaleString()}
                  </span>
                </div>
                <div className="payslip-row">
                  <span>Deductions</span>
                  <span className="font-semibold text-error">
                    -₹{recentPayslip.deductions.toLocaleString()}
                  </span>
                </div>
                <div className="payslip-total">
                  <span>Net Salary</span>
                  <span className="net-amount">
                    ₹{recentPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="btn-view-payslip">
                <FiFileText /> View Full Payslip
              </button>
            </div>
          </CardBody>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <h3>Quick Actions</h3>
          </CardHeader>
          <CardBody>
            <div className="quick-actions">
              <button className="action-btn">
                <FiCalendar />
                <span>Apply Leave</span>
              </button>
              <button className="action-btn">
                <FiClock />
                <span>View Attendance</span>
              </button>
              <button className="action-btn">
                <FiDollarSign />
                <span>View Payslips</span>
              </button>
              <button className="action-btn">
                <FiFileText />
                <span>My Documents</span>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
