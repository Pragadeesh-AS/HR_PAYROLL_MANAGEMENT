const db = require("../db");

// Constants for payroll calculation
const HRA_RATE = 0.20;        // 20% of basic
const TRANSPORT_ALLOWANCE = 1600;
const PF_RATE = 0.12;         // 12% of basic (Employee PF)
const PROFESSIONAL_TAX = 200; // Fixed monthly

// Helper: Calculate working days in a month
const getWorkingDaysInMonth = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) workingDays++; // Exclude Sat & Sun
  }
  return workingDays;
};

// GET /api/payroll/preview - Return auto-calculated values for a given employee+month
exports.previewPayroll = async (req, res) => {
  try {
    const { userId, month } = req.query;
    if (!userId || !month) return res.status(400).json({ error: "userId and month required" });

    const empRes = await db.query(
      "SELECT name, salary_basic, department, position FROM USERS WHERE user_id = $1",
      [userId]
    );
    if (empRes.rows.length === 0) return res.status(404).json({ error: "Employee not found" });

    const employee = empRes.rows[0];
    const basicSalary = parseFloat(employee.salary_basic);
    const [year, monthNum] = month.split("-").map(Number);
    const totalWorkingDays = getWorkingDaysInMonth(year, monthNum);

    const absentRes = await db.query(
      `SELECT COUNT(*) as absent_days FROM ATTENDANCE 
       WHERE user_id = $1 AND status = 'absent'
       AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
      [userId, year, monthNum]
    );
    const absentDays = parseInt(absentRes.rows[0].absent_days) || 0;

    const leaveRes = await db.query(
      `SELECT COALESCE(SUM(days), 0) as leave_days FROM LEAVES 
       WHERE user_id = $1 AND status = 'Approved'
       AND EXTRACT(YEAR FROM start_date) = $2 AND EXTRACT(MONTH FROM start_date) = $3`,
      [userId, year, monthNum]
    );
    const approvedLeaveDays = parseInt(leaveRes.rows[0].leave_days) || 0;
    const deductibleDays = Math.max(0, absentDays - approvedLeaveDays);
    const perDaySalary = totalWorkingDays > 0 ? basicSalary / totalWorkingDays : 0;
    const absenceDeduction = parseFloat((deductibleDays * perDaySalary).toFixed(2));
    const hra = parseFloat((basicSalary * HRA_RATE).toFixed(2));
    const transport = TRANSPORT_ALLOWANCE;
    const pf = parseFloat((basicSalary * PF_RATE).toFixed(2));
    const professionalTax = PROFESSIONAL_TAX;

    res.json({
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      basicSalary,
      totalWorkingDays,
      absentDays,
      approvedLeaveDays,
      deductibleDays,
      defaults: { basic: basicSalary, hra, transport, pf, professionalTax, absenceDeduction }
    });
  } catch (error) {
    console.error("Preview payroll error:", error);
    res.status(500).json({ error: "Server error previewing payroll" });
  }
};

// POST /api/payroll/generate - Generate payroll (supports manual overrides)
exports.generatePayroll = async (req, res) => {
  try {
    const { userId, month, overrides } = req.body; // overrides: { basic, hra, transport, pf, professionalTax, absenceDeduction }

    if (!userId || !month) {
      return res.status(400).json({ error: "userId and month are required" });
    }

    // Check if payroll already exists for this month
    const existing = await db.query(
      "SELECT payroll_id FROM PAYROLL WHERE user_id = $1 AND month = $2",
      [userId, month]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `Payroll for ${month} already exists for this employee.` });
    }

    const empRes = await db.query(
      "SELECT name, salary_basic, department, position FROM USERS WHERE user_id = $1",
      [userId]
    );
    if (empRes.rows.length === 0) return res.status(404).json({ error: "Employee not found" });

    const employee = empRes.rows[0];
    const autoBasic = parseFloat(employee.salary_basic);
    const [year, monthNum] = month.split("-").map(Number);
    const totalWorkingDays = getWorkingDaysInMonth(year, monthNum);

    const absentRes = await db.query(
      `SELECT COUNT(*) as absent_days FROM ATTENDANCE 
       WHERE user_id = $1 AND status = 'absent'
       AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
      [userId, year, monthNum]
    );
    const absentDays = parseInt(absentRes.rows[0].absent_days) || 0;

    const leaveRes = await db.query(
      `SELECT COALESCE(SUM(days), 0) as leave_days FROM LEAVES 
       WHERE user_id = $1 AND status = 'Approved'
       AND EXTRACT(YEAR FROM start_date) = $2 AND EXTRACT(MONTH FROM start_date) = $3`,
      [userId, year, monthNum]
    );
    const approvedLeaveDays = parseInt(leaveRes.rows[0].leave_days) || 0;
    const deductibleDays = Math.max(0, absentDays - approvedLeaveDays);
    const perDaySalary = totalWorkingDays > 0 ? autoBasic / totalWorkingDays : 0;
    const autoAbsenceDeduction = parseFloat((deductibleDays * perDaySalary).toFixed(2));

    // Use overrides if provided, else use auto-calculated values
    const basic = parseFloat(overrides?.basic ?? autoBasic);
    const hra = parseFloat(overrides?.hra ?? (autoBasic * HRA_RATE).toFixed(2));
    const transport = parseFloat(overrides?.transport ?? TRANSPORT_ALLOWANCE);
    const pf = parseFloat(overrides?.pf ?? (autoBasic * PF_RATE).toFixed(2));
    const professionalTax = parseFloat(overrides?.professionalTax ?? PROFESSIONAL_TAX);
    const absenceDeduction = parseFloat(overrides?.absenceDeduction ?? autoAbsenceDeduction);

    const totalAllowances = parseFloat((hra + transport).toFixed(2));
    const totalDeductions = parseFloat((absenceDeduction + pf + professionalTax).toFixed(2));
    const netSalary = parseFloat((basic + totalAllowances - totalDeductions).toFixed(2));

    const result = await db.query(
      `INSERT INTO PAYROLL (user_id, month, basic, allowances, deductions, net_salary, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'generated') RETURNING *`,
      [userId, month, basic, totalAllowances, totalDeductions, netSalary]
    );

    res.status(201).json({
      ...result.rows[0],
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
    });
  } catch (error) {
    console.error("Generate payroll error:", error);
    res.status(500).json({ error: "Server error generating payroll" });
  }
};

// PUT /api/payroll/:id/edit - Edit an existing payroll record manually
exports.editPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { basic, hra, transport, pf, professionalTax, absenceDeduction } = req.body;

    const totalAllowances = parseFloat(((hra || 0) + (transport || 0)).toFixed(2));
    const totalDeductions = parseFloat(((absenceDeduction || 0) + (pf || 0) + (professionalTax || 0)).toFixed(2));
    const netSalary = parseFloat(((basic || 0) + totalAllowances - totalDeductions).toFixed(2));

    const result = await db.query(
      `UPDATE PAYROLL SET basic = $1, allowances = $2, deductions = $3, net_salary = $4
       WHERE payroll_id = $5 RETURNING *`,
      [basic, totalAllowances, totalDeductions, netSalary, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Payroll not found" });
    res.json({ message: "Payroll updated", payroll: result.rows[0] });
  } catch (error) {
    console.error("Edit payroll error:", error);
    res.status(500).json({ error: "Server error editing payroll" });
  }
};

// GET /api/payroll - Admin/HR: get all payroll records
exports.getAllPayroll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.payroll_id as id, p.month, p.basic, p.allowances, p.deductions, 
              p.net_salary as "netSalary", p.status, p.paid_on as "paidOn",
              u.user_id as "userId", u.name as "employeeName", 
              u.emp_id as "empId", u.department, u.position
       FROM PAYROLL p
       JOIN USERS u ON p.user_id = u.user_id
       ORDER BY p.month DESC, u.name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching payroll" });
  }
};

// GET /api/payroll/me - Employee: get own payslips
exports.getMyPayroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT p.payroll_id as id, p.month, p.basic, p.allowances, p.deductions, 
              p.net_salary as "netSalary", p.status, p.paid_on as "paidOn",
              u.name as "employeeName", u.emp_id as "empId", u.department, u.position
       FROM PAYROLL p
       JOIN USERS u ON p.user_id = u.user_id
       WHERE p.user_id = $1
       ORDER BY p.month DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching payslips" });
  }
};

// PUT /api/payroll/:id/pay - Mark payroll as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE PAYROLL SET status = 'paid', paid_on = CURRENT_DATE 
       WHERE payroll_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payroll record not found" });
    }
    res.json({ message: "Payroll marked as paid", payroll: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error marking payroll as paid" });
  }
};

// DELETE /api/payroll/:id - Delete payroll record (Admin only)
exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM PAYROLL WHERE payroll_id = $1 RETURNING payroll_id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payroll record not found" });
    }
    res.json({ message: "Payroll record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting payroll" });
  }
};
