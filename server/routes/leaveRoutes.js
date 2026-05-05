const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Employee routes
router.post("/", leaveController.applyLeave);
router.get("/me", leaveController.getMyLeaves);

// Admin/HR routes
router.get("/", roleMiddleware(["admin", "hr"]), leaveController.getAllLeaves);
router.put("/:id/status", roleMiddleware(["admin", "hr"]), leaveController.updateLeaveStatus);

module.exports = router;
