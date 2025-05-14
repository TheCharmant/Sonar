import { db } from "../config/firebase.js";

// CREATE an audit log
const createAuditLog = async (req, res) => {
  try {
    const {
      timestamp = new Date().toISOString(),
      user,
      role,
      type,
      action,
      metadata = {}
    } = req.body;

    if (!user || !role || !type || !action) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newLog = { timestamp, user, role, type, action, metadata };
    const docRef = await auditLogsRef.add(newLog);
    res.status(201).json({ id: docRef.id, ...newLog });
  } catch (err) {
    console.error("Error creating audit log:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get audit logs with pagination and filtering
export const getAuditLogs = async (req, res) => {
  try {
    const { limit = 20, page = 1, type, action, startDate, endDate } = req.query;
    
    let query = db.collection("auditLogs").orderBy("timestamp", "desc");
    
    // Apply filters if provided
    if (type) {
      query = query.where("type", "==", type);
    }
    
    if (action) {
      query = query.where("action", "==", action);
    }
    
    if (startDate && endDate) {
      query = query.where("timestamp", ">=", startDate)
                   .where("timestamp", "<=", endDate);
    }
    
    // Pagination
    const pageSize = parseInt(limit);
    const startAt = (parseInt(page) - 1) * pageSize;
    
    const snapshot = await query.limit(pageSize).offset(startAt).get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        pageSize,
        hasMore: logs.length === pageSize
      }
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

// READ single audit log
const getAuditLogById = async (req, res) => {
  try {
    const doc = await auditLogsRef.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching audit log:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE audit log
const updateAuditLog = async (req, res) => {
  try {
    await auditLogsRef.doc(req.params.id).update(req.body);
    res.status(200).json({ message: "Log updated" });
  } catch (err) {
    console.error("Error updating audit log:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE audit log
const deleteAuditLog = async (req, res) => {
  try {
    await auditLogsRef.doc(req.params.id).delete();
    res.status(200).json({ message: "Log deleted" });
  } catch (err) {
    console.error("Error deleting audit log:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  updateAuditLog,
  deleteAuditLog,
};
