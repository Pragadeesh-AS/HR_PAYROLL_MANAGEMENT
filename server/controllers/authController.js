const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await db.query("SELECT * FROM USERS WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate emp_id (simple logic for now)
    const empCountRes = await db.query("SELECT COUNT(*) FROM USERS");
    const count = parseInt(empCountRes.rows[0].count) + 1;
    const empId = `EMP${String(count).padStart(3, "0")}`;

    // Insert user
    const newUser = await db.query(
      `INSERT INTO USERS (emp_id, name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, emp_id, name, email, role`,
      [empId, name, email, hashedPassword, role || "employee"]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query(
      "SELECT u.*, creator.name as creator_name FROM USERS u LEFT JOIN USERS creator ON u.created_by = creator.user_id WHERE u.email = $1", 
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.user_id, role: user.role, empId: user.emp_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        empId: user.emp_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        managedBy: user.creator_name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const result = await db.query("SELECT * FROM USERS WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];

    // Check current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    await db.query("UPDATE USERS SET password = $1 WHERE user_id = $2", [hashedNewPassword, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating password" });
  }
};
