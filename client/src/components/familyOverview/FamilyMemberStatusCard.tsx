import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import type { FamilyMemberOverview } from "@appTypes/FamilyOverview";
import {
  getAvatarColor,
  getDisplayName,
  getMemberInitials,
  getMemberStatusColor,
  getMemberStatusLabel,
  getProgressColor,
} from "../../utils/familyOverview";
import MemberSlotStatusPills from "./MemberSlotStatusPills";

type FamilyMemberStatusCardProps = {
  member: FamilyMemberOverview;
  index: number;
  isCurrentUser: boolean;
};

export default function FamilyMemberStatusCard({
  member,
  index,
  isCurrentUser,
}: FamilyMemberStatusCardProps) {
  const avatarColor = getAvatarColor(index);
  const displayName = getDisplayName(member);
  const progressColor = getProgressColor(member.metrics);
  const statusColor = getMemberStatusColor(member.metrics);
  const medicineLabel =
    member.medicineCount === 1 ? "medicine" : "medicines";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.625,
        p: 1.625,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        mb: 1,
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          fontSize: 14,
          fontWeight: 700,
          bgcolor: avatarColor.bgcolor,
          color: avatarColor.color,
          flexShrink: 0,
        }}
      >
        {getMemberInitials(member)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "text.primary", fontSize: 13 }}
        >
          {displayName}
          {isCurrentUser && (
            <Typography
              component="span"
              sx={{
                ml: 0.75,
                fontSize: 11,
                color: "primary.main",
                fontWeight: 600,
              }}
            >
              (you)
            </Typography>
          )}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", fontWeight: 500, display: "block", mt: 0.25 }}
        >
          {member.role === "admin" ? "Admin" : "Member"} · {member.medicineCount} 
          {medicineLabel} assigned
        </Typography>
        <MemberSlotStatusPills slots={member.slots} />
      </Box>

      <Box
        sx={{
          minWidth: 140,
          display: "flex",
          flexDirection: "column",
          gap: 0.625,
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={member.metrics.percent}
          color={progressColor}
          sx={{
            width: 120,
            height: 7,
            borderRadius: 1,
            bgcolor: "action.hover",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color:
              progressColor === "success"
                ? "success.dark"
                : progressColor === "error"
                  ? "error.dark"
                  : "warning.dark",
          }}
        >
          {member.metrics.taken} / {member.metrics.total}
        </Typography>
        <Chip
          size="small"
          label={getMemberStatusLabel(member.metrics)}
          color={statusColor}
          sx={{
            fontWeight: 600,
            fontSize: 11,
            height: 24,
          }}
        />
      </Box>
    </Box>
  );
}
