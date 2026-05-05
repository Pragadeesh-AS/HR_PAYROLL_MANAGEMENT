const db = require("../db");

// GET /api/reports/summary - Overall company KPIs
exports.getSummary = async (req, res) => {
  try {
    const [empRes, leaveRes, attendanceRes, payrollRes] = await Promise.all([
      db.query(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hr_count,
        SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as emp_count
        FROM USERS WHERE role != 'admin'`),

      db.query(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
        FROM LEAVES`),

      db.query(`SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
        FROM ATTENDANCE`),

      db.query(`SELECT 
        COUNT(*) as total,
        COALESCE(SUM(net_salary), 0) as total_payout,
        COALESCE(AVG(net_salary), 0) as avg_salary,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count
        FROM PAYROLL`)
    ]);

    res.json({
      employees: empRes.rows[0],
      leaves: leaveRes.rows[0],
      attendance: attendanceRes.rows[0],
      payroll: payrollRes.rows[0]
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    res.status(500).json({ error: "Server error fetching report summary" });
  }
};

// GET /api/reports/payroll-monthly - Monthly payroll expense trend
exports.getPayrollMonthly = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        month,
        ROUND(SUM(net_salary)::numeric, 2) as total_payout,
        ROUND(AVG(net_salary)::numeric, 2) as avg_salary,
        COUNT(*) as employee_count
      FROM PAYROLL
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching payroll monthly data" });
  }
};

// GET /api/reports/department-salary - Salary distribution by department
exports.getDepartmentSalary = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COALESCE(u.department, 'Unassigned') as department,
        COUNT(DISTINCT u.user_id) as employee_count,
        ROUND(AVG(u.salary_basic)::numeric, 2) as avg_basic,
        ROUND(SUM(u.salary_basic)::numeric, 2) as total_basic
      FROM USERS u
      WHERE u.role = 'employee' AND u.status = 'active'
      GROUP BY u.department
      ORDER BY total_basic DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching department salary data" });
  }
};

// GET /api/reports/attendance-trend - Last 7 days attendance breakdown
exports.getAttendanceTrend = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        TO_CHAR(date, 'Mon DD') as label,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM ATTENDANCE
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching attendance trend" });
  }
};

// GET /api/reports/leave-breakdown - Leave type distribution
exports.getLeaveBreakdown = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        leave_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(days) as total_days
      FROM LEAVES
      GROUP BY leave_type
      ORDER BY total DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching leave breakdown" });
  }
};

// GET /api/reports/top-earners - Top 5 employees by net salary
exports.getTopEarners = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.name,
        u.emp_id as "empId",
        u.department,
        u.position,
        ROUND(AVG(p.net_salary)::numeric, 2) as avg_net_salary,
        ROUND(MAX(p.net_salary)::numeric, 2) as max_net_salary
      FROM PAYROLL p
      JOIN USERS u ON p.user_id = u.user_id
      GROUP BY u.user_id, u.name, u.emp_id, u.department, u.position
      ORDER BY avg_net_salary DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching top earners" });
  }
};
