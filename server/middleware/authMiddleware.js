// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Get the token from the request header
    const token = req.header('x-auth-token');

    // 2. If no token, user is not authorized
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. If there is a token, verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user's data to the request object
    req.user = await User.findById(decoded.user.id).select('-password');

    // 5. If user not found (e.g., deleted), it's an invalid token
    if (!req.user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // 6. User is valid! Call "next()" to proceed to the actual route
    next();
    
  } catch (err) {
    console.error('Middleware error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token is expired' });
    }
    res.status(500).send('Server Error');
  }
};

// 💡 To check for ADMIN role
const isAdmin = (req, res, next) => {
  // This middleware assumes 'auth' has already run and attached 'req.user'
  
  if (req.user && req.user.role === 'ADMIN') {
    // User is logged in, and their role is ADMIN. Proceed.
    next();
  } else {
    // User is either not an admin or something is wrong
    res.status(403).json({ msg: 'Access denied. Admin role required.' });
  }
};

// 💡 To check for INSTRUCTOR role
const isInstructor = (req, res, next) => {
  // This assumes 'auth' has already run and attached 'req.user'
  
  if (req.user && req.user.role === 'INSTRUCTOR') {
    // User is logged in, and their role is INSTRUCTOR. Proceed.
    next();
  } else {
    // User is not an instructor
    res.status(403).json({ msg: 'Access denied. Instructor role required.' });
  }
};

module.exports = {
  auth,
  isAdmin,
  isInstructor,
};