import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const {
    storyText,
    gradeBand,
    questionTypes = ["literal", "inferential", "evaluative"],
    storyTitle = "Untitled",
  } = await req.json();

  if (!storyText || !gradeBand) {
    return NextResponse.json({ error: "storyText and gradeBand are required." }, { status: 400 });
  }

  try {
    const userMessage = `
STORY TITLE      : ${storyTitle}
GRADE BAND       : ${gradeBand}
QUESTION TYPES   : ${questionTypes.join(", ")}

STORY TEXT:
"""
${storyText.slice(0, 3000)}
"""

Generate ${questionTypes.length > 2 ? "a full set" : questionTypes.join(" and ")} comprehension question(s). Include 2 questions of each requested type.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.questionGenerator(gradeBand),
      userMessage,
      1000
    );

    return NextResponse.json({ success: true, questions: data, latencyMs });
  } catch (err) {
    console.error("[AI generate-questions error]", err);
    return NextResponse.json({ error: "Question generation unavailable." }, { status: 500 });
  }
}
