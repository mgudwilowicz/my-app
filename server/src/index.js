const express = require("express");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("./jwt");
const authenticateToken = require("./auth");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from myApp!");
});

app.post("/register", async (req, res) => {
  console.log("/register called");

  const { email, password } = req.body;
  console.log("🚀 ~  email, password :", email, password);

  if (!email || !password) {
    console.log("email/password do not exist");
    return res.status(400).json({ error: "Email and password required!" });
  }
  if (password.length < 6) {
    console.log("password too short");
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long!" });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    console.log("invalid email");
    return res.status(400).json({ error: "Invalid email format!" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("password hashed");

    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, email
    `;

    db.query(query, [email, hashedPassword], (err) => {
      if (err) {
        if (err.code === "23505") {
          console.log("User exists");
          return res.status(400).json({ error: "User already exists" });
        }
        console.log("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("success");
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.log("server error");
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  console.log("🚀 ~  email, password:", email, password);

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

    // We will do refreshTokens later:
    // -----------------------------
    // const refreshToken = generateRefreshToken(user);

    // 🔥 Hash refresh token before storing
    // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save hashed refresh token to DB
    // try {
    //   await db.query(
    //     `INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)`,
    //     [hashedRefreshToken, user.id],
    //   );
    // } catch (dbErr) {
    //   console.log("Database error saving refresh token:", dbErr);
    //   return res.status(500).json({ error: "Server error" });
    // }
    // ------------------------------

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
// app.post('/token', async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res.status(401).json({ error: 'Refresh token required' });
//   }

//   try {
//     // First verify JWT signature
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     // Get all tokens for this user
//     const result = await db.query(
//       `SELECT * FROM refresh_tokens WHERE user_id = $1`,
//       [decoded.id],
//     );

//     const tokens = result.rows;

//     if (tokens.length === 0) {
//       return res.status(403).json({ error: 'Invalid refresh token' });
//     }

//     //  Check hash matches
//     let validToken = null;

//     for (let tokenRow of tokens) {
//       const isMatch = await bcrypt.compare(refreshToken, tokenRow.token);

//       if (isMatch) {
//         validToken = tokenRow;
//         break;
//       }
//     }

//     if (!validToken) {
//       return res.status(403).json({ error: 'Invalid refresh token' });
//     }

//     const newAccessToken = generateAccessToken(decoded);

//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     return res.status(403).json({ error: 'Invalid or expired token' });
//   }
// });

app.get("/users", authenticateToken, (req, res) => {
  db.query(`SELECT email FROM users`, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
  });
});

app.listen(port, () => {
  console.log(`MyApp backend listening on port ${port}`);
});
