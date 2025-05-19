import express from "express";
import { adminLogin, validateToken, getJWTToken } from "../controllers/adminAuthController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { isAuthenticated } from "../middleware/auth.js";
import { auth, db } from '../config/firebase.js';

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Validate token route
router.get("/validate", requireRole("admin"), validateToken);

// Get JWT token route
router.post("/get-jwt-token", getJWTToken);

// Get admin profile
router.get('/profile', isAuthenticated, async (req, res) => {
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
    console.error('Error getting admin profile:', error);
    res.status(500).json({ error: 'Failed to get admin profile' });
  }
});

export default router;
