export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ClothingSummary {
  clothingType: string | null;
  primaryColor: string | null;
}

export interface ClothingItemDraft {
  name: string;
  clothingType: string;
  fit: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  pattern: string | null;
  season: string | null;
  style: string | null;
  material: string | null;
  suitableOccasions: string | null;
}

export type StylistReply =
  | { type: "text"; reply: string }
  | { type: "add_clothing_item"; item: ClothingItemDraft };

const GEMINI_MODEL = "gemini-flash-latest";

const ADD_CLOTHING_ITEM_TOOL = {
  functionDeclarations: [
    {
      name: "add_clothing_item",
      description:
        "Add a new clothing item to the user's wardrobe. Only call this when the user states they own, bought, or are adding a real item to their wardrobe — never for hypothetical questions or general conversation.",
      parameters: {
        type: "OBJECT",
        properties: {
          name: {
            type: "STRING",
            description: "Short descriptive name, e.g. 'White Oversized Linen Shirt'",
          },
          clothingType: { type: "STRING", description: "e.g. 'Shirt', 'Jeans', 'Blazer'" },
          fit: { type: "STRING" },
          primaryColor: { type: "STRING" },
          secondaryColor: { type: "STRING" },
          pattern: { type: "STRING" },
          season: { type: "STRING" },
          style: { type: "STRING" },
          material: { type: "STRING" },
          suitableOccasions: { type: "STRING" },
        },
        required: ["name", "clothingType"],
      },
    },
  ],
};

export async function generateStylistReply(
  message: string,
  history: ChatTurn[],
  wardrobe: ClothingSummary[]
): Promise<StylistReply> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const analyzed = wardrobe.filter((item) => item.clothingType && item.primaryColor);

  const wardrobeSummary =
    analyzed.length > 0
      ? analyzed.map((item) => `- ${item.primaryColor} ${item.clothingType}`).join("\n")
      : "The wardrobe is currently empty.";

  const systemInstruction = `You are Closy, a warm and encouraging personal AI stylist. You help the user decide what to wear using their wardrobe listed below. Prefer items from the wardrobe when recommending an outfit, and briefly explain why you picked it. Keep replies conversational and concise.

When the user describes owning, buying, or adding a real clothing item (e.g. "I bought a white oversized linen shirt"), call add_clothing_item with whatever attributes you can confidently infer from their message. Leave uncertain fields out rather than guessing — don't ask clarifying questions first, just add the item with what's given.

User's wardrobe:
${wardrobeSummary}`;

  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        tools: [ADD_CLOTHING_ITEM_TOOL],
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: {
      content?: {
        parts?: { text?: string; functionCall?: { name?: string; args?: Record<string, unknown> } }[];
      };
    }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const functionCall = parts.find((part) => part.functionCall)?.functionCall;

  if (functionCall?.name === "add_clothing_item") {
    const args = functionCall.args ?? {};
    const name = args.name;
    const clothingType = args.clothingType;

    if (typeof name !== "string" || typeof clothingType !== "string") {
      throw new Error("Gemini's add_clothing_item call is missing required fields");
    }

    const asStringOrNull = (value: unknown): string | null =>
      typeof value === "string" ? value : null;

    return {
      type: "add_clothing_item",
      item: {
        name,
        clothingType,
        fit: asStringOrNull(args.fit),
        primaryColor: asStringOrNull(args.primaryColor),
        secondaryColor: asStringOrNull(args.secondaryColor),
        pattern: asStringOrNull(args.pattern),
        season: asStringOrNull(args.season),
        style: asStringOrNull(args.style),
        material: asStringOrNull(args.material),
        suitableOccasions: asStringOrNull(args.suitableOccasions),
      },
    };
  }

  const reply = parts.find((part) => part.text)?.text;
  if (!reply) {
    throw new Error("Gemini API returned no reply");
  }

  return { type: "text", reply };
}
