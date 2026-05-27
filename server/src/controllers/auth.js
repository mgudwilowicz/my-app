import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../util/jwt.js";
import { config } from "../config/config.js";
import db from "../util/db.js";

const generateTokensForUser = async (user) => {
  try {
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);

    // Generate Refresh Token -----------------------------
    const refreshToken = generateRefreshToken(user);

    console.log(accessToken, refreshToken);

    // 🔥 Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save hashed refresh token to DB

    await db.query(
      `INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)`,
      [hashedRefreshToken, user.id],
    );
    return { accessToken, refreshToken };
  } catch (dbErr) {
    console.log("Database error saving refresh token:", dbErr);
    throw dbErr;
  }
};

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    console.log("email/password do not exist");
    return res.status(400).json({ error: "Email, password and required!" });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    console.log("invalid email");
    return res.status(400).json({ error: "Invalid email format!" });
  }

  if (password.length < 6) {
    console.log("password too short");
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long!" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("password hashed");

    const query = `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name
    `;

    const result = await db.query(query, [email, hashedPassword, name]);
    const [newUser] = result.rows;
    const { accessToken, refreshToken } = await generateTokensForUser(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax", // "strict" blocks cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send original token to client
    res.json({
      message: "Registered successfully",
      userName: newUser.name,
      userId: newUser.id,
      email: newUser.email,
      accessToken,
    });
  } catch (err) {
    if (err.code === "23505") {
      console.log("User exists");
      return res.status(400).json({ error: "User already exists" });
    }
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

export const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required!" });
  }

  const query = `SELECT * FROM users WHERE email = $1`;

  const result = await db.query(query, [email]);

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    console.log("Invalid credentials");
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const { accessToken, refreshToken } = await generateTokensForUser(user);
  // ------------------------------

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await db.query(
    `INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)`,
    [hashedRefreshToken, user.id],
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "lax", // "strict" blocks cross-origin requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send original token to client
  res.json({
    message: "Login successful",
    userName: user.name,
    userId: user.id,
    email: user.email,
    accessToken,
  });
  // });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    // First verify JWT signature
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    // Get all tokens for this user
    const result = await db.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [decoded.id],
    );

    const tokens = result.rows;

    if (tokens.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    //  Check hash matches
    let validToken = null;

    for (let tokenRow of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRow.token);

      if (isMatch) {
        validToken = tokenRow;
        break;
      }
    }

    if (!validToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const oldHashedRefreshToken = validToken.token;

    const newAccessToken = generateAccessToken(decoded);

    const newRefreshToken = generateRefreshToken(decoded);

    // 🔥 Hash refresh token before storing
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    // Save hashed refresh token to DB
    await db.query(
      `UPDATE refresh_tokens SET token=$1 WHERE user_id=$2 AND token=$3`,
      [newHashedRefreshToken, decoded.id, oldHashedRefreshToken],
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax", // "strict" blocks cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: newAccessToken,
      userName: decoded.name,
      userId: decoded.id,
      email: decoded.email,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  const userId = req.user.id;
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    if (decoded.id !== userId) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const tokens = await db.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [userId],
    );

    let validToken = null;

    for (let tokenRow of tokens.rows) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRow.token);
      if (isMatch) {
        validToken = tokenRow;
        break;
      }
    }

    if (!validToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    await db.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2`,
      [userId, validToken.token],
    );
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Error during logout:", err);
    return res.status(500).json({ error: "Server error" });
  }

  // => check current refreshToken (from cookies)
};
