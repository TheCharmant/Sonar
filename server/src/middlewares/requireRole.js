import jwt from 'jsonwebtoken';
import { auth, db } from '../config/firebase.js';

// Middleware to check if user has a specific role
export const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Try JWT first, then Firebase
      try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);
        
        // If role is "any", allow any authenticated user
        if (role === "any") {
          req.user = decoded;
          return next();
        }
        
        // Check if user has the required role
        if (decoded.role !== role) {
          return res.status(403).json({ error: `Forbidden - ${role} access required` });
        }
        
        req.user = decoded;
      } catch (jwtError) {
        console.log("JWT verification failed, trying Firebase:", jwtError.message);
        
        try {
          const decodedToken = await auth.verifyIdToken(token);
          
          // If role is "any", allow any authenticated user with a valid Firebase token
          if (role === "any") {
            req.user = {
              uid: decodedToken.uid,
              email: decodedToken.email
            };
            return next();
          }
          
          // Check if user has the required role in Firestore
          const userDoc = await db.collection('users').doc(decodedToken.uid).get();
          
          if (!userDoc.exists || userDoc.data().role !== role) {
            return res.status(403).json({ error: `Forbidden - ${role} access required` });
          }
          
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userDoc.data().role
          };
        } catch (firebaseError) {
          console.error("Firebase verification failed:", firebaseError);
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
      }
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Unauthorized - Authentication failed' });
    }
  };
};
