import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import {
  FiUsers, FiDollarSign, FiCalendar, FiClock,
  FiTrendingUp, FiTrendingDown, FiAward, FiDownload,
  FiRefreshCw
} from "react-icons/fi";
import "./Reports.css";

const reportsService = {
  getSummary: () => api.get("/reports/summary"),
  getPayrollMonthly: () => api.get("/reports/payroll-monthly"),
  getDepartmentSalary: () => api.get("/reports/department-salary"),
  getAttendanceTrend: () => api.get("/reports/attendance-trend"),
  getLeaveBreakdown: () => api.get("/reports/leave-breakdown"),
  getTopEarners: () => api.get("/reports/top-earners"),
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];
const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const fmtCurrency = (val) =>
  `₹${parseFloat(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const CustomTooltipCurrency = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name.toLowerCase().includes("salary") || p.name.toLowerCase().includes("payout")
              ? fmtCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [payrollMonthly, setPayrollMonthly] = useState([]);
  const [deptSalary, setDeptSalary] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveBreakdown, setLeaveBreakdown] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, payRes, deptRes, attRes, leaveRes, topRes] = await Promise.all([
        reportsService.getSummary(),
        reportsService.getPayrollMonthly(),
        reportsService.getDepartmentSalary(),
        reportsService.getAttendanceTrend(),
        reportsService.getLeaveBreakdown(),
        reportsService.getTopEarners(),
      ]);
      setSummary(sumRes.data);
      setPayrollMonthly(payRes.data);
      setDeptSalary(deptRes.data);
      setAttendanceTrend(attRes.data);
      setLeaveBreakdown(leaveRes.data);
      setTopEarners(topRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare pie data for leave status
  const leavePieData = summary ? [
    { name: "Approved", value: parseInt(summary.leaves.approved) },
    { name: "Pending", value: parseInt(summary.leaves.pending) },
    { name: "Rejected", value: parseInt(summary.leaves.rejected) },
  ] : [];

  // Attendance pie
  const attendancePieData = summary ? [
    { name: "Present", value: parseInt(summary.attendance.present) },
    { name: "Late", value: parseInt(summary.attendance.late) },
    { name: "Absent", value: parseInt(summary.attendance.absent) },
  ] : [];

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  const emp = summary?.employees;
  const pay = summary?.payroll;
  const att = summary?.attendance;
  const totalAtt = parseInt(att?.total) || 1;
  const presentRate = att ? Math.round((parseInt(att.present) / totalAtt) * 100) : 0;

  return (
    <div className="reports-container animate-fadeIn">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Company-wide HR and payroll insights</p>
        </div>
        <div className="reports-header-right">
          {lastUpdated && (
            <span className="reports-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="reports-refresh-btn" onClick={fetchAll}>
            <FiRefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="reports-kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><FiUsers /></div>
          <div className="kpi-body">
            <div className="kpi-value">{emp?.total || 0}</div>
            <div className="kpi-label">Total Employees</div>
            <div className="kpi-sub">{emp?.active || 0} active · {emp?.hr_count || 0} HR</div>
          </div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-icon"><FiDollarSign /></div>
          <div className="kpi-body">
            <div className="kpi-value">{fmtCurrency(pay?.total_payout)}</div>
            <div className="kpi-label">Total Payroll Disbursed</div>
            <div className="kpi-sub">Avg {fmtCurrency(pay?.avg_salary)} per employee</div>
          </div>
        </div>
        <div className="kpi-card kpi-teal">
          <div className="kpi-icon"><FiClock /></div>
          <div className="kpi-body">
            <div className="kpi-value">{presentRate}%</div>
            <div className="kpi-label">Attendance Rate</div>
            <div className="kpi-sub">{att?.present || 0} present · {att?.absent || 0} absent</div>
          </div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-icon"><FiCalendar /></div>
          <div className="kpi-body">
            <div className="kpi-value">{summary?.leaves?.pending || 0}</div>
            <div className="kpi-label">Pending Leave Requests</div>
            <div className="kpi-sub">{summary?.leaves?.approved || 0} approved · {summary?.leaves?.rejected || 0} rejected</div>
          </div>
        </div>
      </div>

      {/* Row 1: Monthly Payroll Trend + Leave Pie */}
      <div className="reports-row">
        <div className="chart-card chart-wide">
          <div className="chart-header">
            <div>
              <h2>Monthly Payroll Trend</h2>
              <p>Net salary disbursed per month</p>
            </div>
            <FiTrendingUp className="chart-header-icon" style={{ color: "#10b981" }} />
          </div>
          {payrollMonthly.length === 0 ? (
            <div className="chart-empty">No payroll data available yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={payrollMonthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Area type="monotone" dataKey="total_payout" name="Total Payout" stroke="#3b82f6" fill="url(#payrollGrad)" strokeWidth={2.5} dot={{ r: 5, fill: "#3b82f6" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card chart-narrow">
          <div className="chart-header">
            <div>
              <h2>Leave Status</h2>
              <p>Distribution of leave requests</p>
            </div>
          </div>
          {leavePieData.every(d => d.value === 0) ? (
            <div className="chart-empty">No leave data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leavePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value">
                  {leavePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Attendance Trend + Attendance Pie */}
      <div className="reports-row">
        <div className="chart-card chart-wide">
          <div className="chart-header">
            <div>
              <h2>Attendance Trend (Last 30 Days)</h2>
              <p>Daily breakdown of present, late, absent</p>
            </div>
            <FiClock className="chart-header-icon" style={{ color: "#3b82f6" }} />
          </div>
          {attendanceTrend.length === 0 ? (
            <div className="chart-empty">No attendance records in last 30 days</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card chart-narrow">
          <div className="chart-header">
            <div>
              <h2>Attendance Split</h2>
              <p>Overall attendance breakdown</p>
            </div>
          </div>
          {attendancePieData.every(d => d.value === 0) ? (
            <div className="chart-empty">No attendance data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Department Salary Bar + Leave Breakdown */}
      <div className="reports-row">
        <div className="chart-card chart-half">
          <div className="chart-header">
            <div>
              <h2>Salary by Department</h2>
              <p>Average basic salary per department</p>
            </div>
          </div>
          {deptSalary.length === 0 ? (
            <div className="chart-empty">No department data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptSalary} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Bar dataKey="avg_basic" name="Avg Salary" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
                  {deptSalary.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card chart-half">
          <div className="chart-header">
            <div>
              <h2>Leave Type Breakdown</h2>
              <p>Leaves by type and approval status</p>
            </div>
          </div>
          {leaveBreakdown.length === 0 ? (
            <div className="chart-empty">No leave type data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leaveBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="leave_type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 4: Top Earners Table */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2>Top Earners</h2>
            <p>Employees with highest average net salary</p>
          </div>
          <FiAward className="chart-header-icon" style={{ color: "#f59e0b" }} />
        </div>
        {topEarners.length === 0 ? (
          <div className="chart-empty">No payroll data to rank employees</div>
        ) : (
          <div className="top-earners-table">
            <div className="te-header-row">
              <span>#</span>
              <span>Employee</span>
              <span>Department</span>
              <span>Position</span>
              <span>Avg Net Salary</span>
              <span>Salary Bar</span>
            </div>
            {topEarners.map((emp, i) => {
              const maxSalary = parseFloat(topEarners[0].avg_net_salary);
              const pct = (parseFloat(emp.avg_net_salary) / maxSalary) * 100;
              return (
                <div key={i} className="te-row">
                  <span className={`te-rank rank-${i + 1}`}>{i + 1}</span>
                  <span className="te-name">
                    <div>{emp.name}</div>
                    <div className="te-empid">{emp.empId}</div>
                  </span>
                  <span className="te-dept">{emp.department || "—"}</span>
                  <span className="te-pos">{emp.position || "—"}</span>
                  <span className="te-salary">{fmtCurrency(emp.avg_net_salary)}</span>
                  <span className="te-bar-cell">
                    <div className="te-bar-bg">
                      <div className="te-bar-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}></div>
                    </div>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
