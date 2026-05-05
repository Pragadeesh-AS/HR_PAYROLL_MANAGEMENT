const db = require("../db");

exports.getSettings = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM SETTINGS LIMIT 1");
    if (result.rows.length === 0) {
      // Return defaults if not set in DB
      return res.json({ shift_start_time: '09:00:00', shift_end_time: '17:00:00' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { shift_start_time, shift_end_time } = req.body;
    
    // Check if a row exists
    const check = await db.query("SELECT id FROM SETTINGS LIMIT 1");
    let result;
    
    if (check.rows.length === 0) {
      // Insert
      result = await db.query(
        "INSERT INTO SETTINGS (shift_start_time, shift_end_time) VALUES ($1, $2) RETURNING *",
        [shift_start_time, shift_end_time]
      );
    } else {
      // Update
      result = await db.query(
        "UPDATE SETTINGS SET shift_start_time = $1, shift_end_time = $2 WHERE id = $3 RETURNING *",
        [shift_start_time, shift_end_time, check.rows[0].id]
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating settings" });
  }
};
