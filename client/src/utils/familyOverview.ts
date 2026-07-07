import type {
  FamilyMemberOverview,
  MemberOverviewMetrics,
} from "@appTypes/FamilyOverview";

export type AvatarColor = {
  bgcolor: string;
  color: string;
};

export const AVATAR_COLORS: AvatarColor[] = [
  { bgcolor: "#ddeeff", color: "#0a3d7a" },
  { bgcolor: "#fef3d6", color: "#7a4500" },
  { bgcolor: "#eeecff", color: "#3d2fa0" },
  { bgcolor: "#e8e8e8", color: "#3a3a3a" },
];

export function getDisplayName(member: Pick<FamilyMemberOverview, "name" | "email">) {
  if (member.name?.trim()) return member.name.trim();
  const local = member.email.split("@")[0];
  return local || member.email;
}

export function getMemberInitials(
  member: Pick<FamilyMemberOverview, "name" | "email">,
) {
  const display = getDisplayName(member);
  const parts = display.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return display.slice(0, 2).toUpperCase();
}

export function getAvatarColor(index: number): AvatarColor {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getProgressColor(
  metrics: MemberOverviewMetrics,
): "success" | "error" | "warning" {
  if (metrics.total === 0 || metrics.taken === metrics.total) return "success";
  if (metrics.missed > 0) return "error";
  return "warning";
}

export function getMemberStatusLabel(metrics: MemberOverviewMetrics): string {
  if (metrics.total === 0 || metrics.taken === metrics.total) return "All done";
  if (metrics.missed > 0) {
    return `${metrics.missed} missed`;
  }
  return `${metrics.pending} pending`;
}

export function getMemberStatusColor(
  metrics: MemberOverviewMetrics,
): "success" | "error" | "warning" {
  if (metrics.total === 0 || metrics.taken === metrics.total) return "success";
  if (metrics.missed > 0) return "error";
  return "warning";
}

export function formatSummaryNames(names: string[]): string {
  if (names.length === 0) return "—";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  return `${names[0]} +${names.length - 1}`;
}
