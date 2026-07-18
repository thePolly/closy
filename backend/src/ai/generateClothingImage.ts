const OPENAI_IMAGE_MODEL = "gpt-image-1-mini";

export interface ClothingImageDescription {
  name: string;
  clothingType: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  pattern: string | null;
  style: string | null;
  material: string | null;
}

function buildPrompt(item: ClothingImageDescription): string {
  const descriptors = [
    item.material,
    item.primaryColor,
    item.secondaryColor ? `and ${item.secondaryColor}` : null,
    item.pattern && item.pattern !== "Solid" ? item.pattern : null,
    item.style,
  ]
    .filter(Boolean)
    .join(" ");

  return `A professional e-commerce product photo of a single ${descriptors} ${item.clothingType} ("${item.name}"), centered, plain white background, studio lighting, no model, no other objects, no text or watermark.`;
}

export async function generateClothingImage(item: ClothingImageDescription): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: buildPrompt(item),
      size: "1024x1024",
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI image API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { data?: { b64_json?: string }[] };
  const base64 = data.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("OpenAI API returned no image");
  }

  return Buffer.from(base64, "base64");
}
