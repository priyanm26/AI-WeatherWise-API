const mongoose = require('mongoose');
const Location = require('../models/Location');
const memoryStore = require('../utils/memoryStore');

// @desc    Create a new favorite location
// @route   POST /api/locations
// @access  Private
const createLocation = async (req, res, next) => {
  try {
    const { city, country, notes } = req.body;
    const userId = req.user._id || req.user.id;

    let location;
    if (mongoose.connection.readyState === 1) {
      location = await Location.create({
        user: userId,
        city: city.trim(),
        country: country.trim(),
        notes: notes ? notes.trim() : '',
      });
    } else {
      location = await memoryStore.createMemoryLocation({
        userId,
        city: city.trim(),
        country: country.trim(),
        notes: notes ? notes.trim() : '',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Favorite location added successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all favorite locations for authenticated user
// @route   GET /api/locations
// @access  Private
const getLocations = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let locations = [];

    if (mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test') {
      locations = await Location.find({ user: userId }).sort({ createdAt: -1 });
    } else {
      locations = await memoryStore.getMemoryLocationsByUser(userId);
    }

    return res.status(200).json({
      success: true,
      count: locations.length,
      message: 'Favorite locations retrieved successfully',
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single favorite location by ID
// @route   GET /api/locations/:id
// @access  Private
const getLocationById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let location;

    if (mongoose.connection.readyState === 1) {
      location = await Location.findById(req.params.id);
    } else {
      location = await memoryStore.getMemoryLocationById(req.params.id);
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    const locationUserId = location.user._id ? location.user._id.toString() : location.user.toString();
    if (locationUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this location resource.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location retrieved successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a favorite location
// @route   PUT /api/locations/:id
// @access  Private
const updateLocation = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let location;

    if (mongoose.connection.readyState === 1) {
      location = await Location.findById(req.params.id);
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found',
        });
      }

      const locationUserId = location.user._id ? location.user._id.toString() : location.user.toString();
      if (locationUserId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this location resource.',
        });
      }

      if (req.body.city) location.city = req.body.city.trim();
      if (req.body.country) location.country = req.body.country.trim();
      if (req.body.notes !== undefined) location.notes = req.body.notes.trim();

      const updatedLocation = await location.save();

      return res.status(200).json({
        success: true,
        message: 'Favorite location updated successfully',
        data: updatedLocation,
      });
    } else {
      const updated = await memoryStore.updateMemoryLocation(req.params.id, userId, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Location not found or access denied',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Favorite location updated successfully',
        data: updated,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a favorite location
// @route   DELETE /api/locations/:id
// @access  Private
const deleteLocation = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const location = await Location.findById(req.params.id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Location not found',
        });
      }

      const locationUserId = location.user._id ? location.user._id.toString() : location.user.toString();
      if (locationUserId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this location resource.',
        });
      }

      await Location.findByIdAndDelete(req.params.id);
    } else {
      const deleted = await memoryStore.deleteMemoryLocation(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Location not found or access denied',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Favorite location deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
