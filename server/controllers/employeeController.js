const db = require("../db");

exports.getAllEmployees = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    
    let query = "SELECT user_id as id, emp_id as \"empId\", name, email, phone, department, position, status, join_date as \"joinDate\", salary_basic as \"basicSalary\", role FROM USERS WHERE role != 'admin'";
    let params = [];
    
    if (userRole === 'hr') {
      query += " AND created_by = $1";
      params.push(userId);
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT user_id as id, emp_id as \"empId\", name, email, phone, department, position, status, join_date as \"joinDate\", salary_basic as \"basicSalary\" FROM USERS WHERE user_id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const creatorRole = req.user.role;
    const { name, email, phone, department, position, joinDate, status, salary, role, assignedHrId } = req.body;
    
    // Generate simple emp_id safely by finding the highest existing emp_id number
    const empCountRes = await db.query("SELECT MAX(CAST(SUBSTRING(emp_id FROM 4) AS INTEGER)) as max_emp_id FROM USERS WHERE emp_id LIKE 'EMP%'");
    const count = (parseInt(empCountRes.rows[0].max_emp_id) || 0) + 1;
    const empId = `EMP${String(count).padStart(3, "0")}`;
    
    // Default password for new employees (should be changed later)
    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Determine role (Only Admin can create HR)
    let finalRole = 'employee';
    if (creatorRole === 'admin' && role === 'hr') {
        finalRole = 'hr';
    }

    // Determine created_by
    let finalCreatedBy = creatorId;
    if (creatorRole === 'admin' && finalRole === 'employee' && assignedHrId) {
        finalCreatedBy = assignedHrId;
    }

    const result = await db.query(
      `INSERT INTO USERS 
       (emp_id, name, email, password, role, department, position, phone, salary_basic, status, join_date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING user_id as id, emp_id as "empId", name, email`,
      [empId, name, email, hashedPassword, finalRole, department, position, phone, salary?.basic || 0, status || 'active', joinDate, finalCreatedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, department, position, status, salary } = req.body;
    
    const result = await db.query(
      `UPDATE USERS 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone), 
           department = COALESCE($4, department), 
           position = COALESCE($5, position), 
           status = COALESCE($6, status),
           salary_basic = COALESCE($7, salary_basic)
       WHERE user_id = $8 
       RETURNING user_id as id`,
      [name, email, phone, department, position, status, salary?.basic, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM USERS WHERE user_id = $1 RETURNING user_id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
