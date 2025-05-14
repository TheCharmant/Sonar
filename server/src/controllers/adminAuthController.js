import { auth, db } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import { createAuditLog, AuditLogTypes, AuditLogActions } from "../utils/auditLogger.js";

// Generate JWT token
const generateToken = (uid, role) => {
  return jwt.sign(
    { uid, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" }
  );
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Missing Firebase ID token" });
    }
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;
    
    console.log(`Admin login attempt for user: ${email} (${uid})`);
    
    // First check in the users collection
    let userDoc = await db.collection("users").doc(uid).get();
    let isAdmin = false;
    let userData = null;
    
    // If not found in users collection, check in admins collection
    if (!userDoc.exists) {
      console.log(`User not found in users collection, checking admins collection...`);
      userDoc = await db.collection("admins").doc(uid).get();
      
      if (userDoc.exists) {
        userData = userDoc.data();
        isAdmin = userData.role === "admin";
      }
    } else {
      userData = userDoc.data();
      isAdmin = userData.role === "admin";
    }
    
    if (!userDoc.exists) {
      console.log(`User not found in any collection: ${uid}`);
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!isAdmin) {
      // Create audit log for failed login
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "Not an admin"
        }
      });
      
      console.log(`User ${email} is not an admin. Role: ${userData.role}`);
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    // Update last login in the appropriate collection
    const collectionName = userDoc.ref.parent.id; // Get the collection name
    await db.collection(collectionName).doc(uid).update({
      lastLogin: new Date().toISOString()
    });
    
    // Generate JWT token
    const jwtToken = generateToken(uid, "admin");
    
    // Create audit log for successful login
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_SUCCESS,
      performedBy: uid,
      details: {
        email,
        role: "admin"
      }
    });
    
    console.log(`Admin login successful for ${email}`);
    
    res.status(200).json({
      token: jwtToken,
      role: "admin",
      user: {
        uid,
        email,
        name: userData.name || ""
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export default {
  adminLogin
};
