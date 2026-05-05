const db = require("../db");

// Mark attendance (Clock in / Clock out)
exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    const settingsRes = await db.query("SELECT * FROM SETTINGS LIMIT 1");
    let shift_start_time = '09:00:00';
    let shift_end_time = '17:00:00';
    if (settingsRes.rows.length > 0) {
      shift_start_time = settingsRes.rows[0].shift_start_time;
      shift_end_time = settingsRes.rows[0].shift_end_time;
    }

    // Check if attendance already exists for today
    const checkResult = await db.query(
      "SELECT * FROM ATTENDANCE WHERE user_id = $1 AND date = $2",
      [userId, today]
    );

    if (checkResult.rows.length === 0) {
      // Clock in
      // Calculate 'Present' vs 'Late'
      let status = 'Present';
      if (nowTime > shift_start_time) {
        status = 'Late';
      }

      const result = await db.query(
        `INSERT INTO ATTENDANCE (user_id, date, status, check_in) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, today, status, nowTime]
      );
      return res.status(201).json(result.rows[0]);
    } else {
      const attendance = checkResult.rows[0];
      if (attendance.check_out) {
        return res.status(400).json({ error: "You have already clocked out for today." });
      }
      
      // Clock out
      let newStatus = attendance.status;
      if (nowTime < shift_end_time) {
        newStatus = `${newStatus} - Left Early`;
      }

      const result = await db.query(
        `UPDATE ATTENDANCE SET check_out = $1, status = $2 WHERE attendance_id = $3 RETURNING *`,
        [nowTime, newStatus, attendance.attendance_id]
      );
      return res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while marking attendance" });
  }
};

// Get personal attendance history
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT a.*, u.name as "employeeName" 
       FROM ATTENDANCE a 
       JOIN USERS u ON a.user_id = u.user_id 
       WHERE a.user_id = $1 
       ORDER BY a.date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching attendance" });
  }
};

// Get all attendance (Admin/HR)
exports.getAllAttendance = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.attendance_id as id, a.date, a.status, a.check_in, a.check_out, 
              u.user_id as "employeeId", u.name as "employeeName", u.emp_id as "empId", u.department 
       FROM ATTENDANCE a 
       JOIN USERS u ON a.user_id = u.user_id 
       ORDER BY a.date DESC, u.name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching all attendance records" });
  }
};
