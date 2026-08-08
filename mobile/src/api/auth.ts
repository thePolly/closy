import type { Session } from "../storage/session";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(
  loginValue: string,
  ageGroup?: string,
  stylePreference?: string
): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify({
      login: loginValue,
      age_group: ageGroup,
      style_preference: stylePreference,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? `Login failed (${response.status})`);
  }

  return response.json();
}
