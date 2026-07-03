import db from "./db.js";

const migrations = [
  `ALTER TABLE medicines
     ADD COLUMN IF NOT EXISTS form_type TEXT CHECK (form_type IN ('pill', 'liquid'))`,
  `ALTER TABLE medicines
     ADD COLUMN IF NOT EXISTS dose_amount NUMERIC(10,2)`,
  `ALTER TABLE medicines
     ADD COLUMN IF NOT EXISTS package_size NUMERIC(10,2)`,
  `ALTER TABLE medicines
     ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(10,2)`,
  `ALTER TABLE medicines
     ADD COLUMN IF NOT EXISTS low_stock_threshold NUMERIC(10,2)`,
];

async function runMigrations() {
  for (const sql of migrations) {
    await db.query(sql);
  }
  console.log("Database migrations applied successfully.");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
