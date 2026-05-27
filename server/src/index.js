import "dotenv/config";
import express from "express";
import db from "./util/db.js";

import { authenticateToken } from "./middleware/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";

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

app.use("/auth", authRoutes);

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
