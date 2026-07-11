export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ClothingSummary {
  clothingType: string;
  color: string;
}

const GEMINI_MODEL = "gemini-flash-latest";

export async function generateStylistReply(
  message: string,
  history: ChatTurn[],
  wardrobe: ClothingSummary[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const wardrobeSummary =
    wardrobe.length > 0
      ? wardrobe.map((item) => `- ${item.color} ${item.clothingType}`).join("\n")
      : "The wardrobe is currently empty.";

  const systemInstruction = `You are Closy, a warm and encouraging personal AI stylist. You help the user decide what to wear using their wardrobe listed below. Prefer items from the wardrobe when recommending an outfit, and briefly explain why you picked it. Keep replies conversational and concise.

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
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error("Gemini API returned no reply");
  }

  return reply;
}
