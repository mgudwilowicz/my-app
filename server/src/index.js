import "dotenv/config";
import express from "express";
import db from "./util/db.js";

import { authenticateToken } from "./middleware/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import familyRoutes from "./routes/families.js";
import medicineRoutes from "./routes/medicines.js";
import logRoutes from "./routes/logs.js";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from myApp!");
});

app.use("/auth", authRoutes);
app.use("/families", familyRoutes);
app.use("/medicines", medicineRoutes);
app.use("/logs", logRoutes);

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
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other process first (lsof -i :${port}).`,
    );
  } else {
    console.error("Server failed to start:", err.message);
  }
  process.exit(1);
});
// TODO: Use async await and promises instead of callbacks for cleaner code and better error handling.
