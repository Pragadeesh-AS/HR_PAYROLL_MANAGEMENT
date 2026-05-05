const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Only Admin and HR can manage employees
router.use(roleMiddleware(["admin", "hr"]));

router.get("/", employeeController.getAllEmployees);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
