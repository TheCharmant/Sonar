// routes/adminAuthRoutes.js
import express from "express";
import { adminLogin, adminGoogleCallback } from "../controllers/adminAuthController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { getAdminDashboard } from "../controllers/adminController.js";

const router = express.Router();

// 🔓 Public auth route
router.post("/login", adminLogin);
router.get("/google/callback", adminGoogleCallback);

// 🔐 Protected route (JWT required, must be admin)
router.get("/dashboard", requireRole("admin"), getAdminDashboard);

export default router;
