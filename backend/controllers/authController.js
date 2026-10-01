const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const memoryStore = require('../services/memoryStore');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_smart_hospital_jwt_key_2026_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// @desc    Register a new staff member
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, specialty } = req.body;

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A staff account with this email address already exists.',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'nurse',
        department: department || 'Emergency',
        specialty: specialty || 'General Medicine',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          specialty: user.specialty,
        },
      });
    } else {
      // Memory Store
      const existing = memoryStore.users.find((u) => u.email === email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A staff account with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `user-${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: role || 'nurse',
        department: department || 'Emergency',
        specialty: specialty || 'General Medicine',
        availabilityStatus: 'available',
        activePatientCount: 0,
      };

      memoryStore.users.push(newUser);
      const token = generateToken(newUser._id);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          specialty: newUser.specialty,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate staff member & issue JWT
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or credentials.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or credentials.',
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          specialty: user.specialty,
          availabilityStatus: user.availabilityStatus,
        },
      });
    } else {
      // Memory Store
      const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or credentials.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or credentials.',
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          specialty: user.specialty,
          availabilityStatus: user.availabilityStatus,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated staff profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id || req.user._id);
      res.json({ success: true, user });
    } else {
      const user = memoryStore.users.find((u) => u._id === req.user._id || u.id === req.user.id);
      res.json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active clinical staff for task routing
// @route   GET /api/auth/staff
const getStaffList = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const staff = await User.find().select('name role department specialty availabilityStatus activePatientCount');
      res.json({ success: true, count: staff.length, staff });
    } else {
      const staff = memoryStore.users.map(({ password, ...rest }) => rest);
      res.json({ success: true, count: staff.length, staff });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getStaffList,
};
