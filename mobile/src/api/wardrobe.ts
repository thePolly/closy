import { authHeaders } from "./authHeaders";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type AnalysisStatus = "pending" | "completed" | "failed";

export interface ClothingItem {
  id: string;
  image_url: string;
  name: string | null;
  clothing_type: string | null;
  fit: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  pattern: string | null;
  season: string | null;
  style: string | null;
  material: string | null;
  suitable_occasions: string | null;
  distinctive_details: string | null;
  confidence_score: number | null;
  analysis_status: AnalysisStatus;
  created_at: string;
}

// The item's display name: the AI-generated name, falling back to the
// detected clothing type, then to a generic label for un-analyzed items.
export function displayName(item: ClothingItem): string {
  return item.name ?? item.clothing_type ?? "Unnamed item";
}

// <Image> makes its own network request outside of fetch/authHeaders, so it
// needs the ngrok-skip-browser-warning header too when API_URL is a tunnel.
export function imageSource(url: string): { uri: string; headers: Record<string, string> } {
  return { uri: url, headers: { "ngrok-skip-browser-warning": "true" } };
}

export interface MissingSuggestion {
  category: string;
  description: string;
}

export interface OutfitRecommendation {
  description: string;
  items: ClothingItem[];
  missingSuggestions: MissingSuggestion[];
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({ message: response.statusText }));
  return body.message ?? `Request failed (${response.status})`;
}

export async function fetchWardrobe(): Promise<ClothingItem[]> {
  const response = await fetch(`${API_URL}/wardrobe`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(`Failed to load wardrobe (${response.status})`);
  }
  return response.json();
}

export async function fetchClothingItem(id: string): Promise<ClothingItem> {
  const response = await fetch(`${API_URL}/wardrobe/${id}`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function renameItem(id: string, name: string): Promise<ClothingItem> {
  const response = await fetch(`${API_URL}/wardrobe/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function retryAnalysis(id: string): Promise<ClothingItem> {
  const response = await fetch(`${API_URL}/wardrobe/${id}/retry-analysis`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function fetchOutfitRecommendation(
  weather: { temperature: number; condition: string } | null,
  force = false
): Promise<OutfitRecommendation> {
  const response = await fetch(`${API_URL}/wardrobe/recommend-outfit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ weather, force }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function uploadClothingItem(imageUri: string): Promise<ClothingItem> {
  const filename = imageUri.split("/").pop() ?? "photo.jpg";
  const extensionMatch = /\.(\w+)$/.exec(filename);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
  const mimeType = extension === "png" ? "image/png" : "image/jpeg";

  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${API_URL}/wardrobe`, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data", ...(await authHeaders()) },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}
