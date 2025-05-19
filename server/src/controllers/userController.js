import { auth, db } from "../config/firebase.js";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    console.log("Getting all users, requested by:", req.user?.uid);
    
    // Get users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    console.log("Creating user, request body:", req.body);
    console.log("Request user:", req.user);
    
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email is valid
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    try {
      // Check if user already exists
      const existingUser = await auth.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    } catch (error) {
      // Error means user doesn't exist, which is what we want
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
    
    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, { role });
    
    // Create user document in Firestore
    const userData = {
      name,
      email,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: req.user?.uid || 'system'
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_CREATED,
      performedBy: req.user?.uid || 'system',
      details: {
        userId: userRecord.uid,
        userEmail: email,
        userRole: role
      }
    });
    
    res.status(201).json({
      id: userRecord.uid,
      ...userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email format' });
    } else if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak' });
    }
    
    res.status(500).json({ error: 'Failed to create user: ' + (error.message || 'Unknown error') });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Validate input
    if (!name && !email && !role) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Check if user exists
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user in Firestore
    const userData = {};
    if (name) userData.name = name;
    if (email) userData.email = email;
    if (role) userData.role = role;
    
    await db.collection('users').doc(id).update({
      ...userData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.uid || 'system'
    });
    
    // Update user in Firebase Auth if email changed
    if (email) {
      await auth.updateUser(id, { email });
    }
    
    // Update custom claims if role changed
    if (role) {
      await auth.setCustomUserClaims(id, { role });
    }
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_UPDATED,
      performedBy: req.user?.uid || 'system',
      details: {
        userId: id,
        updates: userData
      }
    });
    
    res.status(200).json({ id, ...userData });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user (deactivate)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Deactivate user in Firestore
    await db.collection('users').doc(id).update({
      status: 'inactive',
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: req.user.uid
    });
    
    // Create audit log
    await createAuditLog({
      type: AuditLogTypes.USER_MGMT,
      action: AuditLogActions.USER_DEACTIVATED,
      performedBy: req.user.uid,
      details: {
        userId: id,
        userEmail: userDoc.data().email
      }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Activate user in Firestore
    await db.collection('users').doc(id).update({
      status: 'active',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.uid
    });
    
    res.status(200).json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
};

// Get current user profile
export const getCurrentUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      user: {
        uid: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};
