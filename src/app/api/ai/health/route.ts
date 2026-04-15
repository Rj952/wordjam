import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/ai-client";

export async function GET() {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: "Reply with just the word: OK" }],
    });
    const ok = response.content[0]?.type === "text" && response.content[0].text.includes("OK");
    return NextResponse.json({
      status: ok ? "healthy" : "degraded",
      model: MODEL,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "unavailable", error: message }, { status: 503 });
  }
}
