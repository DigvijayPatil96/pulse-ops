const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../services/memoryStore');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_smart_hospital_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.find((u) => u._id === decoded.id || u.id === decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.',
    });
  }
};

module.exports = { protect };
