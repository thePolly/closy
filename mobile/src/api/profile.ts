import { authHeaders } from "./authHeaders";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Profile {
  id: string;
  login: string;
  age_group: string | null;
  style_preference: string | null;
}

// style_preference is stored as a single comma-separated string (e.g.
// "Classic, Minimalist") since someone is rarely just one style.
export function parseStylePreferences(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
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
  style_preferences?: string[];
}): Promise<Profile> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({
      age_group: update.age_group,
      style_preference: update.style_preferences?.length
        ? update.style_preferences.join(", ")
        : undefined,
    }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
