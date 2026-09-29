const mongoose = require('mongoose');
const { sanitizeInput } = require('../utils/sanitize');

const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }
  next();
};

const validateLocation = (req, res, next) => {
  const { city, country } = req.body;
  if (!city || !city.trim()) {
    return res.status(400).json({ success: false, message: 'City is required' });
  }
  if (!country || !country.trim()) {
    return res.status(400).json({ success: false, message: 'Country is required' });
  }
  next();
};

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id) && !id.startsWith('mem_')) {
      return res.status(400).json({ success: false, message: `Invalid ID format: ${id}` });
    }
    next();
  };
};

module.exports = {
  sanitizeBody,
  validateRegister,
  validateLogin,
  validateLocation,
  validateObjectId,
};
