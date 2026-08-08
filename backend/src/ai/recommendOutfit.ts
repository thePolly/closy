const GEMINI_MODEL = "gemini-flash-latest";

export interface WardrobeItemSummary {
  id: string;
  name: string | null;
  clothingType: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  pattern: string | null;
  season: string | null;
  style: string | null;
  material: string | null;
  suitableOccasions: string | null;
  distinctiveDetails: string | null;
}

export interface StylePersona {
  ageGroup: string | null;
  stylePreference: string | null;
}

export interface MissingSuggestion {
  category: string;
  description: string;
}

export interface OutfitRecommendation {
  description: string;
  itemIds: string[];
  missingSuggestions: MissingSuggestion[];
}

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    description: {
      type: "STRING",
      description: "A short, friendly description of the recommended outfit and why it suits today",
    },
    itemIds: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "IDs of the selected wardrobe items, taken only from the provided list",
    },
    missingSuggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          description: { type: "STRING" },
        },
        required: ["category", "description"],
      },
      description:
        "For any essential category (e.g. shoes) with no suitable item in the wardrobe, a short description of what would work instead",
    },
  },
  required: ["description", "itemIds", "missingSuggestions"],
};

function buildPrompt(
  items: WardrobeItemSummary[],
  weather: { temperature: number; condition: string } | null,
  dayType: "Workday" | "Weekend",
  persona: StylePersona
): string {
  const wardrobeList = items
    .map((item) => {
      const attrs = [
        item.clothingType,
        item.primaryColor,
        item.secondaryColor,
        item.pattern,
        item.season,
        item.style,
        item.material,
        item.suitableOccasions,
        item.distinctiveDetails,
      ]
        .filter(Boolean)
        .join(", ");
      return `- id: ${item.id} | ${item.name ?? "Unnamed item"} (${attrs})`;
    })
    .join("\n");

  const weatherLine = weather
    ? `Weather: ${weather.temperature}°, ${weather.condition}.`
    : "Weather: unknown.";

  const personaLine = [
    persona.ageGroup ? `Age group: ${persona.ageGroup}.` : null,
    persona.stylePreference ? `Preferred style: ${persona.stylePreference}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return `You are an experienced, detail-oriented personal stylist — not a random outfit generator. Recommend a complete outfit for today from the wardrobe listed below, reasoning the way a professional stylist actually would: weigh color harmony, silhouette, and occasion together, not just whether categories are technically covered.

${weatherLine}
Today is a ${dayType}.
${personaLine ? personaLine + "\n" : ""}
Wardrobe (attributes in parentheses). A trailing phrase like "black bow at the waist" or "purple button placket" is a distinctive decorative detail and its color — treat a clashing accent color as a real reason to prefer a different item, the same way you'd weigh a clashing primary color:
${wardrobeList}

Pick a sensible combination (typically a top, a bottom, and shoes, plus outerwear if the weather calls for it) using ONLY item ids from the list above.${personaLine ? " When there's a reasonable option that fits, favor choices that suit the stated age group and style preference." : ""} If the wardrobe has no suitable item at all for an essential category, do not force a mismatched pick — instead add an entry to missingSuggestions describing what would work. Keep the description short and warm, but specific enough to show *why* this combination works today, not just that it's "a nice outfit."`;
}

export async function recommendOutfit(
  items: WardrobeItemSummary[],
  weather: { temperature: number; condition: string } | null,
  dayType: "Workday" | "Weekend",
  persona: StylePersona
): Promise<OutfitRecommendation> {
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
          { role: "user", parts: [{ text: buildPrompt(items, weather, dayType, persona) }] },
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
    throw new Error("Gemini API returned no recommendation");
  }

  const parsed = JSON.parse(rawJson) as Partial<OutfitRecommendation>;

  if (!parsed.description || !Array.isArray(parsed.itemIds)) {
    throw new Error("Gemini API response is missing required fields");
  }

  return {
    description: parsed.description,
    itemIds: parsed.itemIds,
    missingSuggestions: parsed.missingSuggestions ?? [],
  };
}
