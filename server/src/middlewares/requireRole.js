import jwt from 'jsonwebtoken';

export const requireRole = (role) => {
  return (req, res, next) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify the token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret);
      
      // Check if the user has the required role
      if (decoded.role !== role) {
        return res.status(403).json({ error: `Forbidden - ${role} access required` });
      }
      
      // Add the user to the request object
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  };
};
