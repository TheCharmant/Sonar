import { db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions, LogSeverity } from "../utils/auditLogger.js";

/**
 * Get all audit logs with filtering and pagination
 */
export const getAuditLogs = async (req, res) => {
  try {
    console.log("Getting audit logs with query:", req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let query = db.collection("auditLogs").orderBy("timestamp", "desc");
    
    // Apply filters if provided
    if (req.query.type) {
      query = query.where("type", "==", req.query.type);
    }
    
    if (req.query.action) {
      query = query.where("action", "==", req.query.action);
    }
    
    if (req.query.performedBy) {
      query = query.where("performedBy", "==", req.query.performedBy);
    }
    
    if (req.query.severity) {
      query = query.where("severity", "==", req.query.severity);
    }
    
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      query = query.where("timestamp", ">=", startDate);
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      query = query.where("timestamp", "<=", endDate);
    }
    
    // Get total count (for pagination)
    // Note: This is a simple approach and might not be efficient for large collections
    // For production, consider using a counter or other pagination strategy
    const countSnapshot = await query.get();
    const totalCount = countSnapshot.size;
    
    // Apply pagination - Firestore doesn't support offset directly, so we need to use limit
    query = query.limit(limit);
    
    // Execute query
    const snapshot = await query.get();
    
    // Transform data
    const logs = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        action: data.action,
        details: data.details || {},
        performedBy: data.performedBy,
        severity: data.severity,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        type: data.type,
        targetUser: data.targetUser || null
      });
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    // Log the request for auditing
    await createAuditLog({
      type: AuditLogTypes.AUDIT,
      action: AuditLogActions.VIEWED_LOGS,
      performedBy: req.user.uid,
      details: {
        filters: req.query,
        resultsCount: logs.length
      },
      severity: LogSeverity.INFO
    });
    
    // Return response
    res.status(200).json({
      logs,
      pagination: {
        page,
        pageSize: limit,
        totalCount,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error("Error getting audit logs:", error);
    res.status(500).json({ error: "Failed to retrieve audit logs" });
  }
};

/**
 * Get metadata for audit logs (types, actions, severities)
 */
export const getAuditLogMetadata = async (req, res) => {
  try {
    console.log("Getting audit log metadata");
    
    // Get unique values from the database for more accurate filtering options
    const typesSnapshot = await db.collection("auditLogs")
      .orderBy("type")
      .select("type")
      .get();
    
    const actionsSnapshot = await db.collection("auditLogs")
      .orderBy("action")
      .select("action")
      .get();
    
    const severitiesSnapshot = await db.collection("auditLogs")
      .orderBy("severity")
      .select("severity")
      .get();
    
    // Extract unique values
    const types = [];
    const typeSet = new Set();
    typesSnapshot.forEach(doc => {
      const type = doc.data().type;
      if (type && !typeSet.has(type)) {
        typeSet.add(type);
        types.push({ value: type, label: type });
      }
    });
    
    const actions = [];
    const actionSet = new Set();
    actionsSnapshot.forEach(doc => {
      const action = doc.data().action;
      if (action && !actionSet.has(action)) {
        actionSet.add(action);
        actions.push({ value: action, label: action.replace(/_/g, ' ') });
      }
    });
    
    const severities = [];
    const severitySet = new Set();
    severitiesSnapshot.forEach(doc => {
      const severity = doc.data().severity;
      if (severity && !severitySet.has(severity)) {
        severitySet.add(severity);
        severities.push({ value: severity, label: severity });
      }
    });
    
    res.status(200).json({
      types,
      actions,
      severities
    });
  } catch (error) {
    console.error("Error getting audit log metadata:", error);
    res.status(500).json({ error: "Failed to retrieve audit log metadata" });
  }
};

/**
 * Get audit log statistics
 */
export const getAuditLogStats = async (req, res) => {
  try {
    console.log("Getting audit log statistics");
    
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get logs for the specified period
    const snapshot = await db.collection("auditLogs")
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "desc")
      .get();
    
    // Initialize stats objects
    const typeStats = {};
    const actionStats = {};
    const severityStats = {};
    const dailyStats = {};
    
    // Initialize dates for the last N days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toISOString().split('T')[0];
      dailyStats[day] = 0;
    }
    
    // Process logs
    snapshot.forEach(doc => {
      const log = doc.data();
      const timestamp = log.timestamp?.toDate?.() || log.timestamp;
      
      // Count by type
      typeStats[log.type] = (typeStats[log.type] || 0) + 1;
      
      // Count by action
      actionStats[log.action] = (actionStats[log.action] || 0) + 1;
      
      // Count by severity
      severityStats[log.severity] = (severityStats[log.severity] || 0) + 1;
      
      // Count by day
      if (timestamp) {
        const day = timestamp.toISOString().split('T')[0];
        dailyStats[day] = (dailyStats[day] || 0) + 1;
      }
    });
    
    // Convert to arrays for easier consumption by charts
    const typeData = Object.entries(typeStats).map(([name, value]) => ({ name, value }));
    const actionData = Object.entries(actionStats).map(([name, value]) => ({ name, value }));
    const severityData = Object.entries(severityStats).map(([name, value]) => ({ name, value }));
    const dailyData = Object.entries(dailyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
    
    res.status(200).json({
      totalLogs: snapshot.size,
      typeData,
      actionData,
      severityData,
      dailyData
    });
  } catch (error) {
    console.error("Error getting audit log statistics:", error);
    res.status(500).json({ error: "Failed to retrieve audit log statistics" });
  }
};

/**
 * Get security alerts
 */
export const getSecurityAlerts = async (req, res) => {
  try {
    console.log("Getting security alerts");
    
    // Get high severity logs (error and critical)
    const snapshot = await db.collection("auditLogs")
      .where("severity", "in", ["error", "critical"])
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    
    const alerts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        action: data.action,
        details: data.details || {},
        performedBy: data.performedBy,
        severity: data.severity,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        type: data.type,
        acknowledged: data.acknowledged || false,
        acknowledgedBy: data.acknowledgedBy || null,
        acknowledgedAt: data.acknowledgedAt?.toDate?.() || data.acknowledgedAt
      });
    });
    
    res.status(200).json({
      alerts
    });
  } catch (error) {
    console.error("Error getting security alerts:", error);
    res.status(500).json({ error: "Failed to retrieve security alerts" });
  }
};

/**
 * Acknowledge a security alert
 */
export const acknowledgeSecurityAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log(`Acknowledging security alert: ${id}`);
    
    // Update the log
    await db.collection("auditLogs").doc(id).update({
      acknowledged: true,
      acknowledgedBy: req.user.uid,
      acknowledgedAt: new Date(),
      acknowledgeNotes: notes || ""
    });
    
    // Log the action
    await createAuditLog({
      type: AuditLogTypes.AUDIT,
      action: AuditLogActions.ACKNOWLEDGED_ALERT,
      performedBy: req.user.uid,
      details: {
        alertId: id,
        notes: notes || ""
      },
      severity: LogSeverity.INFO
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error acknowledging security alert:", error);
    res.status(500).json({ error: "Failed to acknowledge security alert" });
  }
};

export default {
  createAuditLog,
  getAuditLogs,
  getAuditLogMetadata,
  getSecurityAlerts,
  acknowledgeSecurityAlert,
  getAuditLogStats
};
