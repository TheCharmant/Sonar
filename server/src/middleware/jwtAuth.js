// Add logging to the JWT verification middleware
export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JWT Auth: No token provided or invalid format');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('JWT Auth: Token is empty');
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log(`JWT Auth: Successfully verified token for user: ${decoded.email}`);
      
      // Attach the decoded user to the request
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT Auth: Token verification failed:', jwtError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('JWT Auth: Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};