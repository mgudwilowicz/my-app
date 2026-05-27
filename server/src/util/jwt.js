import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

// Generate JWT token
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m", // short-lived token
    },
  );
};

// Generate Refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // long-lived token
    },
  );
};

// Verify JWT token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET);
};
