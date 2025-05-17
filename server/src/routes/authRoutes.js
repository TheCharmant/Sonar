import express from "express";
import { googleLogin, oauthCallback, validateToken } from "../controllers/authController.js";
import { isAuthenticated, verifyJWT } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { auth } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication routes
router.post("/google", googleLogin);
router.get("/callback", oauthCallback);
router.get("/validate-token", isAuthenticated, validateToken);

// Add this route to check user status
router.get('/check-status', async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No token provided in Authorization header");
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log("Received token for status check:", token.substring(0, 10) + "...");
    
    let userId;
    
    // Try to verify the token
    try {
      // Use the imported jwt module
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      
      try {
        // Try JWT verification first
        const decoded = jwt.verify(token, secret);
        userId = decoded.uid;
        console.log("JWT token verified successfully for user:", userId);
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
        
        // If JWT fails, try Firebase
        try {
          const decodedToken = await auth.verifyIdToken(token);
          userId = decodedToken.uid;
          console.log("Firebase token verified successfully for user:", userId);
        } catch (firebaseError) {
          console.error("Firebase token verification failed:", firebaseError.message);
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
      }
    } catch (error) {
      console.error("Token verification completely failed:", error.message);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    // Check user status in database
    console.log("Checking user status in database for user:", userId);
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log("User not found in database:", userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    console.log("User status:", userData.status);
    
    if (userData.status === 'inactive') {
      console.log("User is inactive:", userId);
      return res.status(403).json({ 
        error: 'Your account has been deactivated. Please contact an administrator.',
        code: 'account_deactivated'
      });
    }
    
    console.log("User is active:", userId);
    res.status(200).json({ status: 'active' });
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ error: 'Failed to check user status' });
  }
});

export default router;
