const jwt = require("jsonwebtoken");
const { config } = require("./config/config.js");
require("dotenv").config();

// Generate JWT token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m", // short-lived token
    },
  );
};

// Generate Refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // long-lived token
    },
  );
};

// Verify JWT token
const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
};
