import pool from "./db.js";
import bcrypt from "bcrypt";

async function createDB() {
  const testUsers = [
    {
      email: "martyna@test.com",
      password: "123456",
    },
    {
      email: "ralf@test.com",
      password: "123456",
    },
  ];

  for (const user of testUsers) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  try {
    // await pool.connect();
    await pool.query(
      `
  DROP TABLE IF EXISTS daily_logs CASCADE;
  DROP TABLE IF EXISTS medicines CASCADE;
  DROP TABLE IF EXISTS invitations CASCADE;
  DROP TABLE IF EXISTS refresh_tokens CASCADE;
  DROP TABLE IF EXISTS family_members CASCADE;
  DROP TABLE IF EXISTS families CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE "families" (
  "id" serial PRIMARY KEY,
  "name" TEXT,
  "admin_id" INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE "family_members" (
    "user_id" INTEGER,
    "family_id" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id", "family_id")
  );

  CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    assigned_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    form_type TEXT CHECK (form_type IN ('pill', 'liquid')),
    dose_amount NUMERIC(10,2),
    package_size NUMERIC(10,2),
    remaining_amount NUMERIC(10,2),
    low_stock_threshold NUMERIC(10,2),
    slots TEXT[] NOT NULL,
    notes TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (array_length(slots, 1) >= 1),
    CHECK (slots <@ ARRAY['morning', 'noon', 'evening', 'night']::TEXT[])
  );

  CREATE TABLE daily_logs (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('morning', 'noon', 'evening', 'night')),
    taken BOOLEAN NOT NULL DEFAULT false,
    taken_at TIMESTAMP,
    UNIQUE (medicine_id, log_date, slot)
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  ALTER TABLE "families" ADD CONSTRAINT "user_families" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

  ALTER TABLE "family_members" ADD CONSTRAINT "family_members_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

  ALTER TABLE "family_members" ADD CONSTRAINT "family_members_families" FOREIGN KEY ("family_id") REFERENCES "families" ("id") DEFERRABLE INITIALLY IMMEDIATE;

`,
    );
    for (const user of testUsers) {
      await pool.query(
        `INSERT INTO users (email, password, name)
        VALUES ($1, $2, $3);
        `,
        [user.email, user.password, user.name || null],
      );
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

createDB()
  .then(() => {
    console.log("DB successfully created");
  })
  .catch((err) => {
    console.log("Error creating DB:");
    console.log(err);
  })
  .finally(() => {
    pool.end();
  });
