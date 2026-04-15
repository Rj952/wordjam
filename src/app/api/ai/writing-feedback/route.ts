import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { text, gradeLevel, gradeBand, writingType, promptId } = await req.json();

  if (!text || !gradeLevel || !gradeBand) {
    return NextResponse.json({ error: "text, gradeLevel, and gradeBand are required." }, { status: 400 });
  }
  if (text.length < 20) {
    return NextResponse.json({ error: "Please write at least a sentence before requesting feedback." }, { status: 400 });
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: "Submission exceeds maximum length (5000 characters)." }, { status: 400 });
  }

  try {
    const userMessage = `
WRITING TYPE : ${writingType || "general"}
GRADE LEVEL  : ${gradeLevel}
GRADE BAND   : ${gradeBand}
PROMPT ID    : ${promptId || "free write"}

LEARNER'S SUBMISSION:
"""
${text}
"""

Please provide comprehensive writing feedback following your response format.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.writingFeedback(gradeLevel, gradeBand),
      userMessage,
      1200
    );

    return NextResponse.json({ success: true, feedback: data, latencyMs });
  } catch (err) {
    console.error("[AI writing-feedback error]", err);
    return NextResponse.json({ error: "AI feedback service temporarily unavailable." }, { status: 500 });
  }
}
