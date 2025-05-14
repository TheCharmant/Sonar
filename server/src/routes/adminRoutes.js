import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  activateUser,
} from '../controllers/userController.js';
import { generatePasswordResetLink } from '../controllers/adminController.js';
import { isAuthenticated, isAdmin, verifyAdminForUserCreation } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Add this JWT verification middleware
const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Add this new route without modifying existing ones
router.get('/users-jwt', verifyJWT, async (req, res) => {
  try {
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
});

// Add this route without modifying existing ones
router.post('/users-jwt', verifyJWT, createUser);

// Add this route without modifying existing ones
router.get('/users-jwt/:id', verifyJWT, getUserById);
router.put('/users-jwt/:id', verifyJWT, updateUser);

// Add this new route without modifying existing ones
router.get('/users-jwt/:userId/reset-password', verifyJWT, generatePasswordResetLink);

// User management routes
router.get('/users', isAuthenticated, isAdmin, getAllUsers);
router.get('/users/:id', isAuthenticated, isAdmin, getUserById);
router.post('/users', verifyAdminForUserCreation, createUser);
router.put('/users/:id', isAuthenticated, isAdmin, updateUser);
router.delete('/users/:id', isAuthenticated, isAdmin, deleteUser);
router.put('/users/:id/activate', isAuthenticated, isAdmin, activateUser);

// Add a test endpoint to verify token authentication
router.get('/test-auth', isAuthenticated, isAdmin, (req, res) => {
  res.status(200).json({ 
    message: 'Authentication successful',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Add this route with JWT verification
router.put('/users-jwt/:id/activate', verifyJWT, activateUser);

// Add this route with JWT verification
router.delete('/users-jwt/:id', verifyJWT, deleteUser);

// Add this route for activating users with JWT authentication
router.put('/users-jwt/:id/activate', verifyJWT, async (req, res) => {
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
    
    // Log the action
    await createAuditLog({
      type: AuditLogTypes.USER_MANAGEMENT,
      action: AuditLogActions.USER_ACTIVATED,
      performedBy: req.user.uid,
      details: {
        userId: id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      },
      severity: LogSeverity.INFO
    });
    
    res.status(200).json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('Error activating user with JWT:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

export default router;

















