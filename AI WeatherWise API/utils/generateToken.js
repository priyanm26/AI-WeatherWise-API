const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_ai_weatherwise_2026';
  return jwt.sign(
    { id: userId, role: role },
    secret,
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
