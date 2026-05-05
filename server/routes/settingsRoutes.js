const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// Everyone can view the settings (to calculate late/early)
router.get("/", settingsController.getSettings);

// Only Admin/HR can update settings
router.put("/", roleMiddleware(["admin", "hr"]), settingsController.updateSettings);

module.exports = router;
