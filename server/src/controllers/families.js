import crypto from "crypto";
import db from "../util/db.js";
import { config } from "../config/config.js";

const INVITE_EXPIRY_DAYS = 7;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function getMembership(userId, familyId) {
  const result = await db.query(
    `SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2`,
    [userId, familyId],
  );
  return result.rows[0] ?? null;
}

async function requireFamilyAdmin(userId, familyId) {
  const membership = await getMembership(userId, familyId);
  if (!membership) {
    return { status: 403, error: "You are not a member of this family" };
  }
  if (membership.role !== "admin") {
    return { status: 403, error: "Only family admin can perform this action" };
  }
  return null;
}

async function getInvitationByToken(token) {
  const result = await db.query(
    `SELECT i.id, i.family_id, i.email, i.token, i.expires_at, i.accepted_at, f.name AS family_name
     FROM invitations i
     INNER JOIN families f ON f.id = i.family_id
     WHERE i.token = $1`,
    [token],
  );
  return result.rows[0] ?? null;
}

function invitationError(invitation) {
  if (!invitation) {
    return { status: 404, error: "Invitation not found" };
  }
  if (invitation.accepted_at) {
    return { status: 400, error: "Invitation already accepted" };
  }
  if (new Date(invitation.expires_at) < new Date()) {
    return { status: 400, error: "Invitation has expired" };
  }
  return null;
}

export async function getFamilies(req, res) {
  const userId = req.user.id;
  try {
    const query = `
    SELECT families.id, families.name, families.admin_id, families.created_at, family_members.role
    FROM families
    INNER JOIN family_members ON families.id = family_members.family_id
    WHERE family_members.user_id = $1
    ORDER BY families.name;
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
      SELECT u.id, u.email, u.created_at, fm.role
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
  const name = req.body.name?.trim();
  const userId = req.user.id;

  try {
    if (!name) {
      return res.status(400).json({ error: "Family name is required" });
    }
    if (name.length < 3) {
      return res.status(400).json({ error: "Family name must be at least 3 characters long" });
    }

    const existingMember = await db.query(
      `SELECT family_id FROM family_members WHERE user_id = $1`,
      [userId],
    );
    if (existingMember.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You already belong to a family" });
    }

    const familyQuery = `
    INSERT INTO families (name, admin_id)
    VALUES ($1, $2)
    RETURNING id, name, admin_id
  `;
    const result = await db.query(familyQuery, [name, userId]);

    const family = result.rows[0];
    const familyId = family.id;

    const memberQuery = `
      INSERT INTO family_members (user_id, family_id, role)
      VALUES ($1, $2, 'admin')
    `;
    await db.query(memberQuery, [userId, familyId]);
    return res.status(201).json(family);
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function acceptInvite(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const invitation = await getInvitationByToken(token);
    const inviteError = invitationError(invitation);
    if (inviteError) {
      return res.status(inviteError.status).json({ error: inviteError.error });
    }

    return res.json({
      email: invitation.email,
      familyId: invitation.family_id,
      familyName: invitation.family_name,
      expiresAt: invitation.expires_at,
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function finalizeInvite(req, res) {
  const userId = req.user.id;
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    const invitation = await getInvitationByToken(token);
    const inviteError = invitationError(invitation);
    if (inviteError) {
      return res.status(inviteError.status).json({ error: inviteError.error });
    }

    const userResult = await db.query(
      `SELECT id, email FROM users WHERE id = $1`,
      [userId],
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (normalizeEmail(user.email) !== normalizeEmail(invitation.email)) {
      return res.status(403).json({
        error: "Your account email does not match the invitation",
      });
    }

    const existingMembership = await getMembership(
      userId,
      invitation.family_id,
    );
    if (existingMembership) {
      return res.status(400).json({ error: "You are already a family member" });
    }

    await db.query(
      `INSERT INTO family_members (user_id, family_id, role)
       VALUES ($1, $2, 'member')`,
      [userId, invitation.family_id],
    );

    await db.query(
      `UPDATE invitations SET accepted_at = NOW() WHERE id = $1`,
      [invitation.id],
    );

    return res.status(201).json({
      message: "Joined family successfully",
      familyId: invitation.family_id,
      familyName: invitation.family_name,
      role: "member",
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function getPendingInvitations(req, res) {
  const { id: familyId } = req.params;
  const userId = req.user.id;
  try {
    const familyResult = await db.query(
      `SELECT id FROM families WHERE id = $1`,
      [familyId],
    );
    if (!familyResult.rows[0]) {
      return res.status(404).json({ error: "Family not found" });
    }

    const adminError = await requireFamilyAdmin(userId, familyId);
    if (adminError) {
      return res.status(adminError.status).json({ error: adminError.error });
    }

    const result = await db.query(
      `SELECT id, email, created_at, expires_at
       FROM invitations
       WHERE family_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [familyId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function cancelInvitation(req, res) {
  const { id: familyId, invitationId } = req.params;
  const userId = req.user.id;
  try {
    const familyResult = await db.query(
      `SELECT id FROM families WHERE id = $1`,
      [familyId],
    );
    if (!familyResult.rows[0]) {
      return res.status(404).json({ error: "Family not found" });
    }

    const adminError = await requireFamilyAdmin(userId, familyId);
    if (adminError) {
      return res.status(adminError.status).json({ error: adminError.error });
    }

    const result = await db.query(
      `DELETE FROM invitations
       WHERE id = $1 AND family_id = $2 AND accepted_at IS NULL
       RETURNING id`,
      [invitationId, familyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    return res.json({ message: "Invitation cancelled" });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function removeMember(req, res) {
  const { id: familyId, userId: memberUserId } = req.params;
  const userId = req.user.id;
  try {
    const familyResult = await db.query(
      `SELECT id FROM families WHERE id = $1`,
      [familyId],
    );
    if (!familyResult.rows[0]) {
      return res.status(404).json({ error: "Family not found" });
    }

    const adminError = await requireFamilyAdmin(userId, familyId);
    if (adminError) {
      return res.status(adminError.status).json({ error: adminError.error });
    }

    if (Number(memberUserId) === Number(userId)) {
      return res.status(400).json({ error: "You cannot remove yourself" });
    }

    const targetMembership = await getMembership(memberUserId, familyId);
    if (!targetMembership) {
      return res.status(404).json({ error: "Member not found in this family" });
    }
    if (targetMembership.role === "admin") {
      return res.status(400).json({ error: "Cannot remove the family admin" });
    }

    await db.query(
      `DELETE FROM family_members WHERE user_id = $1 AND family_id = $2`,
      [memberUserId, familyId],
    );

    return res.json({ message: "Member removed" });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function inviteMember(req, res) {
  const { id: familyId } = req.params;
  const userId = req.user.id;
  try {
    const rawEmail = req.body.email;
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    const email = normalizeEmail(rawEmail);
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const familyResult = await db.query(
      `SELECT id, name FROM families WHERE id = $1`,
      [familyId],
    );
    const family = familyResult.rows[0];
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const adminError = await requireFamilyAdmin(userId, familyId);
    if (adminError) {
      return res.status(adminError.status).json({ error: adminError.error });
    }

    const existingMember = await db.query(
      `SELECT 1
       FROM family_members fm
       INNER JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1 AND LOWER(u.email) = $2`,
      [familyId, email],
    );
    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: "User is already a family member" });
    }

    const pendingInvite = await db.query(
      `SELECT id FROM invitations
       WHERE family_id = $1 AND LOWER(email) = $2
         AND accepted_at IS NULL AND expires_at > NOW()`,
      [familyId, email],
    );
    if (pendingInvite.rows.length > 0) {
      return res.status(400).json({ error: "Invitation already pending for this email" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    await db.query(
      `INSERT INTO invitations (family_id, email, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [familyId, email, token, expiresAt],
    );

    const inviteLink = `${config.APP_URL}/accept-invite/${token}`;

    return res.status(201).json({
      message: "Invitation created",
      email,
      familyId: Number(familyId),
      familyName: family.name,
      expiresAt,
      inviteLink,
    });
  } catch (err) {
    console.log("Database error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
