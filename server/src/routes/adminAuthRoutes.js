import express from "express";
import { adminLogin, validateToken, getJWTToken } from "../controllers/adminAuthController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { auth, db } from '../config/firebase.js';

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Validate token route
router.get("/validate", requireRole("admin"), validateToken);

router.post('/custom-token', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }
    
    // Get user from Firestore to verify admin status
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Check if user is an admin
    if (userData.role !== 'admin') {
      return res.status(403).json({ error: 'Not an admin' });
    }
    
    // Create a custom token
    const customToken = await auth.createCustomToken(uid, { role: 'admin' });
    
    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ error: 'Failed to create custom token' });
  }
});

router.post('/get-jwt', getJWTToken);

export default router;
