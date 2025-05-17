import { db } from "../config/firebase.js";

// Audit log types
export const AuditLogTypes = {
  AUTH: "auth",
  USER: "user",
  ADMIN: "admin",
  SYSTEM: "system",
  EMAIL: "email",
  AUDIT: "audit"
};

// Audit log actions
export const AuditLogActions = {
  // Auth actions
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  PASSWORD_RESET: "password_reset",
  PASSWORD_CHANGED: "password_changed",
  ACCESS_GRANTED: "access_granted",
  ACCESS_DENIED: "access_denied",
  AUTHENTICATION_FAILED: "authentication_failed",
  
  // User actions
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  USER_CREATION_FAILED: "user_creation_failed",
  
  // Admin actions
  SETTINGS_UPDATED: "settings_updated",
  SYSTEM_CONFIGURED: "system_configured",
  
  // Email actions
  EMAIL_SENT: "email_sent",
  EMAIL_FAILED: "email_failed",
  
  // Audit actions
  VIEWED_LOGS: "viewed_logs",
  ACKNOWLEDGED_ALERT: "acknowledged_alert",
  EXPORTED_LOGS: "exported_logs"
};

// Log severity levels
export const LogSeverity = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical"
};

/**
 * Create an audit log entry
 * @param {Object} logData - The log data
 * @param {string} logData.type - The log type (from AuditLogTypes)
 * @param {string} logData.action - The action (from AuditLogActions)
 * @param {string} logData.performedBy - The user ID who performed the action
 * @param {Object} logData.details - Additional details about the action
 * @param {string} [logData.severity=LogSeverity.INFO] - The severity level
 * @param {string} [logData.targetUser] - The user ID who was the target of the action
 * @returns {Promise<string>} - The ID of the created log entry
 */
export const createAuditLog = async (logData) => {
  try {
    const {
      type,
      action,
      performedBy,
      details,
      severity = LogSeverity.INFO,
      targetUser = null
    } = logData;
    
    // Create log entry
    const logEntry = {
      type,
      action,
      performedBy,
      details,
      severity,
      timestamp: new Date(),
      targetUser
    };
    
    // Add to Firestore
    const docRef = await db.collection("auditLogs").add(logEntry);
    console.log(`Audit log created: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw - we don't want audit logging to break the application
    return null;
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

/**
 * Get recent audit logs for a specific user
 * @param {string} userId - The user ID to get logs for
 * @param {number} limit - Maximum number of logs to return
 * @returns {Array} Array of audit logs
 */
export const getUserAuditLogs = async (userId, limit = 10) => {
  try {
    const snapshot = await db.collection("auditLogs")
      .where("performedBy", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return logs;
  } catch (error) {
    console.error("Error getting user audit logs:", error);
    return [];
  }
};

/**
 * Get security alerts that need attention
 * @param {number} limit - Maximum number of alerts to return
 * @returns {Array} Array of security alerts
 */
export const getSecurityAlerts = async (limit = 50) => {
  try {
    const snapshot = await db.collection("securityAlerts")
      .where("acknowledged", "==", false)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return alerts;
  } catch (error) {
    console.error("Error getting security alerts:", error);
    return [];
  }
};

/**
 * Acknowledge a security alert
 * @param {string} alertId - The ID of the alert to acknowledge
 * @param {string} acknowledgedBy - User ID who acknowledged the alert
 * @returns {boolean} Success status
 */
export const acknowledgeSecurityAlert = async (alertId, acknowledgedBy) => {
  try {
    await db.collection("securityAlerts").doc(alertId).update({
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error acknowledging security alert:", error);
    return false;
  }
};


