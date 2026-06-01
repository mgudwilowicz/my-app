export type FamilyMemberRole = "admin" | "member";

export type FamilyMember = {
  id: number;
  email: string;
  created_at?: string;
  role: FamilyMemberRole;
};

export type Family = {
  id: number;
  name: string;
  admin_id: number;
  created_at?: string;
  members?: FamilyMember[];
};
