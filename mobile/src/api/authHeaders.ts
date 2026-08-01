import { getSession } from "../storage/session";

// Every wardrobe/chat request needs to identify which account it belongs to.
// ngrok-skip-browser-warning bypasses the ngrok free-tier interstitial page when
// EXPO_PUBLIC_API_URL points at a *.ngrok-free.dev tunnel; harmless otherwise.
export async function authHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  return {
    "ngrok-skip-browser-warning": "true",
    ...(session ? { "X-User-Id": session.id } : {}),
  };
}
