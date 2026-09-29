const express = require('express');
const router = express.Router();
const {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const { validateLocation, validateObjectId } = require('../middleware/validationMiddleware');

router.use(protect); // All location CRUD endpoints require authentication

router.route('/')
  .post(validateLocation, createLocation)
  .get(getLocations);

router.route('/:id')
  .get(validateObjectId('id'), getLocationById)
  .put(validateObjectId('id'), updateLocation)
  .delete(validateObjectId('id'), deleteLocation);

module.exports = router;
