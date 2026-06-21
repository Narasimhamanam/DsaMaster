const { admin } = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Verify Firebase token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Try JWT first (our own tokens)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-__v');
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });
      req.user = user;
      return next();
    } catch {
      // Fall through to Firebase token verification
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid }).select('-__v');
    if (!user) return res.status(401).json({ success: false, message: 'User not found. Please complete profile setup.' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Generate our own JWT for persistent sessions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { authenticate, generateToken };
