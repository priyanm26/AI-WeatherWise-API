const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const memoryStore = require('../utils/memoryStore');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user;
    const targetRole = normalizedEmail === (process.env.ADMIN_EMAIL || 'admin@weatherwise.com').toLowerCase().trim() ? 'admin' : 'reader';

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: targetRole,
      });
    } else {
      const existingMemUser = await memoryStore.findUserByEmail(normalizedEmail);
      if (existingMemUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      user = await memoryStore.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: targetRole,
      });
    }

    if (user) {
      const userId = user._id || user.id;
      const token = generateToken(userId, user.role);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        data: {
          id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
      isMatch = await user.matchPassword(password);
    } else {
      user = await memoryStore.findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
      isMatch = await user.matchPassword(password);
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact administrator.',
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
