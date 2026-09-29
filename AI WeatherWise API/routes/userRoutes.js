const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All user profile endpoints require authentication

router.route('/me')
  .get(getUserProfile)
  .put(updateUserProfile);

module.exports = router;
