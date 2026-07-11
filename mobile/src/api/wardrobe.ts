const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ClothingItem {
  id: string;
  image_url: string;
  clothing_type: string;
  color: string;
  created_at: string;
}

export async function fetchWardrobe(): Promise<ClothingItem[]> {
  const response = await fetch(`${API_URL}/wardrobe`);
  if (!response.ok) {
    throw new Error(`Failed to load wardrobe (${response.status})`);
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
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? `Upload failed (${response.status})`);
  }

  return response.json();
}
