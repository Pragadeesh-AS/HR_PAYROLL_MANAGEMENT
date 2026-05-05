const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  getSummary,
  getPayrollMonthly,
  getDepartmentSalary,
  getAttendanceTrend,
  getLeaveBreakdown,
  getTopEarners,
} = require("../controllers/reportsController");

// All report routes: Admin only
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/summary", getSummary);
router.get("/payroll-monthly", getPayrollMonthly);
router.get("/department-salary", getDepartmentSalary);
router.get("/attendance-trend", getAttendanceTrend);
router.get("/leave-breakdown", getLeaveBreakdown);
router.get("/top-earners", getTopEarners);

module.exports = router;
