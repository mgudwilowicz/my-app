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
  DROP TABLE IF EXISTS family_members CASCADE;
  DROP TABLE IF EXISTS families CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  DROP TABLE IF EXISTS refresh_tokens CASCADE;

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id", "family_id")
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
        `INSERT INTO users (email, password)
        VALUES ($1, $2);
        `,
        [user.email, user.password],
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
