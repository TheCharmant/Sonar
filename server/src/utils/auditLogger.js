import { db } from "../config/firebase.js";

// Audit log types
export const AuditLogTypes = {
  AUTH: "authentication",
  USER_MGMT: "user_management",
  SYSTEM: "system",
  DATA: "data"
};

// Audit log actions
export const AuditLogActions = {
  // Authentication actions
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  PASSWORD_RESET: "password_reset",
  
  // User management actions
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  
  // System actions
  SYSTEM_CONFIG_CHANGED: "system_config_changed",
  
  // Data actions
  DATA_EXPORTED: "data_exported",
  DATA_IMPORTED: "data_imported"
};

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 * @param {string} logData.type - The type of action (from AuditLogTypes)
 * @param {string} logData.action - The specific action (from AuditLogActions)
 * @param {string} logData.performedBy - User ID who performed the action
 * @param {Object} logData.details - Additional details about the action
 */
export const createAuditLog = async (logData) => {
  try {
    const { type, action, performedBy, details = {} } = logData;
    
    const auditLog = {
      type,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress || "unknown"
    };
    
    await db.collection("auditLogs").add(auditLog);
    return true;
  } catch (error) {
    console.error("Error creating audit log:", error);
    return false;
  }
};

// Safe version that doesn't throw errors
export const safeCreateAuditLog = async (logData) => {
  try {
    await createAuditLog(logData);
    return true;
  } catch (error) {
    console.error("Error in safeCreateAuditLog:", error);
    return false;
  }
};



