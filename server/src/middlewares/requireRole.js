import { db } from "../config/firebase.js";
import jwt from "jsonwebtoken";

// Require user to be a specific role
export const requireRole = (requiredRoles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (roles.includes(decoded.role)) {
        return next();
      }

      // Optional fallback to Firestore lookup (for redundancy)
      const doc = await db.collection(`${decoded.role}s`).doc(decoded.uid).get();
      if (!doc.exists) {
        return res.status(403).json({ error: "Forbidden: Role mismatch" });
      }

      return next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  };
};


export const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Store decoded user info for further processing
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
