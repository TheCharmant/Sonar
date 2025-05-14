import { db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Check if user already exists
    const existingUsers = await db.collection("users").where("email", "==", email).get();
    if (!existingUsers.empty) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    const newUser = {
      email,
      name: name || "",
      role: role || "user",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    const docRef = await db.collection("users").add(newUser);
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_CREATED,
      performedBy: req.user.uid,
      details: {
        userId: docRef.id,
        email,
        role: newUser.role
      }
    });
    
    res.status(201).json({
      id: docRef.id,
      ...newUser
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    await db.collection("users").doc(id).update(updateData);
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_UPDATED,
      performedBy: req.user.uid,
      details: {
        userId: id,
        updatedFields: Object.keys(updateData)
      }
    });
    
    res.status(200).json({
      id,
      ...userDoc.data(),
      ...updateData
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Soft delete user (deactivate)
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await db.collection("users").doc(id).update({
      status: "inactive",
      deactivatedAt: new Date().toISOString()
    });
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_DELETED,
      performedBy: req.user.uid,
      details: {
        userId: id,
        email: userDoc.data().email
      }
    });
    
    res.status(200).json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  softDeleteUser
};
