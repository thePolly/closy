const GEMINI_MODEL = "gemini-flash-latest";

export interface ClothingAnalysis {
  name: string;
  clothingType: string;
  fit: string;
  primaryColor: string;
  secondaryColor: string | null;
  pattern: string;
  season: string;
  style: string;
  material: string | null;
  suitableOccasions: string | null;
  confidenceScore: number;
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    clothingType: { type: "STRING" },
    fit: {
      type: "STRING",
      enum: ["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized"],
    },
    primaryColor: { type: "STRING" },
    secondaryColor: { type: "STRING" },
    pattern: {
      type: "STRING",
      enum: ["Solid", "Striped", "Plaid", "Polka Dot", "Floral", "Graphic"],
    },
    season: { type: "STRING" },
    style: {
      type: "STRING",
      enum: ["Casual", "Business", "Smart Casual", "Formal", "Evening", "Sport"],
    },
    material: { type: "STRING" },
    suitableOccasions: { type: "STRING" },
    confidenceScore: { type: "NUMBER" },
  },
  required: ["name", "clothingType", "fit", "primaryColor", "pattern", "season", "style", "confidenceScore"],
};

const PROMPT = `You are analyzing a photo of a single clothing item for a wardrobe app. Identify:
- a short descriptive name for the item, e.g. "White T-Shirt" or "Oversized Blue Jeans"
- clothing type (e.g. "T-Shirt", "Jeans", "Blazer")
- fit
- primary color, and a secondary color only if clearly present
- pattern
- season it's best suited for
- style
- material, only if confidently identifiable
- suitable occasions, only if recognizable
- an overall confidence score from 0 to 1 for this detection

Respond with only the clothing item's attributes, no extra commentary.`;

export async function analyzeClothing(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ClothingAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: imageBuffer.toString("base64") } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawJson) {
    throw new Error("Gemini API returned no analysis");
  }

  const parsed = JSON.parse(rawJson) as Partial<ClothingAnalysis>;

  if (
    !parsed.name ||
    !parsed.clothingType ||
    !parsed.fit ||
    !parsed.primaryColor ||
    !parsed.pattern ||
    !parsed.season ||
    !parsed.style ||
    typeof parsed.confidenceScore !== "number"
  ) {
    throw new Error("Gemini API response is missing required attributes");
  }

  return {
    name: parsed.name,
    clothingType: parsed.clothingType,
    fit: parsed.fit,
    primaryColor: parsed.primaryColor,
    secondaryColor: parsed.secondaryColor ?? null,
    pattern: parsed.pattern,
    season: parsed.season,
    style: parsed.style,
    material: parsed.material ?? null,
    suitableOccasions: parsed.suitableOccasions ?? null,
    confidenceScore: parsed.confidenceScore,
  };
}
