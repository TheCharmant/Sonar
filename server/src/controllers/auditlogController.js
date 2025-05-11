import admin from "firebase-admin";
const db = admin.firestore();
const auditLogsRef = db.collection("auditLogs");

// CREATE an audit log
const createAuditLog = async (req, res) => {
  try {
    const {
      timestamp = new Date().toISOString(),
      user,
      role,
      type,
      action,
    } = req.body;

    if (!user || !role || !type || !action) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newLog = { timestamp, user, role, type, action };
    const docRef = await auditLogsRef.add(newLog);
    res.status(201).json({ id: docRef.id, ...newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ all audit logs
const getAllAuditLogs = async (req, res) => {
  try {
    const snapshot = await auditLogsRef.orderBy("timestamp", "desc").get();
    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        user: data.user,
        role: data.role,
        type: data.type,
        action: data.action
      };
    });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ single audit log
const getAuditLogById = async (req, res) => {
  try {
    const doc = await auditLogsRef.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE audit log
const updateAuditLog = async (req, res) => {
  try {
    await auditLogsRef.doc(req.params.id).update(req.body);
    res.status(200).json({ message: "Log updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE audit log
const deleteAuditLog = async (req, res) => {
  try {
    await auditLogsRef.doc(req.params.id).delete();
    res.status(200).json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  updateAuditLog,
  deleteAuditLog,
};
