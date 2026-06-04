const API = import.meta.env.VITE_PUBLIC_API_HOST;

export type InvitePreview = {
  email: string;
  familyId: number;
  familyName: string;
  expiresAt: string;
};

export async function fetchInvitePreview(
  token: string,
): Promise<InvitePreview> {
  const response = await fetch(`${API}/families/accept-invite/${token}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Invalid invitation");
  }
  return data;
}
