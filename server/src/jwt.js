const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'default_secret_key';

// Generate JWT token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m', // short-lived token
  });
};

// Verify JWT token
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

module.exports = { generateAccessToken, verifyAccessToken };
