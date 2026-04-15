// ═══════════════════════════════════════════════════════════════
// WORDJAM — Claude API Integration Layer v1.0
// Node.js + Express — All AI-powered endpoints
// Model: claude-sonnet-4-20250514
// ═══════════════════════════════════════════════════════════════
// File structure expected:
//   src/
//     ai/
//       client.js          ← Anthropic client singleton
//       prompts.js         ← System prompt library
//       routes.js          ← All Express routes  (this file)
//       middleware.js      ← Rate-limit, auth, logging helpers
//     index.js             ← app.use('/api/ai', aiRouter)
// ═══════════════════════════════════════════════════════════════

// ── client.js ───────────────────────────────────────────────────
// src/ai/client.js

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // No key passed — handled by environment variable ONLY
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

module.exports = { anthropic, MODEL, MAX_TOKENS };


// ── prompts.js ───────────────────────────────────────────────────
// src/ai/prompts.js

const SYSTEM_PROMPTS = {

  // ─── 1. WRITING FEEDBACK ────────────────────────────────────────
  writingFeedback: (gradeLevel, gradeBand) => `
You are WordJam's AI Writing Coach — a warm, culturally-affirming literacy mentor
for Jamaican learners from Early Childhood through Grade 11.

GRADE CONTEXT
Grade level : ${gradeLevel}
Grade band  : ${gradeBand}

CORE PRINCIPLES — NEVER VIOLATE THESE
• Jamaican Creole (Patwa) is a complete, rule-governed language — NOT broken English.
• Code-switching between Patwa and Standard Jamaican English (SJE) is a sophisticated
  academic skill, NOT an error to be corrected.
• Begin every response with genuine, specific praise before any suggestion.
• Calibrate vocabulary and sentence complexity to the learner's grade level.
• Frame all suggestions as growth moves, not failures.

CULTURAL VOICE
Reference Jamaican contexts naturally: yard life, parish geography, reggae, Anansi
folklore, Blue Mountains, market days, community celebrations. Never reference
Eurocentric cultural defaults.

RESPONSE FORMAT — return ONLY valid JSON, no preamble:
{
  "strengths": [
    "Specific, genuine praise about at least 2 aspects of the writing"
  ],
  "creoleAffirmation": "If Patwa was used: affirm it as a skilled choice. If not present: omit this field.",
  "codeSwitchingNote": "If the learner mixed Patwa and SJE: celebrate it. Omit if not applicable.",
  "improvements": [
    {
      "area": "e.g. Sentence variety",
      "suggestion": "Specific, actionable tip calibrated to grade level",
      "example": "Show a concrete mini-example if helpful"
    }
  ],
  "nextStepChallenge": "One exciting writing challenge to try next time",
  "pointsEarned": <integer 5–30 based on effort and quality>,
  "encouragementClosing": "One short, warm, Jamaican-spirit closing line"
}
`,

  // ─── 2. CREOLE BRIDGE (TRANSLATION SCAFFOLD) ────────────────────
  creoleBridge: (direction, gradeBand) => `
You are WordJam's Creole Bridge — a linguistic scaffold tool that helps Jamaican
learners understand the relationship between Jamaican Patwa and Standard Jamaican
English (SJE).

DIRECTION  : ${direction === "patwa_to_sje" ? "Patwa → Standard Jamaican English" : "Standard Jamaican English → Patwa"}
GRADE BAND : ${gradeBand}

CRITICAL FRAMING
• NEVER say one form is "correct" and the other "incorrect".
• Describe the relationship as a BRIDGE: "In Patwa we say… In formal English we say…"
• Highlight phonological, grammatical, and lexical patterns — make the system visible.
• Honour both registers as legitimate.

RESPONSE FORMAT — return ONLY valid JSON:
{
  "sourceText": "<original input text>",
  "targetText": "<translated text>",
  "linguisticNotes": [
    {
      "patwaFeature": "e.g. 'im' (gender-neutral pronoun)",
      "sjeEquivalent": "e.g. 'he/she/they'",
      "pattern": "Short explanation of the linguistic rule or shift"
    }
  ],
  "vocabularyHighlights": [
    {
      "word": "<Patwa word>",
      "sje": "<SJE equivalent>",
      "etymology": "<brief origin if interesting>",
      "culturalNote": "<optional cultural context>"
    }
  ],
  "proverb": "<optional: include a related Jamaican proverb if naturally relevant>",
  "bridgeMessage": "One sentence celebrating the learner's bilingual skill"
}
`,

  // ─── 3. STORY GENERATOR ─────────────────────────────────────────
  storyGenerator: (gradeBand, gradeLevel) => `
You are WordJam's Story Generator — a master Jamaican storyteller who creates
original, culturally rich literacy texts for learners.

GRADE BAND  : ${gradeBand}
GRADE LEVEL : ${gradeLevel}

STORYTELLING GUIDELINES
• Stories must be deeply Jamaican — rooted in landscape, folklore, history, food,
  music, family life, or community.
• Patwa version should feel authentic — not caricature. Use natural Jamaican speech
  patterns, not exaggerated orthography.
• SJE version is fluent Standard Jamaican English — warm, vivid, literary.
• Lexile complexity must suit the grade band:
    seedling: 200–400  |  sprout: 400–550  |  sapling: 550–750
    branch:   750–950  |  canopy: 950–1200
• Stories must avoid harm: no violence, no stereotypes, no colonial framing of
  Jamaican life as deficient.
• Favour: Anansi tales, Maroon history, Taino heritage, parish life, farming,
  music, sport (cricket, athletics), food, diaspora experience, environmental themes.

RESPONSE FORMAT — return ONLY valid JSON:
{
  "title": { "patwa": "...", "sje": "..." },
  "coverImagePrompt": "Detailed prompt for generating a culturally authentic cover illustration",
  "gradeBand": "${gradeBand}",
  "estimatedLexile": <integer>,
  "estimatedReadMinutes": <integer>,
  "culturalThemes": ["theme1", "theme2"],
  "contentPatwa": [
    { "index": 1, "text": "First paragraph in Patwa", "vocabHighlights": ["word1","word2"] },
    { "index": 2, "text": "Second paragraph in Patwa", "vocabHighlights": [] }
  ],
  "contentSJE": [
    { "index": 1, "text": "First paragraph in SJE" },
    { "index": 2, "text": "Second paragraph in SJE" }
  ],
  "comprehensionQuestions": [
    { "type": "literal",      "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 },
    { "type": "inferential",  "question": "...", "options": ["A","B","C","D"], "correctIndex": 1 },
    { "type": "evaluative",   "question": "...", "options": ["A","B","C","D"], "correctIndex": 2 }
  ],
  "vocabularyItems": [
    {
      "patwaWord": "...",
      "sjeEquivalent": "...",
      "definition": "...",
      "etymology": "...",
      "usageExamplePatwa": "...",
      "usageExampleSJE": "..."
    }
  ],
  "writingPrompt": "A related creative writing prompt for the learner",
  "jamaicaProverb": "A relevant Jamaican proverb with meaning"
}
`,

  // ─── 4. ORAL LITERACY ANALYSIS ──────────────────────────────────
  oralAnalysis: (activityType, gradeBand) => `
You are WordJam's Oral Literacy Analyst — assessing spoken language recordings
from Jamaican learners with warmth, cultural affirmation, and pedagogical precision.

ACTIVITY TYPE : ${activityType}
GRADE BAND    : ${gradeBand}

ASSESSMENT LENS
• Oral Patwa storytelling is a high-value literary tradition — treat it as such.
• Assess: fluency, expression, pacing, audience awareness, vocabulary range,
  narrative structure, and cultural authenticity.
• Do NOT penalise Creole features as "errors" in oral work.
• Calibrate expectations to the grade band.

RESPONSE FORMAT — return ONLY valid JSON:
{
  "overallScore": <integer 0–100>,
  "fluencyScore": <integer 0–100>,
  "expressionScore": <integer 0–100>,
  "vocabularyRichnessScore": <integer 0–100>,
  "structureScore": <integer 0–100>,
  "strengths": ["At least 2 specific, genuine strengths"],
  "creoleOralAffirmation": "Celebrate Patwa features if present — this is cultural and linguistic skill",
  "improvements": [
    { "area": "...", "suggestion": "...", "practiceActivity": "..." }
  ],
  "nextOralChallenge": "One exciting oral activity to try next",
  "pointsEarned": <integer 5–25>,
  "coachClosing": "Warm, encouraging closing in Jamaican spirit"
}
`,

  // ─── 5. ADAPTIVE QUESTION GENERATOR ────────────────────────────
  questionGenerator: (gradeBand) => `
You are WordJam's Comprehension Question Generator — creating rigorous, culturally
relevant questions for Jamaican literacy texts.

GRADE BAND: ${gradeBand}

QUESTION DESIGN PRINCIPLES
• Literal questions test recall of explicit text information.
• Inferential questions require reading between the lines — drawing conclusions
  the text implies but does not state directly.
• Evaluative questions invite the learner to judge, compare, connect to their
  own Jamaica experience, or critique.
• Language must be accessible to the grade band — not above, not condescending.
• Include cultural resonance where authentic.

RESPONSE FORMAT — return ONLY valid JSON:
{
  "literal": [
    {
      "question": "...",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "correctIndex": <0-3>,
      "explanation": "Why this is the correct answer"
    }
  ],
  "inferential": [
    {
      "question": "...",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "correctIndex": <0-3>,
      "explanation": "..."
    }
  ],
  "evaluative": [
    {
      "question": "...",
      "isOpenEnded": true,
      "guidingPoints": ["Point to look for in a strong answer", "..."]
    }
  ]
}
`,

  // ─── 6. VOCABULARY EXPLAINER ────────────────────────────────────
  vocabExplainer: (gradeBand) => `
You are WordJam's Vocabulary Guide — explaining the rich relationship between
Jamaican Patwa words and Standard Jamaican English equivalents.

GRADE BAND: ${gradeBand}

GUIDING PRINCIPLES
• Celebrate etymology: many Patwa words have Akan, Twi, Spanish, French,
  Arawak/Taino, or English origins — this history is treasure, not shame.
• Use age-appropriate, engaging language.
• Connect words to real Jamaican contexts the learner will recognise.

RESPONSE FORMAT — return ONLY valid JSON:
{
  "patwaWord": "...",
  "sjeEquivalent": "...",
  "definition": "Clear, grade-appropriate definition",
  "etymology": "Fascinating origin story of this word",
  "usageExamplePatwa": "Natural sentence using the Patwa form",
  "usageExampleSJE":   "Natural sentence using the SJE form",
  "culturalNote": "Connection to Jamaican culture, history, or daily life",
  "memoryHook": "A fun tip to help remember this word",
  "relatedWords": ["word1", "word2"],
  "didYouKnow": "Optional surprising linguistic fact"
}
`,
};

module.exports = { SYSTEM_PROMPTS };


// ── middleware.js ────────────────────────────────────────────────
// src/ai/middleware.js

const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limit: 30 AI requests per learner per minute
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: "Too many AI requests. Please slow down and try again." },
});

// Verify Supabase JWT and attach user to req
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Authentication required." });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid or expired session." });

  // Fetch full user record with role
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role, full_name")
    .eq("auth_id", user.id)
    .single();

  req.user = dbUser;
  req.authUser = user;
  next();
}

// Log every AI interaction to ai_feedback_log
async function logAiInteraction({ learnerId, interactionType, inputData, outputData, tokensUsed, latencyMs }) {
  await supabase.from("ai_feedback_log").insert({
    learner_id: learnerId,
    interaction_type: interactionType,
    input_data: inputData,
    output_data: outputData,
    model_used: "claude-sonnet-4-20250514",
    tokens_used: tokensUsed,
    latency_ms: latencyMs,
  });
}

module.exports = { aiRateLimiter, requireAuth, logAiInteraction };


// ── routes.js ────────────────────────────────────────────────────
// src/ai/routes.js  (MAIN FILE)

const express  = require("express");
const router   = express.Router();
const { anthropic, MODEL, MAX_TOKENS } = require("./client");
const { SYSTEM_PROMPTS }               = require("./prompts");
const { aiRateLimiter, requireAuth, logAiInteraction } = require("./middleware");

// Apply auth + rate-limiting to all AI routes
router.use(requireAuth);
router.use(aiRateLimiter);

// ─── Helper: call Claude and parse JSON response ─────────────────
async function callClaude(systemPrompt, userMessage, maxTokens = MAX_TOKENS) {
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const latencyMs = Date.now() - start;
  const rawText   = response.content[0]?.text || "{}";

  let parsed;
  try {
    // Strip possible markdown code fences
    const clean = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { raw: rawText };
  }

  return {
    data: parsed,
    tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
    latencyMs,
  };
}

// ════════════════════════════════════════════════════════════════
// ROUTE 1 — WRITING FEEDBACK
// POST /api/ai/writing-feedback
// Body: { text, gradeLevel, gradeBand, writingType, promptId? }
// ════════════════════════════════════════════════════════════════
router.post("/writing-feedback", async (req, res) => {
  const { text, gradeLevel, gradeBand, writingType, promptId } = req.body;

  if (!text || !gradeLevel || !gradeBand) {
    return res.status(400).json({ error: "text, gradeLevel, and gradeBand are required." });
  }
  if (text.length < 20) {
    return res.status(400).json({ error: "Please write at least a sentence before requesting feedback." });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: "Submission exceeds maximum length (5000 characters)." });
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

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.writingFeedback(gradeLevel, gradeBand),
      userMessage,
      1200
    );

    // Log to Supabase
    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "writing_feedback",
      inputData: { gradeLevel, gradeBand, writingType, wordCount: text.split(/\s+/).length },
      outputData: data,
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, feedback: data, latencyMs });

  } catch (err) {
    console.error("[AI writing-feedback error]", err);
    res.status(500).json({ error: "AI feedback service temporarily unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 2 — CREOLE BRIDGE (TRANSLATION SCAFFOLD)
// POST /api/ai/creole-bridge
// Body: { text, direction, gradeBand, purpose? }
// direction: 'patwa_to_sje' | 'sje_to_patwa'
// ════════════════════════════════════════════════════════════════
router.post("/creole-bridge", async (req, res) => {
  const { text, direction, gradeBand, purpose } = req.body;

  if (!text || !direction || !gradeBand) {
    return res.status(400).json({ error: "text, direction, and gradeBand are required." });
  }
  if (!["patwa_to_sje", "sje_to_patwa"].includes(direction)) {
    return res.status(400).json({ error: "direction must be 'patwa_to_sje' or 'sje_to_patwa'." });
  }

  try {
    const userMessage = `
DIRECTION  : ${direction === "patwa_to_sje" ? "Patwa → SJE" : "SJE → Patwa"}
GRADE BAND : ${gradeBand}
PURPOSE    : ${purpose || "general reading support"}

TEXT TO BRIDGE:
"""
${text}
"""

Provide the bridge translation with full linguistic notes.
`;

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.creoleBridge(direction, gradeBand),
      userMessage,
      1000
    );

    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "creole_bridge",
      inputData: { direction, gradeBand, charCount: text.length },
      outputData: data,
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, bridge: data, latencyMs });

  } catch (err) {
    console.error("[AI creole-bridge error]", err);
    res.status(500).json({ error: "Bridge service unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 3 — STORY GENERATOR (CULTURAL)
// POST /api/ai/generate-story
// Body: { gradeBand, gradeLevel, theme?, character?, setting?, creoleLevel? }
// creoleLevel: 'light' | 'authentic' | 'deep'
// ════════════════════════════════════════════════════════════════
router.post("/generate-story", async (req, res) => {
  const {
    gradeBand, gradeLevel,
    theme = "Anansi folklore",
    character = "a clever young Jamaican child",
    setting = "rural Jamaica",
    creoleLevel = "authentic",
  } = req.body;

  if (!gradeBand || !gradeLevel) {
    return res.status(400).json({ error: "gradeBand and gradeLevel are required." });
  }

  // Story generation is more expensive — allow more tokens
  try {
    const userMessage = `
Generate an original WORDJAM story with these parameters:

GRADE BAND    : ${gradeBand}
GRADE LEVEL   : ${gradeLevel}
THEME         : ${theme}
MAIN CHARACTER: ${character}
SETTING       : ${setting}
CREOLE LEVEL  : ${creoleLevel} (light=occasional words | authentic=natural speech | deep=rich Patwa)

The story should have 6–10 paragraphs appropriate for the grade band.
Include 4–8 vocabulary items and 3 comprehension questions.
Ensure the story has a satisfying arc: setup, conflict, resolution.
`;

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.storyGenerator(gradeBand, gradeLevel),
      userMessage,
      2500
    );

    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "story_generation",
      inputData: { gradeBand, gradeLevel, theme, creoleLevel },
      outputData: { title: data.title, gradeBand: data.gradeBand, lexile: data.estimatedLexile },
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, story: data, latencyMs });

  } catch (err) {
    console.error("[AI generate-story error]", err);
    res.status(500).json({ error: "Story generation unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 4 — ORAL LITERACY ANALYSIS
// POST /api/ai/oral-analysis
// Body: { transcript, activityType, gradeBand, gradeLevel, durationSeconds? }
// activityType: 'story_retelling' | 'oral_report' | 'proverb' | 'debate' | 'poem'
// ════════════════════════════════════════════════════════════════
router.post("/oral-analysis", async (req, res) => {
  const { transcript, activityType, gradeBand, gradeLevel, durationSeconds } = req.body;

  if (!transcript || !activityType || !gradeBand) {
    return res.status(400).json({ error: "transcript, activityType, and gradeBand are required." });
  }
  if (transcript.length < 30) {
    return res.status(400).json({ error: "Transcript is too short for meaningful analysis." });
  }

  try {
    const userMessage = `
ACTIVITY TYPE     : ${activityType}
GRADE BAND        : ${gradeBand}
GRADE LEVEL       : ${gradeLevel || "unknown"}
RECORDING DURATION: ${durationSeconds ? `${Math.round(durationSeconds / 60)} minutes` : "unknown"}

SPEECH TRANSCRIPT (auto-generated — may contain transcription errors):
"""
${transcript}
"""

Analyse this oral literacy recording. Note: transcription errors may exist — focus on
content, vocabulary, narrative structure, and expression rather than spelling.
`;

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.oralAnalysis(activityType, gradeBand),
      userMessage,
      900
    );

    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "oral_analysis",
      inputData: { activityType, gradeBand, wordCount: transcript.split(/\s+/).length },
      outputData: data,
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, analysis: data, latencyMs });

  } catch (err) {
    console.error("[AI oral-analysis error]", err);
    res.status(500).json({ error: "Oral analysis unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 5 — ADAPTIVE QUESTION GENERATOR
// POST /api/ai/generate-questions
// Body: { storyText, gradeBand, questionTypes?, storyId? }
// questionTypes: ['literal','inferential','evaluative'] (default: all three)
// ════════════════════════════════════════════════════════════════
router.post("/generate-questions", async (req, res) => {
  const {
    storyText,
    gradeBand,
    questionTypes = ["literal", "inferential", "evaluative"],
    storyTitle = "Untitled",
  } = req.body;

  if (!storyText || !gradeBand) {
    return res.status(400).json({ error: "storyText and gradeBand are required." });
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

Generate ${questionTypes.length > 2 ? "a full set" : questionTypes.join(" and ")} 
comprehension question(s). Include 2 questions of each requested type.
`;

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.questionGenerator(gradeBand),
      userMessage,
      1000
    );

    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "question_generation",
      inputData: { gradeBand, questionTypes, storyTitle },
      outputData: data,
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, questions: data, latencyMs });

  } catch (err) {
    console.error("[AI generate-questions error]", err);
    res.status(500).json({ error: "Question generation unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 6 — VOCABULARY EXPLAINER
// POST /api/ai/explain-vocab
// Body: { word, gradeBand, context? }
// ════════════════════════════════════════════════════════════════
router.post("/explain-vocab", async (req, res) => {
  const { word, gradeBand, context } = req.body;

  if (!word || !gradeBand) {
    return res.status(400).json({ error: "word and gradeBand are required." });
  }

  try {
    const userMessage = `
WORD TO EXPLAIN : "${word}"
GRADE BAND      : ${gradeBand}
CONTEXT SENTENCE: ${context || "None provided — explain generally."}

Provide a rich vocabulary explanation with etymology, cultural notes,
and both Patwa and SJE usage examples.
`;

    const { data, tokensUsed, latencyMs } = await callClaude(
      SYSTEM_PROMPTS.vocabExplainer(gradeBand),
      userMessage,
      700
    );

    await logAiInteraction({
      learnerId: req.user?.id,
      interactionType: "vocab_explainer",
      inputData: { word, gradeBand },
      outputData: data,
      tokensUsed,
      latencyMs,
    });

    res.json({ success: true, vocabulary: data, latencyMs });

  } catch (err) {
    console.error("[AI explain-vocab error]", err);
    res.status(500).json({ error: "Vocabulary service unavailable. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 7 — AI WRITING STUDIO (STREAMING)
// POST /api/ai/writing-studio/stream
// Body: { prompt, gradeBand, gradeLevel, languageMode }
// Returns: Server-Sent Events stream
// ════════════════════════════════════════════════════════════════
router.post("/writing-studio/stream", async (req, res) => {
  const { prompt, gradeBand, gradeLevel, languageMode = "bilingual" } = req.body;

  if (!prompt || !gradeBand) {
    return res.status(400).json({ error: "prompt and gradeBand are required." });
  }

  // Set SSE headers
  res.setHeader("Content-Type",                "text/event-stream");
  res.setHeader("Cache-Control",               "no-cache");
  res.setHeader("Connection",                  "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
  res.flushHeaders();

  try {
    const systemPrompt = `
You are WordJam's AI Writing Studio tutor. Help a ${gradeLevel || gradeBand} learner
develop their writing in response to the given prompt.

LANGUAGE MODE: ${languageMode}
${languageMode === "patwa"    ? "Respond primarily in Jamaican Patwa." : ""}
${languageMode === "sje"      ? "Respond in Standard Jamaican English." : ""}
${languageMode === "bilingual"? "Weave between Patwa and SJE naturally — model beautiful code-switching." : ""}

Your response should:
1. Affirm the learner's creative intent
2. Offer 2–3 sentence starters or structural ideas
3. Suggest vivid Jamaican details they could include
4. End with an encouraging push to begin writing

Be warm, energetic, and genuinely excited about Jamaican stories.
`;

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: `My writing prompt: ${prompt}\n\nHelp me get started!` }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("[AI writing-studio stream error]", err);
    res.write(`data: ${JSON.stringify({ error: "Stream interrupted. Please try again." })}\n\n`);
    res.end();
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 8 — HEALTH CHECK
// GET /api/ai/health
// ════════════════════════════════════════════════════════════════
router.get("/health", async (req, res) => {
  try {
    // Minimal ping to Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 10,
      messages: [{ role: "user", content: "Reply with just the word: OK" }],
    });
    const ok = response.content[0]?.text?.includes("OK");
    res.json({ status: ok ? "healthy" : "degraded", model: MODEL, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "unavailable", error: err.message });
  }
});

module.exports = router;


// ── index.js (app entry — excerpt) ──────────────────────────────
// src/index.js  (excerpt showing how to mount the router)

/*
const express  = require("express");
const cors     = require("cors");
const aiRouter = require("./ai/routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/ai", aiRouter);

app.listen(process.env.PORT || 4000, () => {
  console.log("WORDJAM API running on port", process.env.PORT || 4000);
});
*/


// ── .env.example ────────────────────────────────────────────────
/*
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Server
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Cloudinary (media assets)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
*/


// ── package.json dependencies ────────────────────────────────────
/*
{
  "dependencies": {
    "@anthropic-ai/sdk":  "^0.30.0",
    "@supabase/supabase-js": "^2.45.0",
    "express":            "^4.18.3",
    "express-rate-limit": "^7.4.0",
    "cors":               "^2.8.5",
    "dotenv":             "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "scripts": {
    "dev":   "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
*/

// ════════════════════════════════════════════════════════════════
// API ENDPOINT SUMMARY
// ════════════════════════════════════════════════════════════════
//
//  POST /api/ai/writing-feedback      → Culturally-affirming writing feedback
//  POST /api/ai/creole-bridge         → Patwa → SJE translation scaffold
//  POST /api/ai/generate-story        → Full bilingual story generation
//  POST /api/ai/oral-analysis         → Oral recording transcript analysis
//  POST /api/ai/generate-questions    → Adaptive comprehension questions
//  POST /api/ai/explain-vocab         → Deep vocabulary explanation
//  POST /api/ai/writing-studio/stream → SSE streaming writing coach
//  GET  /api/ai/health                → Claude API health check
//
// All routes: Bearer token auth required | 30 req/min rate limit
// All interactions: logged to ai_feedback_log (Supabase)
// ════════════════════════════════════════════════════════════════
