import express from "express";
import auditLogController from "../controllers/auditLogController.js";

const router = express.Router();

router.post("/", auditLogController.createAuditLog);
router.get("/", auditLogController.getAllAuditLogs);
router.get("/:id", auditLogController.getAuditLogById);
router.put("/:id", auditLogController.updateAuditLog);
router.delete("/:id", auditLogController.deleteAuditLog);

export default router;
