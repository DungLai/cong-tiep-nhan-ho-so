import { GoogleGenAI } from "@google/genai";
import { CHAT_MODEL, systemInstruction } from "@/lib/chatbot";

interface ChatTurn {
  from: "bot" | "user";
  text: string;
}

const MAX_TURNS = 20;
const MAX_TEXT_LENGTH = 1000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "Thiếu GEMINI_API_KEY" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const messages: ChatTurn[] = Array.isArray(body?.messages) ? body.messages : [];

  // Gemini yêu cầu hội thoại bắt đầu bằng lượt của người dùng, nên bỏ lời chào mở đầu của bot.
  const turns = messages
    .filter((m) => (m.from === "user" || m.from === "bot") && typeof m.text === "string" && m.text.trim())
    .slice(-MAX_TURNS);
  while (turns.length && turns[0].from !== "user") turns.shift();

  if (!turns.length || turns[turns.length - 1].from !== "user") {
    return Response.json({ error: "Thiếu câu hỏi" }, { status: 400 });
  }

  const contents = turns.map((m) => ({
    role: m.from === "user" ? "user" : "model",
    parts: [{ text: m.text.slice(0, MAX_TEXT_LENGTH) }],
  }));

  try {
    const result = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents,
      config: { systemInstruction, temperature: 0.2 },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          }
        } catch (err) {
          console.error("Gemini stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Gemini error:", err);
    return Response.json({ error: "Không gọi được Gemini" }, { status: 502 });
  }
}
