import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getFamilies,
  getFamilyById,
  getFamilyOverview,
  createFamily,
  inviteMember,
  acceptInvite,
  finalizeInvite,
  getPendingInvitations,
  cancelInvitation,
  removeMember,
} from "../controllers/families.js";

const router = Router();

router.get("/accept-invite/:token", acceptInvite);
router.post("/finalize-invite", authenticateToken, finalizeInvite);

router.get("/", authenticateToken, getFamilies);
router.get("/:id/invitations", authenticateToken, getPendingInvitations);
router.delete(
  "/:id/invitations/:invitationId",
  authenticateToken,
  cancelInvitation,
);
router.delete("/:id/members/:userId", authenticateToken, removeMember);
router.get("/:id/overview", authenticateToken, getFamilyOverview);
router.get("/:id", authenticateToken, getFamilyById);
router.post("/", authenticateToken, createFamily);
router.post("/:id/invite", authenticateToken, inviteMember);

export default router;
