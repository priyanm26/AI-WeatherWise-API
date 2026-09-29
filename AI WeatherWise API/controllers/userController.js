const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../utils/memoryStore');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('-password');
    } else {
      user = await memoryStore.findUserById(userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Allow user to update name or email or password
      if (req.body.name) user.name = req.body.name.trim();
      if (req.body.email) {
        const normalizedEmail = req.body.email.toLowerCase().trim();
        if (normalizedEmail !== user.email) {
          const existingEmail = await User.findOne({ email: normalizedEmail });
          if (existingEmail) {
            return res.status(400).json({
              success: false,
              message: 'Email address is already in use',
            });
          }
          user.email = normalizedEmail;
        }
      }
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long',
          });
        }
        user.password = req.body.password;
      }

      // Explicitly prohibit changing role via user endpoint
      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({
          success: false,
          message: 'Changing role is prohibited through profile update',
        });
      }

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } else {
      user = await memoryStore.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      if (req.body.name) user.name = req.body.name.trim();
      if (req.body.email) {
        const normalizedEmail = req.body.email.toLowerCase().trim();
        if (normalizedEmail !== user.email) {
          const existing = await memoryStore.findUserByEmail(normalizedEmail);
          if (existing) {
            return res.status(400).json({
              success: false,
              message: 'Email address is already in use',
            });
          }
          user.email = normalizedEmail;
        }
      }
      return res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: user,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
