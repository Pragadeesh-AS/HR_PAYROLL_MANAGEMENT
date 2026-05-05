const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  generatePayroll,
  getAllPayroll,
  getMyPayroll,
  markAsPaid,
  deletePayroll,
  previewPayroll,
  editPayroll,
} = require("../controllers/payrollController");

// All routes require authentication
router.use(authMiddleware);

// Employee: view own payslips
router.get("/me", getMyPayroll);

// Preview auto-calculated values (Admin/HR)
router.get("/preview", roleMiddleware(["admin", "hr"]), previewPayroll);

// Admin/HR: get all payroll records
router.get("/", roleMiddleware(["admin", "hr"]), getAllPayroll);

// Admin/HR: generate payroll for an employee
router.post("/generate", roleMiddleware(["admin", "hr"]), generatePayroll);

// Admin/HR: mark payroll as paid
router.put("/:id/pay", roleMiddleware(["admin", "hr"]), markAsPaid);

// Admin/HR: manually edit payroll components
router.put("/:id/edit", roleMiddleware(["admin", "hr"]), editPayroll);

// Admin only: delete payroll
router.delete("/:id", roleMiddleware(["admin"]), deletePayroll);

module.exports = router;
