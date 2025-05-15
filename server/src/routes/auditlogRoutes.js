import express from "express";
import { 
  getAuditLogs, 
  getAuditLogMetadata, 
  getAuditLogStats,
  getSecurityAlerts,
  acknowledgeSecurityAlert
} from "../controllers/auditlogController.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// All routes require admin role
router.use(requireRole("admin"));

// Get audit logs with filtering and pagination
router.get("/", getAuditLogs);

// Get metadata for filtering options
router.get("/metadata", getAuditLogMetadata);

// Get statistics for dashboard
router.get("/stats", getAuditLogStats);

// Get security alerts (high severity logs)
router.get("/security-alerts", getSecurityAlerts);

// Acknowledge a security alert
router.put("/security-alerts/:id/acknowledge", acknowledgeSecurityAlert);

export default router;
