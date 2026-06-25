import db from "../util/db.js";

const VALID_SLOTS = ["morning", "noon", "evening", "night"];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

async function getMembership(userId, familyId) {
  const result = await db.query(
    `SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2`,
    [userId, familyId],
  );
  return result.rows[0] ?? null;
}

function isValidDateString(date) {
  if (!DATE_REGEX.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function medicineInDateRange(medicine, date) {
  if (!medicine.is_active) return false;
  if (medicine.start_date && medicine.start_date > date) return false;
  if (medicine.end_date && medicine.end_date < date) return false;
  return true;
}

function buildEmptySlots() {
  return Object.fromEntries(VALID_SLOTS.map((slot) => [slot, []]));
}

export async function getLogs(req, res) {
  const userId = req.user.id;
  const familyId = req.query.family_id;
  const date = req.query.date;

  if (!familyId) {
    return res.status(400).json({ error: "family_id is required" });
  }
  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }
  if (!isValidDateString(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }

  try {
    const membership = await getMembership(userId, Number(familyId));
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    const medicinesResult = await db.query(
      `SELECT m.id, m.name, m.dosage, m.notes, m.slots
       FROM medicines m
       WHERE m.family_id = $1
         AND m.assigned_to = $2
         AND m.is_active = true
         AND (m.start_date IS NULL OR m.start_date <= $3::date)
         AND (m.end_date IS NULL OR m.end_date >= $3::date)
       ORDER BY m.name`,
      [familyId, userId, date],
    );

    const logsResult = await db.query(
      `SELECT dl.medicine_id, dl.slot, dl.taken, dl.taken_at
       FROM daily_logs dl
       INNER JOIN medicines m ON m.id = dl.medicine_id
       WHERE dl.user_id = $1
         AND dl.log_date = $2::date
         AND m.family_id = $3`,
      [userId, date, familyId],
    );

    const logMap = new Map();
    for (const log of logsResult.rows) {
      logMap.set(`${log.medicine_id}:${log.slot}`, log);
    }

    const slots = buildEmptySlots();
    let total = 0;
    let taken = 0;

    for (const medicine of medicinesResult.rows) {
      for (const slot of medicine.slots) {
        if (!VALID_SLOTS.includes(slot)) continue;

        const log = logMap.get(`${medicine.id}:${slot}`);
        const isTaken = log?.taken ?? false;

        slots[slot].push({
          medicine_id: medicine.id,
          name: medicine.name,
          dosage: medicine.dosage,
          notes: medicine.notes,
          taken: isTaken,
          taken_at: log?.taken_at ?? null,
        });

        total += 1;
        if (isTaken) taken += 1;
      }
    }

    const pending = total - taken;
    const percent = total > 0 ? Math.round((taken / total) * 100) : 100;

    return res.json({
      date,
      metrics: { total, taken, pending, percent },
      slots,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}

export async function upsertLog(req, res) {
  const userId = req.user.id;
  const { family_id: familyId, medicine_id: medicineId, slot, taken, date } =
    req.body;

  if (!familyId) {
    return res.status(400).json({ error: "family_id is required" });
  }
  if (!medicineId) {
    return res.status(400).json({ error: "medicine_id is required" });
  }
  if (!slot || !VALID_SLOTS.includes(slot)) {
    return res.status(400).json({
      error: `slot must be one of: ${VALID_SLOTS.join(", ")}`,
    });
  }
  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }
  if (!isValidDateString(date)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  }
  if (typeof taken !== "boolean") {
    return res.status(400).json({ error: "taken must be a boolean" });
  }

  try {
    const membership = await getMembership(userId, Number(familyId));
    if (!membership) {
      return res
        .status(403)
        .json({ error: "You are not a member of this family" });
    }

    const medicineResult = await db.query(
      `SELECT * FROM medicines WHERE id = $1`,
      [medicineId],
    );
    const medicine = medicineResult.rows[0];
    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    if (Number(medicine.family_id) !== Number(familyId)) {
      return res.status(403).json({ error: "Medicine does not belong to this family" });
    }

    if (Number(medicine.assigned_to) !== Number(userId)) {
      return res.status(403).json({
        error: "You can only log medicines assigned to you",
      });
    }

    if (!medicineInDateRange(medicine, date)) {
      return res.status(400).json({
        error: "Medicine is not active for the selected date",
      });
    }

    if (!medicine.slots.includes(slot)) {
      return res.status(400).json({
        error: "This medicine is not scheduled for this time slot",
      });
    }

    const takenAt = taken ? new Date() : null;

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const existingLogResult = await client.query(
        `SELECT taken FROM daily_logs
         WHERE medicine_id = $1 AND log_date = $2::date AND slot = $3`,
        [medicineId, date, slot],
      );
      const wasTaken = existingLogResult.rows[0]?.taken ?? false;

      const result = await client.query(
        `INSERT INTO daily_logs (medicine_id, user_id, log_date, slot, taken, taken_at)
         VALUES ($1, $2, $3::date, $4, $5, $6)
         ON CONFLICT (medicine_id, log_date, slot)
         DO UPDATE SET
           taken = EXCLUDED.taken,
           taken_at = CASE WHEN EXCLUDED.taken THEN NOW() ELSE NULL END,
           user_id = EXCLUDED.user_id
         RETURNING id, medicine_id, user_id, log_date, slot, taken, taken_at`,
        [medicineId, userId, date, slot, taken, takenAt],
      );

      if (
        medicine.form_type &&
        medicine.dose_amount &&
        Number(medicine.dose_amount) > 0
      ) {
        let delta = 0;
        if (!wasTaken && taken) {
          delta = -Number(medicine.dose_amount);
        } else if (wasTaken && !taken) {
          delta = Number(medicine.dose_amount);
        }

        if (delta !== 0) {
          await client.query(
            `UPDATE medicines
             SET remaining_amount = GREATEST(0, COALESCE(remaining_amount, 0) + $1),
                 updated_at = NOW()
             WHERE id = $2`,
            [delta, medicineId],
          );
        }
      }

      await client.query("COMMIT");
      return res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Database error" });
  }
}
