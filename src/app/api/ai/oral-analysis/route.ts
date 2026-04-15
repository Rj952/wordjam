import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { transcript, activityType, gradeBand, gradeLevel, durationSeconds } = await req.json();

  if (!transcript || !activityType || !gradeBand) {
    return NextResponse.json({ error: "transcript, activityType, and gradeBand are required." }, { status: 400 });
  }
  if (transcript.length < 30) {
    return NextResponse.json({ error: "Transcript is too short for meaningful analysis." }, { status: 400 });
  }

  try {
    const userMessage = `
ACTIVITY TYPE     : ${activityType}
GRADE BAND        : ${gradeBand}
GRADE LEVEL       : ${gradeLevel || "unknown"}
RECORDING DURATION: ${durationSeconds ? `${Math.round(durationSeconds / 60)} minutes` : "unknown"}

SPEECH TRANSCRIPT:
"""
${transcript}
"""

Analyse this oral literacy recording.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.oralAnalysis(activityType, gradeBand),
      userMessage,
      900
    );

    return NextResponse.json({ success: true, analysis: data, latencyMs });
  } catch (err) {
    console.error("[AI oral-analysis error]", err);
    return NextResponse.json({ error: "Oral analysis unavailable." }, { status: 500 });
  }
}
