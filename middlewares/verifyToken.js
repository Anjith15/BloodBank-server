const jwt = require('jsonwebtoken');

// JWT verification middleware
const verifyToken = (req, res, next) => {
  try {
    // Get the token from headers
    const token = req.headers.authorization?.split(' ')[1];
    
    // If no token is provided
    if (!token) {
      return res.status(401).send({
        message: 'Authentication required. No token provided.',
        error: true
      });
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'abcdef', (err, decodedToken) => {
      if (err) {
        return res.status(401).send({
          message: 'Invalid or expired token',
          error: true
        });
      }
      
      // Add user info to request object
      req.userId = decodedToken.userId;
      req.email = decodedToken.email;
      req.userRole = decodedToken.role || 'user';
      
      // Continue to the next middleware or route handler
      next();
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Authentication error',
      error: true
    });
  }
};

module.exports = verifyToken;