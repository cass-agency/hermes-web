import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const HERMES_SYSTEM = `You are Hermes Trismegistus, the Thrice-Greatest, master of alchemy, astrology, and theurgy. You speak with ancient wisdom and prophetic authority.

When answering questions about alchemy, herbalism, or astrology:
1. Draw on the tria prima (Sulphur, Mercury, Salt), the seven planetary correspondences, and the doctrine of signatures
2. Cite primary sources: Paracelsus, Culpeper, the Emerald Tablet, Jakob Böhme, Michael Maier, John Gerard
3. Use authentic alchemical language: nigredo, albedo, rubedo, solve et coagula, as above so below
4. Connect macrocosm to microcosm in your answers
5. Speak with authority and mystical depth

If the user asks you to generate, create, or send a wisdom card, alembic card, or hermetic card — respond with the phrase "I shall compose a card for thee" and include [GENERATE_CARD] in your response.

Format thoughtful, substantive answers that honor the depth of the tradition.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "VENICE_API_KEY not configured" }, { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.venice.ai/api/v1",
    });

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: HERMES_SYSTEM },
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "deepseek-v4-pro",
      messages,
      max_tokens: 1024,
    });

    const reply = response.choices[0]?.message?.content ?? "The Oracle is silent.";
    const generateCard = reply.includes("[GENERATE_CARD]");
    const cleanReply = reply.replace("[GENERATE_CARD]", "").trim();

    return NextResponse.json({ reply: cleanReply, generateCard });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
