import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getFamilies,
  getFamilyById,
  createFamily,
  inviteMember,
} from "../controllers/families.js";

const router = Router();

router.get("/", authenticateToken, getFamilies);
router.get("/:id", authenticateToken, getFamilyById);
router.post("/", authenticateToken, createFamily);
router.post("/:id/invite", authenticateToken, inviteMember);

export default router;
