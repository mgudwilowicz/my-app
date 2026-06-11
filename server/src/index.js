import "dotenv/config";
import express from "express";
import db from "./util/db.js";

import { authenticateToken } from "./middleware/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import familyRoutes from "./routes/families.js";
import medicineRoutes from "./routes/medicines.js";

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
app.use("/families", familyRoutes);
app.use("/medicines", medicineRoutes);

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
});
// TODO: Use async await and promises instead of callbacks for cleaner code and better error handling.
