import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai-client";
import { SYSTEM_PROMPTS } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { text, direction, gradeBand } = await req.json();

  if (!text || !direction || !gradeBand) {
    return NextResponse.json({ error: "text, direction, and gradeBand are required." }, { status: 400 });
  }
  if (!["patwa_to_sje", "sje_to_patwa"].includes(direction)) {
    return NextResponse.json({ error: "direction must be 'patwa_to_sje' or 'sje_to_patwa'." }, { status: 400 });
  }

  try {
    const userMessage = `
DIRECTION  : ${direction === "patwa_to_sje" ? "Patwa → SJE" : "SJE → Patwa"}
GRADE BAND : ${gradeBand}

TEXT TO BRIDGE:
"""
${text}
"""

Provide the bridge translation with full linguistic notes.
`;

    const { data, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.creoleBridge(direction, gradeBand),
      userMessage,
      1000
    );

    return NextResponse.json({ success: true, bridge: data, latencyMs });
  } catch (err) {
    console.error("[AI creole-bridge error]", err);
    return NextResponse.json({ error: "Bridge service unavailable." }, { status: 500 });
  }
}
