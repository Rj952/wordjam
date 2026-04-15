import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export const MODEL = "claude-sonnet-4-20250514";
export const MAX_TOKENS = 1024;

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = MAX_TOKENS
) {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const latencyMs = Date.now() - start;
  const rawText =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";

  let parsed;
  try {
    const clean = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { raw: rawText };
  }

  return {
    data: parsed,
    tokensUsed:
      (response.usage?.input_tokens || 0) +
      (response.usage?.output_tokens || 0),
    latencyMs,
  };
}

export { anthropic };
