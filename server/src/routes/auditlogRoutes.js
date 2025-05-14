import express from "express";
import { requireRole } from "../middlewares/requireRole.js";
import { getAuditLogs } from "../controllers/auditLogController.js";

const router = express.Router();

// Get audit logs (admin only)
router.get("/", requireRole("admin"), getAuditLogs);

export default router;
