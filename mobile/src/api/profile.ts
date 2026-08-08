import { authHeaders } from "./authHeaders";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Profile {
  id: string;
  login: string;
  age_group: string | null;
  style_preference: string | null;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({ message: response.statusText }));
  return body.message ?? `Request failed (${response.status})`;
}

export async function fetchProfile(): Promise<Profile> {
  const response = await fetch(`${API_URL}/users/me`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function updateProfile(update: {
  age_group?: string;
  style_preference?: string;
}): Promise<Profile> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
