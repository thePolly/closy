import { getSession } from "../storage/session";

// Every wardrobe/chat request needs to identify which account it belongs to.
export async function authHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  return session ? { "X-User-Id": session.id } : {};
}
