import jwt from 'jsonwebtoken';
import { auth, db } from '../config/firebase.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log("Authenticating with token:", token.substring(0, 10) + "...");
    
    let decodedToken;
    
    // Try JWT first, then Firebase
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      decodedToken = jwt.verify(token, secret);
      console.log("JWT verification successful");
    } catch (jwtError) {
      console.log("JWT verification failed, trying Firebase:", jwtError.message);
      
      try {
        decodedToken = await auth.verifyIdToken(token);
        console.log("Firebase verification successful");
      } catch (firebaseError) {
        console.error("Firebase verification failed:", firebaseError.message);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
    }
    
    // Set user info in request
    req.user = decodedToken;
    
    // Check if user is active
    try {
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.status === "inactive") {
          return res.status(403).json({ 
            error: "Your account has been deactivated. Please contact an administrator.",
            code: "account_deactivated"
          });
        }
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      // Continue if there's an error checking status
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - No user found' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  
  next();
};

export const getAdminToken = async (uid) => {
  try {
    // Create a custom token for admin users
    const customToken = await auth.createCustomToken(uid, { admin: true });
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
};

export const verifyAdminToken = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token using JWT
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret);
    
    // Add the user to the request object
    req.user = decoded;
    
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Add this function to handle JWT verification for admin user creation
export const verifyAdminForUserCreation = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if this is a Firebase token or a custom JWT
    if (token.includes('.') && token.split('.').length === 3) {
      try {
        // Try to verify as a Firebase token first
        const decodedToken = await auth.verifyIdToken(token);
        
        // Check if the user has admin role in custom claims
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          // If not in custom claims, check in Firestore
          const userDoc = await db.collection('users').doc(decodedToken.uid).get();
          
          if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required for user creation' });
          }
        }
        
        req.user = decodedToken;
      } catch (firebaseError) {
        console.log("Firebase token verification failed, trying custom JWT verification");
        
        // If Firebase verification fails, try custom JWT verification
        try {
          const jwt = require('jsonwebtoken');
          const secret = process.env.JWT_SECRET || 'your-secret-key';
          
          const decoded = jwt.verify(token, secret);
          
          // Check if the user has admin role
          if (!decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required for user creation' });
          }
          
          req.user = decoded;
        } catch (jwtError) {
          console.error("JWT verification failed:", jwtError);
          return res.status(401).json({ error: 'Unauthorized - Invalid token for user creation' });
        }
      }
    } else {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format for user creation' });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error during user creation:', error);
    res.status(401).json({ error: 'Unauthorized - Authentication failed during user creation' });
  }
};

// Add this middleware without changing existing ones
export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, secret);
      
      // Set user info from the decoded token
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role
      };
      
      // Check if user has admin role
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }
      
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
};










