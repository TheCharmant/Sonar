import jwt from "jsonwebtoken";
import { db } from "../config/firebase.js";

export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split("Bearer ")[1];
      
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const { uid } = decoded;
        
        // Get user from Firestore
        const userDoc = await db.collection("users").doc(uid).get();
        
        if (!userDoc.exists) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const userData = userDoc.data();
        
        // Check if user has required role
        if (userData.role !== role && role !== "any") {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
        
        // Check if user is active
        if (userData.status !== "active") {
          return res.status(403).json({ error: "Account is inactive" });
        }
        
        // Add user data to request object
        req.user = {
          uid,
          email: userData.email,
          role: userData.role,
          name: userData.name || ""
        };
        
        next();
      } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid authentication" });
      }
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return res.status(500).json({ error: "Authentication error" });
    }
  };
};
