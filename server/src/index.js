const express = require("express");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("./jwt");
const authenticateToken = require("./auth");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { config } = require("./config/config.js");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from myApp!");
});

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    console.log("email/password/name do not exist");
    return res
      .status(400)
      .json({ error: "Email, password, and name required!" });
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

    console.log("🚀 ~ name:", name);
    db.query(query, [email, hashedPassword, name], (err) => {
      if (err) {
        if (err.code === "23505") {
          console.log("User exists");
          return res.status(400).json({ error: "User already exists" });
        }
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("success");
       res.json({
      message: "Register successful",
      userId: user.id,
      email: user.email,
      accessToken,
    });
      // res.status(201).json({ message: "User registered successfully" });
    // });
  } catch (err) {
    console.log("server error");
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required!" });
  }

  const query = `SELECT * FROM users WHERE email = $1`;

  db.query(query, [email], async (err, result) => {
    if (err) {
      console.log("server error");
      return res.status(500).json({ error: "Server error" });
    }

    const user = result.rows[0];
    console.log("🚀 ~ user:", user);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("Invalid credentials");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);

    // Generate Refresh Token -----------------------------
    const refreshToken = generateRefreshToken(user);

    // 🔥 Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save hashed refresh token to DB
    try {
      await db.query(
        `INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)`,
        [hashedRefreshToken, user.id],
      );
    } catch (dbErr) {
      console.log("Database error saving refresh token:", dbErr);
      return res.status(500).json({ error: "Server error" });
    }
    // ------------------------------

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax", // "strict" blocks cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send original token to client
    res.json({
      message: "Login successful",
      userId: user.id,
      email: user.email,
      accessToken,
    });
  });
});

// Refresh token endpoint
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;

  console.log("/refresh with ", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    console.log("/refresh #1");
    // First verify JWT signature
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    // Get all tokens for this user
    const result = await db.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [decoded.id],
    );

    console.log("/refresh #2");
    const tokens = result.rows;

    if (tokens.length === 0) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    console.log("/refresh #3");

    //  Check hash matches
    let validToken = null;

    for (let tokenRow of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRow.token);

      if (isMatch) {
        validToken = tokenRow;
        break;
      }
    }

    console.log("/refresh #4");

    if (!validToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    console.log("/refresh #5");

    const oldHashedRefreshToken = validToken.token;

    const newAccessToken = generateAccessToken(decoded);

    const newRefreshToken = generateRefreshToken(decoded);

    // 🔥 Hash refresh token before storing
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    // Save hashed refresh token to DB
    try {
      await db.query(
        `UPDATE refresh_tokens SET token=$1 WHERE user_id=$2 AND token=$3`,
        [newHashedRefreshToken, decoded.id, oldHashedRefreshToken],
      );
    } catch (dbErr) {
      console.log("Database error saving refresh token:", dbErr);
      return res.status(500).json({ error: "Server error" });
    }
    // ------------------------------

    console.log("/refresh #6");

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax", // "strict" blocks cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken: newAccessToken,
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
});

app.post("/logout", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    if (decoded.id !== userId) {
      return res.status(403).json({ error: "Invalid token" });
    }

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await db.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2`,
      [userId, hashedRefreshToken],
    );
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.log("Error during logout:", err);
    return res.status(500).json({ error: "Server error" });
  }

  // => check current refreshToken (from cookies)
});

app.get("/users", authenticateToken, (req, res) => {
  db.query(`SELECT email FROM users`, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
  });
});

app.get("/families", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
    SELECT * FROM families
    INNER JOIN family_members ON families.id=family_members.family_id
    WHERE family_members.user_id=$1;
    `;
    const result = await db.query(query, [userId]);
    return res.json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error" });
  }
});

app.post("/families", authenticateToken, (req, res) => {
  const { name } = req.body;
  console.log("🚀 ~ name:", name);
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Family name is required" });
  }

  const familyQuery = `
    INSERT INTO families (name, admin_id)
    VALUES ($1, $2)
    RETURNING id, name, admin_id
  `;

  db.query(familyQuery, [name, userId], (err, result) => {
    if (err) {
      console.log("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const family = result.rows[0];
    const familyId = family.id;

    // Add the requesting user to family_members table
    const memberQuery = `
      INSERT INTO family_members (user_id, family_id)
      VALUES ($1, $2)
    `;

    db.query(memberQuery, [userId, familyId], (err) => {
      if (err) {
        console.log("Database error adding user to family_members:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json(family);
    });
  });
});

app.get("/families/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const familyId = req.params.id;

  // Get the specific family and check if user is a member
  const familyQuery = `
    SELECT f.id, f.name, f.admin_id, f.created_at
    FROM families f
    INNER JOIN family_members fm ON f.id = fm.family_id
    WHERE f.id = $1 AND fm.user_id = $2
  `;

  try {
    const familyResult = await db.query(familyQuery, [familyId, userId]);
    const family = familyResult.rows[0];
    if (!family) {
      return res
        .status(404)
        .json({ error: "Family not found or access denied" });
    }

    const membersQuery = `
      SELECT u.id, u.email, u.created_at
      FROM users u
      INNER JOIN family_members fm ON u.id = fm.user_id
      WHERE fm.family_id = $1
      ORDER BY u.email
    `;

    const membersResult = await db.query(membersQuery, [familyId]);
    res.json({
      ...family,
      members: membersResult.rows,
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }

  // db.query(familyQuery, [familyId, userId], (err, familyResult) => {
  //   if (err) {
  //     console.log("Database error:", err);
  //     return res.status(500).json({ error: "Database error" });
  //   }

  //   const family = familyResult.rows[0];

  //   if (!family) {
  //     return res
  //       .status(404)
  //       .json({ error: "Family not found or access denied" });
  //   }

  //   // Get all members of the family
  //   const membersQuery = `
  //     SELECT u.id, u.email, u.created_at
  //     FROM users u
  //     INNER JOIN family_members fm ON u.id = fm.user_id
  //     WHERE fm.family_id = $1
  //     ORDER BY u.email
  //   `;

  //   db.query(membersQuery, [familyId], (err, membersResult) => {
  //     if (err) {
  //       console.log("Database error getting members:", err);
  //       return res.status(500).json({ error: "Database error" });
  //     }

  //     res.json({
  //       ...family,
  //       members: membersResult.rows,
  //     });
  //   });
  // });
});

app.post("/families/:familyId/invite", authenticateToken, (req, res) => {
  const { familyId } = req.params;
  const { email } = req.body;
  const userId = req.user.id;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Check if family exists and user is admin
  db.query(
    `SELECT * FROM families WHERE id = $1`,
    [familyId],
    (err, result) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      const family = result.rows[0];
      if (!family) {
        return res.status(404).json({ error: "Family not found" });
      }
      if (family.admin_id !== userId) {
        return res.status(403).json({ error: "Only family admin can invite" });
      }

      // Check if invited user exists
      db.query(
        `SELECT * FROM users WHERE email = $1`,
        [email],
        (err, result) => {
          if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }
          const invitedUser = result.rows[0];
          if (!invitedUser) {
            return res.status(404).json({ error: "Invited user not found" });
          }

          // Check if user is already a member
          db.query(
            `SELECT * FROM family_members WHERE user_id = $1 AND family_id = $2`,
            [invitedUser.id, familyId],
            (err, result) => {
              if (err) {
                console.log("Database error:", err);
                return res.status(500).json({ error: "Database error" });
              }
              if (result.rows.length > 0) {
                return res
                  .status(400)
                  .json({ error: "User is already a family member" });
              }

              // Add invited user to family_members table
              const memberQuery = `
                INSERT INTO family_members (user_id, family_id)
                VALUES ($1, $2)
                RETURNING user_id, family_id
              `;
              db.query(memberQuery, [invitedUser.id, familyId], (err) => {
                if (err) {
                  console.log("Database error:", err);
                  return res.status(500).json({ error: "Database error" });
                }
                res.status(201).json({
                  message: "User invited successfully",
                  userId: invitedUser.id,
                  email: invitedUser.email,
                  familyId: familyId,
                });
              });
            },
          );
        },
      );
    },
  );
});

app.listen(port, () => {
  console.log(`MyApp backend listening on port ${port}`);
});
// TODO: Use async await and promises instead of callbacks for cleaner code and better error handling.
