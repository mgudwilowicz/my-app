import type { FamilyMemberRole } from "@appTypes/Family";
import type { MedicineSlot } from "@appTypes/Medicine";

export type SlotComplianceStatus = "complete" | "missed" | "pending" | "none";

export type MemberOverviewMetrics = {
  total: number;
  taken: number;
  pending: number;
  missed: number;
  percent: number;
};

export type FamilyMemberOverview = {
  id: number;
  name: string | null;
  email: string;
  role: FamilyMemberRole;
  medicineCount: number;
  metrics: MemberOverviewMetrics;
  slots: Record<MedicineSlot, SlotComplianceStatus>;
};

export type FamilyOverviewSummary = {
  memberCount: number;
  allTakenCount: number;
  needAttentionCount: number;
  allTakenNames: string[];
  needAttentionNames: string[];
};

export type FamilyOverviewData = {
  date: string;
  family: { id: number; name: string };
  summary: FamilyOverviewSummary;
  members: FamilyMemberOverview[];
};
