import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const {
    gradeBand, gradeLevel,
    theme = "Anansi folklore",
    character = "a clever young Jamaican child",
    setting = "rural Jamaica",
    creoleLevel = "authentic",
  } = await req.json();

  if (!gradeBand || !gradeLevel) {
    return NextResponse.json({ error: "gradeBand and gradeLevel are required." }, { status: 400 });
  }

  try {
    const userMessage = `
Generate an original WORDJAM story with these parameters:

GRADE BAND    : ${gradeBand}
GRADE LEVEL   : ${gradeLevel}
THEME         : ${theme}
MAIN CHARACTER: ${character}
SETTING       : ${setting}
CREOLE LEVEL  : ${creoleLevel}

The story should have 6–10 paragraphs appropriate for the grade band.
Include 4–8 vocabulary items and 3 comprehension questions.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.storyGenerator(gradeBand, gradeLevel),
      userMessage,
      2500
    );

    return NextResponse.json({ success: true, story: data, latencyMs });
  } catch (err) {
    console.error("[AI generate-story error]", err);
    return NextResponse.json({ error: "Story generation unavailable." }, { status: 500 });
  }
}
