import { auth, db } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import { createAuditLog, AuditLogTypes, AuditLogActions, LogSeverity } from "../utils/auditLogger.js";

// Generate JWT token with improved security
const generateToken = (uid, role, email) => {
  return jwt.sign(
    { uid, role, email, timestamp: Date.now() },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "8h" } // Shorter expiration for better security
  );
};

// Admin login with enhanced logging and security
export const adminLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    if (!token) {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: "unknown",
        details: {
          reason: "Missing token",
          ipAddress,
          userAgent
        }
      });
      return res.status(400).json({ error: "Missing Firebase ID token" });
    }
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;
    
    // First check in the users collection
    let userDoc = await db.collection("users").doc(uid).get();
    let isAdmin = false;
    let userData = null;
    
    // If not found in users collection, check in admins collection
    if (!userDoc.exists) {
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
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "User not found",
          ipAddress,
          userAgent
        }
      });
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!isAdmin) {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "Insufficient permissions",
          role: userData.role,
          ipAddress,
          userAgent
        }
      });
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    // Check if user is inactive/deactivated
    if (userData.status === "inactive") {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "Account deactivated",
          ipAddress,
          userAgent
        }
      });
      
      return res.status(403).json({ 
        error: "Your account has been deactivated. Please contact an administrator.",
        code: "account_deactivated"
      });
    }
    
    // Update last login in the appropriate collection
    const collectionName = userDoc.ref.parent.id;
    await db.collection(collectionName).doc(uid).update({
      lastLogin: new Date().toISOString(),
      lastLoginIP: ipAddress,
      lastLoginUserAgent: userAgent
    });
    
    // Generate JWT token
    const jwtToken = generateToken(uid, "admin", email);
    
    // Create audit log for successful login
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.LOGIN_SUCCESS,
      performedBy: uid,
      details: {
        email,
        role: "admin",
        ipAddress,
        userAgent
      }
    });
    
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
    
    // Only log authentication errors that aren't already logged
    // Don't create duplicate logs for already handled errors
    if (!error.logged) {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.LOGIN_FAILED,
        performedBy: "unknown",
        details: {
          error: error.message,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      });
    }
    
    res.status(500).json({ error: "Authentication failed" });
  }
};

/**
 * Validate admin token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const validateToken = async (req, res) => {
  try {
    // If the request made it past the requireRole middleware,
    // the token is valid and the user has admin privileges
    res.status(200).json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ error: "Token validation failed" });
  }
};

export const getJWTToken = async (req, res) => {
  try {
    const { token } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    if (!token) {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.TOKEN_GENERATION_FAILED,
        performedBy: "unknown",
        details: {
          reason: "Missing Firebase ID token",
          ipAddress,
          userAgent
        },
        severity: LogSeverity.WARNING
      });
      return res.status(400).json({ error: "Missing Firebase ID token" });
    }
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const { uid, email } = decodedToken;
    
    // Check if user is an admin
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.TOKEN_GENERATION_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "User not found",
          ipAddress,
          userAgent
        },
        severity: LogSeverity.WARNING
      });
      return res.status(404).json({ error: "User not found" });
    }
    
    const userData = userDoc.data();
    
    if (userData.role !== "admin") {
      await createAuditLog({
        type: AuditLogTypes.AUTH,
        action: AuditLogActions.TOKEN_GENERATION_FAILED,
        performedBy: uid,
        details: {
          email,
          reason: "Insufficient permissions",
          role: userData.role,
          ipAddress,
          userAgent
        },
        severity: LogSeverity.WARNING
      });
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    // Generate JWT token
    const jwtToken = generateToken(uid, "admin", email);
    
    // Log successful token generation
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.TOKEN_GENERATED,
      performedBy: uid,
      details: {
        email,
        role: "admin",
        ipAddress,
        userAgent
      },
      severity: LogSeverity.INFO
    });
    
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
    console.error("Error generating JWT token:", error);
    
    // Log token generation failure
    await createAuditLog({
      type: AuditLogTypes.AUTH,
      action: AuditLogActions.TOKEN_GENERATION_FAILED,
      performedBy: "unknown",
      details: {
        error: error.message,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      },
      severity: LogSeverity.ERROR
    });
    
    res.status(500).json({ error: "Authentication failed" });
  }
};

export default {
  adminLogin,
  validateToken,
  getJWTToken
};
