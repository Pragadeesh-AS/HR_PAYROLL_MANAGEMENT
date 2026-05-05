const db = require("../db");

exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const result = await db.query(
      `INSERT INTO LEAVES (user_id, leave_type, start_date, end_date, days, reason) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, leaveType, startDate, endDate, days, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error applying for leave" });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM LEAVES WHERE user_id = $1 ORDER BY applied_on DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching your leaves" });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.leave_id as id, l.leave_type as "leaveType", l.start_date as "startDate", 
              l.end_date as "endDate", l.reason, l.status, l.applied_on as "appliedOn",
              u.user_id as "employeeId", u.name as "employeeName", u.emp_id as "empId"
       FROM LEAVES l 
       JOIN USERS u ON l.user_id = u.user_id 
       ORDER BY CASE WHEN l.status = 'Pending' THEN 1 ELSE 2 END, l.applied_on DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching all leaves" });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    const result = await db.query(
      `UPDATE LEAVES SET status = $1 WHERE leave_id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating leave status" });
  }
};
