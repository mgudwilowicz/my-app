import db from "../util/db.js";

export async function getFamilies(req, res) {
  const userId = req.user.id;
  try {
    const query = `
    SELECT * FROM families
    INNER JOIN family_members ON families.id=family_members.family_id
    WHERE family_members.user_id=$1;
    `;
    const families = await db.query(query, [userId]);
    return res.json(families.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "server error" });
  }
}

export async function getFamilyById(req, res) {
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
    return res.json({
      ...family,
      members: membersResult.rows,
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function createFamily(req, res) {
  const { name } = req.body;
  console.log("🚀 ~ name:", name);
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ error: "Family name is required" });
    }

    const familyQuery = `
    INSERT INTO families (name, admin_id)
    VALUES ($1, $2)
    RETURNING id, name, admin_id
  `;
    const result = await db.query(familyQuery, [name, userId]);

    const family = result.rows[0];
    const familyId = family.id;

    // Add the requesting user to family_members table
    const memberQuery = `
      INSERT INTO family_members (user_id, family_id)
      VALUES ($1, $2)
    `;
    await db.query(memberQuery, [userId, familyId]);
    return res.status(201).json(family);
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function inviteMember(req, res) {
  const { id: familyId } = req.params;
  const { email } = req.body;
  const userId = req.user.id;
  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Check if family exists and user is admin
    const familiesResult = await db.query(
      `SELECT * FROM families WHERE id = $1`,
      [familyId],
    );
    const family = familiesResult.rows[0];
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }
    if (family.admin_id !== userId) {
      return res.status(403).json({ error: "Only family admin can invite" });
    }
    // Check if invited user exists
    const usersResult = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const invitedUser = usersResult.rows[0];
    if (!invitedUser) {
      return res.status(404).json({ error: "Invited user not found" });
    }
    // Check if user is already a member
    const userExistsResult = await db.query(
      `SELECT * FROM family_members WHERE user_id = $1 AND family_id = $2`,
      [invitedUser.id, familyId],
    );
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ error: "User is already a family member" });
    }

    // Add invited user to family_members table
    const memberQuery = `
                INSERT INTO family_members (user_id, family_id)
                VALUES ($1, $2)
                RETURNING user_id, family_id
              `;
    await db.query(memberQuery, [invitedUser.id, familyId]);

    return res.status(201).json({
      message: "User invited successfully",
      userId: invitedUser.id,
      email: invitedUser.email,
      familyId: familyId,
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
