const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Employee routes
router.post("/mark", attendanceController.markAttendance);
router.get("/me", attendanceController.getMyAttendance);

// Admin/HR routes
router.get("/", roleMiddleware(["admin", "hr"]), attendanceController.getAllAttendance);

module.exports = router;
