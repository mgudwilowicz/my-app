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

export async function finalizeInvite(
  token: string,
  accessToken: string,
): Promise<{ familyId: number; familyName: string; role: string }> {
  const response = await fetch(`${API}/families/finalize-invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not join family");
  }
  return data;
}
