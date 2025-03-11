import express from "express";
import { getDashboardData, updateDashboardData } from "../controllers/dashboardController.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to get dashboard data (only for authorized users)
router.get("/", checkRole(["admin", "user"]), getDashboardData);

// Route to update dashboard data (only for admins)
router.put("/:id", checkRole(["admin"]), updateDashboardData);

export default router;
