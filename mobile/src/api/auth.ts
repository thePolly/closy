import type { Session } from "../storage/session";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(loginValue: string): Promise<Session> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: loginValue }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? `Login failed (${response.status})`);
  }

  return response.json();
}
