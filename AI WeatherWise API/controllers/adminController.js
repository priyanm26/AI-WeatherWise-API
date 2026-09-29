const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../utils/memoryStore');

// @desc    Get all registered users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test') {
      users = await User.find({}).select('-password').sort({ createdAt: -1 });
    } else {
      users = await memoryStore.getAllMemoryUsers();
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      message: 'All registered users retrieved',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.params.id).select('-password');
    } else {
      user = await memoryStore.findUserById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const adminId = req.user._id || req.user.id;
    if (req.params.id.toString() === adminId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      await User.findByIdAndDelete(req.params.id);
    } else {
      const deleted = await memoryStore.deleteMemoryUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully by administrator',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or activate user status (Admin only)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    if (req.body.isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Field 'isActive' (boolean) is required in request body",
      });
    }

    const adminId = req.user._id || req.user.id;
    if (req.params.id.toString() === adminId.toString() && req.body.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot suspend their own active account',
      });
    }

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      user.isActive = Boolean(req.body.isActive);
      await user.save();
      updatedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      };
    } else {
      updatedUser = await memoryStore.updateMemoryUserStatus(req.params.id, req.body.isActive);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${updatedUser.isActive ? 'Active' : 'Suspended'}`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
};
