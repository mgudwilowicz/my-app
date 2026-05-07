import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticateToken, logout);

export default router;
