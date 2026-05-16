export type GroqChatRole = "system" | "user" | "assistant";

export type GroqChatMessage = {
  role: GroqChatRole;
  content: string;
};

export type RoamTripContext = {
  destination: string;
  country?: string;
  emoji?: string;
  categories: Array<{
    name: string;
    items: Array<{ label: string; done: boolean }>;
  }>;
  tasks: Array<{ label: string; done: boolean }>;
} | null;

const GROQ_API_URL = process.env.EXPO_PUBLIC_GROQ_API_URL || "/api/groq";
const GROQ_MODEL = "llama-3.1-8b-instant";

export function buildRoamSystemPrompt(trip: RoamTripContext): string {
  const lines = [
    "You are Mr. Roam, a warm, clever travel assistant inside PackEasy.",
    "Help with trip planning, packing, checklists, travel advice, and itinerary ideas.",
    "Keep replies concise, practical, and friendly. Ask one clarifying question at a time when needed.",
    "Prefer bullet points for packing or step-by-step advice.",
  ];

  if (trip) {
    const packedCount = trip.categories
      .flatMap((category) => category.items)
      .filter((item) => item.done).length;
    const totalCount = trip.categories.flatMap((category) => category.items).length;
    const openTasks = trip.tasks.filter((task) => !task.done).length;

    lines.push(
      `Current trip: ${trip.emoji ? `${trip.emoji} ` : ""}${trip.destination}${trip.country ? `, ${trip.country}` : ""}.`,
      `Packing progress: ${packedCount}/${totalCount} items checked, ${openTasks} open tasks.`,
    );

    for (const category of trip.categories) {
      const packed = category.items.filter((item) => item.done).length;
      lines.push(`- ${category.name}: ${packed}/${category.items.length} items ready.`);
    }
  }

  return lines.join("\n");
}

export async function sendGroqChat(messages: GroqChatMessage[]): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 500,
      messages,
    }),
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Groq request failed with status ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}