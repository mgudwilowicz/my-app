import db from "../util/db.js";

const VALID_SLOTS = ["morning", "noon", "evening", "night"];

async function getMembership(userId, familyId) {
  const result = await db.query(
    `SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2`,
    [userId, familyId],
  );
  return result.rows[0] ?? null;
}

function validateSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return "At least one slot is required";
  }

  const invalid = slots.filter((slot) => !VALID_SLOTS.includes(slot));
  if (invalid.length > 0) {
    return `Invalid slots: ${invalid.join(", ")}. Allowed: ${VALID_SLOTS.join(", ")}`;
  }

  if (new Set(slots).size !== slots.length) {
    return "Duplicate slots are not allowed";
  }

  return null;
}

async function getMedicineById(id) {
  const result = await db.query(`SELECT * FROM medicines WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function getMedicines(req, res) {
  const userId = req.user.id;
  const familyId = req.query.family_id;
  let assignedTo = req.query.assigned_to;

  if (!familyId) {
    return res.status(400).json({ error: "family_id is required" });
  }

  try {
    const membership = await getMembership(userId, Number(familyId));
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    if (membership.role === "member") {
      assignedTo = String(userId);
    }

    let query = `
      SELECT m.id, m.family_id, m.assigned_to, m.name, m.dosage, m.slots,
             m.notes, m.start_date, m.end_date, m.is_active, m.created_by,
             m.created_at, m.updated_at, u.name AS assigned_to_name
      FROM medicines m
      INNER JOIN users u ON u.id = m.assigned_to
      WHERE m.family_id = $1 AND m.is_active = true
    `;
    const params = [familyId];

    if (assignedTo) {
      params.push(assignedTo);
      query += ` AND m.assigned_to = $${params.length}`;
    }

    query += ` ORDER BY m.name`;

    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function createMedicine(req, res) {
  const userId = req.user.id;

  const {
    family_id: familyId,
    assigned_to: assignedTo,
    name,
    dosage,
    slots,
    notes,
    start_date: startDate,
    end_date: endDate,
  } = req.body;

  if (!familyId) {
    return res.status(400).json({ error: "family_id is required" });
  }
  if (!assignedTo) {
    return res.status(400).json({ error: "assigned_to is required" });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const slotsError = validateSlots(slots);
  if (slotsError) {
    return res.status(400).json({ error: slotsError });
  }

  try {
    const membership = await getMembership(userId, Number(familyId));
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    if (membership.role === "member" && Number(assignedTo) !== Number(userId)) {
      return res.status(403).json({
        error: "Members can only create medicines assigned to themselves",
      });
    }

    const assigneeMembership = await getMembership(
      Number(assignedTo),
      Number(familyId),
    );
    if (!assigneeMembership) {
      return res.status(400).json({
        error: "assigned_to must be a member of this family",
      });
    }

    const result = await db.query(
      `INSERT INTO medicines (
         family_id, assigned_to, name, dosage, slots, notes,
         start_date, end_date, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, family_id, assigned_to, name, dosage, slots, notes,
                 start_date, end_date, is_active, created_by, created_at, updated_at`,
      [
        familyId,
        assignedTo,
        name.trim(),
        dosage?.trim() || null,
        slots,
        notes?.trim() || null,
        startDate || null,
        endDate || null,
        userId,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function updateMedicine(req, res) {
  const userId = req.user.id;
  const medicineId = req.params.id;
  const {
    assigned_to: assignedTo,
    name,
    dosage,
    slots,
    notes,
    start_date: startDate,
    end_date: endDate,
  } = req.body;

  if (slots !== undefined) {
    const slotsError = validateSlots(slots);
    if (slotsError) {
      return res.status(400).json({ error: slotsError });
    }
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ error: "name cannot be empty" });
  }

  try {
    const medicine = await getMedicineById(medicineId);
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const membership = await getMembership(userId, medicine.family_id);
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    if (
      membership.role === "member" &&
      Number(medicine.assigned_to) !== Number(userId)
    ) {
      return res.status(403).json({
        error: "Members can only edit their own medicines",
      });
    }

    if (assignedTo !== undefined) {
      if (membership.role !== "admin") {
        return res.status(403).json({
          error: "Only family admin can reassign medicines",
        });
      }

      const assigneeInFamily = await isFamilyMember(
        Number(assignedTo),
        medicine.family_id,
      );
      if (!assigneeInFamily) {
        return res.status(400).json({
          error: "assigned_to must be a member of this family",
        });
      }
    }

    const result = await db.query(
      `UPDATE medicines
       SET assigned_to = COALESCE($1, assigned_to),
           name = COALESCE($2, name),
           dosage = COALESCE($3, dosage),
           slots = COALESCE($4, slots),
           notes = COALESCE($5, notes),
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           updated_at = NOW()
       WHERE id = $8
       RETURNING id, family_id, assigned_to, name, dosage, slots, notes,
                 start_date, end_date, is_active, created_by, created_at, updated_at`,
      [
        assignedTo ?? null,
        name?.trim() ?? null,
        dosage !== undefined ? dosage?.trim() || null : null,
        slots ?? null,
        notes !== undefined ? notes?.trim() || null : null,
        startDate !== undefined ? startDate : null,
        endDate !== undefined ? endDate : null,
        medicineId,
      ],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function deleteMedicine(req, res) {
  const userId = req.user.id;
  const medicineId = req.params.id;

  try {
    const medicine = await getMedicineById(medicineId);
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    if (!medicine.is_active) {
      return res.status(400).json({ error: "Medicine is already inactive" });
    }

    const membership = await getMembership(userId, medicine.family_id);
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    if (
      membership.role === "member" &&
      Number(medicine.assigned_to) !== Number(userId)
    ) {
      return res.status(403).json({
        error: "Members can only deactivate their own medicines",
      });
    }

    const result = await db.query(
      `UPDATE medicines
       SET is_active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, family_id, assigned_to, name, dosage, slots, notes,
                 start_date, end_date, is_active, created_by, created_at, updated_at`,
      [medicineId],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}
