const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

router.use(protect);    // Enforce JWT authentication
router.use(adminOnly);  // Enforce Admin authorization

router.get('/users', getAllUsers);

router.route('/users/:id')
  .get(validateObjectId('id'), getUserById)
  .delete(validateObjectId('id'), deleteUser);

router.patch('/users/:id/status', validateObjectId('id'), updateUserStatus);

module.exports = router;
