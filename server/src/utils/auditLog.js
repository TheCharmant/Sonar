import { db } from '../config/firebase.js';

// Audit log types
export const AuditLogTypes = {
  USER_MGMT: 'USER_MANAGEMENT',
  AUTH: 'AUTHENTICATION',
  SYSTEM: 'SYSTEM'
};

// Audit log actions
export const AuditLogActions = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT'
};

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 * @param {string} logData.type - The type of action (from AuditLogTypes)
 * @param {string} logData.action - The specific action (from AuditLogActions)
 * @param {string} logData.performedBy - The user ID who performed the action
 * @param {Object} logData.details - Additional details about the action
 * @returns {Promise<string>} - The ID of the created audit log
 */
export const createAuditLog = async (logData) => {
  try {
    const { type, action, performedBy, details = {} } = logData;
    
    const auditLogData = {
      type,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress || 'unknown'
    };
    
    const docRef = await db.collection('auditLogs').add(auditLogData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logs should never break the main functionality
    return null;
  }
};