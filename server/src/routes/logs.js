import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getLogs, upsertLog } from "../controllers/logs.js";

const router = Router();

router.get("/", authenticateToken, getLogs);
router.post("/", authenticateToken, upsertLog);

export default router;
