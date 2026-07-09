import db from "../util/db.js";
import {
  formatDosageLabel,
  validateSupplyFields,
} from "../util/medicineSupply.js";
import { VALID_SLOTS } from "../util/medicineSlots.js";

const SUPPLY_RETURN_FIELDS = `
  id, family_id, assigned_to, name, dosage, form_type, dose_amount,
  remaining_amount, low_stock_threshold, slots, notes,
  start_date, end_date, is_active, created_by, created_at, updated_at
`;

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
  const status = req.query.status ?? "active";

  if (!familyId) {
    return res.status(400).json({ error: "family_id is required" });
  }

  if (!["active", "inactive", "all"].includes(status)) {
    return res.status(400).json({
      error: "status must be one of: active, inactive, all",
    });
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
      SELECT m.id, m.family_id, m.assigned_to, m.name, m.dosage,
             m.form_type, m.dose_amount, m.remaining_amount,
             m.low_stock_threshold, m.slots, m.notes, m.start_date, m.end_date,
             m.is_active, m.created_by, m.created_at, m.updated_at,
             COALESCE(NULLIF(TRIM(u.name), ''), SPLIT_PART(u.email, '@', 1)) AS assigned_to_name
      FROM medicines m
      INNER JOIN family_members fm
        ON fm.user_id = m.assigned_to AND fm.family_id = $1
      INNER JOIN users u ON fm.user_id = u.id
      WHERE 1=1
    `;
    const params = [familyId];

    if (status === "active") {
      query += ` AND m.is_active = true`;
    } else if (status === "inactive") {
      query += ` AND m.is_active = false`;
    }

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
    form_type: formType,
    dose_amount: doseAmount,
    remaining_amount: remainingAmount,
    low_stock_threshold: lowStockThreshold,
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

  const supplyError = validateSupplyFields({
    form_type: formType,
    dose_amount: doseAmount,
    remaining_amount: remainingAmount,
    low_stock_threshold: lowStockThreshold,
  });
  if (supplyError) {
    return res.status(400).json({ error: supplyError });
  }

  const generatedDosage =
    formatDosageLabel(formType, doseAmount) || dosage?.trim() || null;

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
         family_id, assigned_to, name, dosage, form_type, dose_amount,
         remaining_amount, low_stock_threshold, slots, notes,
         start_date, end_date, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING ${SUPPLY_RETURN_FIELDS}`,
      [
        familyId,
        assignedTo,
        name.trim(),
        generatedDosage,
        formType,
        doseAmount,
        remainingAmount,
        lowStockThreshold,
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
    form_type: formType,
    dose_amount: doseAmount,
    remaining_amount: remainingAmount,
    low_stock_threshold: lowStockThreshold,
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
      const newAssignee = Number(assignedTo);
      const currentAssignee = Number(medicine.assigned_to);

      if (newAssignee !== currentAssignee) {
        if (membership.role !== "admin") {
          return res.status(403).json({
            error: "Only family admin can reassign medicines",
          });
        }

        const assigneeMembership = await getMembership(
          newAssignee,
          medicine.family_id,
        );
        if (!assigneeMembership) {
          return res.status(400).json({
            error: "assigned_to must be a member of this family",
          });
        }
      }
    }

    const nextFormType =
      formType !== undefined ? formType : medicine.form_type;
    const nextDoseAmount =
      doseAmount !== undefined ? doseAmount : medicine.dose_amount;
    const nextLowStockThreshold =
      lowStockThreshold !== undefined
        ? lowStockThreshold
        : medicine.low_stock_threshold;
    const nextRemainingAmount =
      remainingAmount !== undefined
        ? remainingAmount
        : medicine.remaining_amount;

    if (nextFormType) {
      const supplyError = validateSupplyFields({
        form_type: nextFormType,
        dose_amount: nextDoseAmount,
        remaining_amount: nextRemainingAmount,
        low_stock_threshold: nextLowStockThreshold,
      });
      if (supplyError) {
        return res.status(400).json({ error: supplyError });
      }
    }

    const generatedDosage =
      nextFormType && nextDoseAmount
        ? formatDosageLabel(nextFormType, nextDoseAmount)
        : dosage !== undefined
          ? dosage?.trim() || null
          : null;

    const resolvedNotes =
      notes !== undefined ? notes?.trim() || null : medicine.notes;
    const resolvedStartDate =
      startDate !== undefined ? startDate : medicine.start_date;
    const resolvedEndDate =
      endDate !== undefined ? endDate || null : medicine.end_date;

    const result = await db.query(
      `UPDATE medicines
       SET assigned_to = COALESCE($1, assigned_to),
           name = COALESCE($2, name),
           dosage = COALESCE($3, dosage),
           form_type = COALESCE($4, form_type),
           dose_amount = COALESCE($5, dose_amount),
           remaining_amount = COALESCE($6, remaining_amount),
           low_stock_threshold = COALESCE($7, low_stock_threshold),
           slots = COALESCE($8, slots),
           notes = $9,
           start_date = $10,
           end_date = $11,
           updated_at = NOW()
       WHERE id = $12
       RETURNING ${SUPPLY_RETURN_FIELDS}`,
      [
        assignedTo ?? null,
        name?.trim() ?? null,
        generatedDosage,
        formType ?? null,
        doseAmount ?? null,
        nextRemainingAmount ?? null,
        nextLowStockThreshold ?? null,
        slots ?? null,
        resolvedNotes,
        resolvedStartDate,
        resolvedEndDate,
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
       RETURNING ${SUPPLY_RETURN_FIELDS}`,
      [medicineId],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}
