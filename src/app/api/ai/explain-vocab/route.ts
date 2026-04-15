import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { word, gradeBand, context } = await req.json();

  if (!word || !gradeBand) {
    return NextResponse.json({ error: "word and gradeBand are required." }, { status: 400 });
  }

  try {
    const userMessage = `
WORD TO EXPLAIN : "${word}"
GRADE BAND      : ${gradeBand}
CONTEXT SENTENCE: ${context || "None provided — explain generally."}

Provide a rich vocabulary explanation with etymology, cultural notes,
and both Patwa and SJE usage examples.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.vocabExplainer(gradeBand),
      userMessage,
      700
    );

    return NextResponse.json({ success: true, vocabulary: data, latencyMs });
  } catch (err) {
    console.error("[AI explain-vocab error]", err);
    return NextResponse.json({ error: "Vocabulary service unavailable." }, { status: 500 });
  }
}
