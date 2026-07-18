const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(item) }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini image API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
  };
  const base64 = data.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData?.data
  )?.inlineData?.data;

  if (!base64) {
    throw new Error("Gemini API returned no image");
  }

  return Buffer.from(base64, "base64");
}
