import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicines.js";

const router = Router();

router.get("/", authenticateToken, getMedicines);
router.post("/", authenticateToken, createMedicine);
router.put("/:id", authenticateToken, updateMedicine);
router.delete("/:id", authenticateToken, deleteMedicine);

export default router;
