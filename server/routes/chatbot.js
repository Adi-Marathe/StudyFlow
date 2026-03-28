const express = require("express");
const axios   = require("axios");

const router = express.Router();

/* ─────────────────────────────────────────────────────────────
   PROVIDER CLIENTS
   One axios instance per provider — headers set once, reused
   across every request.
───────────────────────────────────────────────────────────── */

// ── Groq (OpenAI-compatible REST)
// Used for: General, Problem Solving
// Docs: https://console.groq.com/docs/quickstart
const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
  },
  timeout: 30000,
});

// ── Google Gemini (own REST format — NOT OpenAI-compatible)
// Used for: Coding (gemini-2.5-pro), Learning (gemini-3-flash-preview)
// Docs: https://ai.google.dev/gemini-api/docs/quickstart
//
// FIX: Official quickstart sends the API key as the x-goog-api-key HEADER,
// not as a ?key= query-string parameter.  We create two separate clients
// so each can carry its own key (GEMINI_CODE_API_KEY vs GEMINI_API_KEY).
const makeGeminiClient = (apiKey) =>
  axios.create({
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    headers: {
      "Content-Type":  "application/json",
      "x-goog-api-key": apiKey,            // ← correct header per official docs
    },
    timeout: 60000,                         // 2.5-pro can be slow on first token
  });

const geminiLearningClient = makeGeminiClient(process.env.GEMINI_API_KEY);
const geminiCodingClient   = makeGeminiClient(process.env.GEMINI_CODE_API_KEY);

// ── OpenRouter (OpenAI-compatible REST)
// Used for: Productivity
// Docs: https://openrouter.ai/docs#quick-start
// HTTP-Referer + X-Title are REQUIRED by OpenRouter ToS.
const openRouterClient = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title":      "StudyFlow AI",
  },
  timeout: 60000,
});

/* ─────────────────────────────────────────────────────────────
   MODEL SLUGS  (single source of truth)
───────────────────────────────────────────────────────────── */
const MODELS = {
  general:      { slug: "llama-3.3-70b-versatile",      displayName: "Llama 3.3 70B"             },
  learning:     { slug: "gemini-3-flash-preview",        displayName: "Gemini 3 Flash"            },
  coding:       { slug: "gemini-2.5-flash",                displayName: "Gemini 2.5 Pro"            },
  problem:      { slug: "openai/gpt-oss-120b",           displayName: "GPT-OSS 120B"              },
  productivity: { slug: "minimax/minimax-m2.5:free",     displayName: "MiniMax M2.5"              },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

/** Extract reply from OpenAI-compatible response (Groq + OpenRouter). */
const extractOpenAIReply = (data) => {
  const text = data?.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error("Received an empty response from model.");
  return text.trim();
};

/** Extract reply from Gemini generateContent response. */
const extractGeminiReply = (data) => {
  // Surface safety blocks before accessing content
  const candidate   = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (finishReason === "SAFETY")
    throw new Error("Gemini blocked this response due to safety filters.");
  if (finishReason === "RECITATION")
    throw new Error("Gemini blocked this response due to recitation policy.");

  const text = candidate?.content?.parts?.[0]?.text;
  if (!text?.trim()) throw new Error("Received an empty response from Gemini.");
  return text.trim();
};

/**
 * Convert the frontend's OpenAI-style messages array into Gemini's
 * `contents` format.
 *
 * Gemini rules:
 *  • Role must be "user" or "model"  ("assistant" → "model")
 *  • Turns MUST alternate: user → model → user → …
 *  • Conversation MUST start with a "user" turn
 *  • System instructions go in a top-level `systemInstruction` field
 *
 * Consecutive same-role turns are merged to satisfy the alternation rule.
 */
const toGeminiPayload = (messages, systemPrompt, generationConfig = {}) => {
  const contents = [];

  messages.forEach((msg) => {
    if (msg.role === "system") return;          // handled via systemInstruction
    const role = msg.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];

    if (last && last.role === role) {
      last.parts[0].text += "\n\n" + msg.content;   // merge consecutive same-role
    } else {
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  });

  if (!contents.length || contents[0].role !== "user")
    throw new Error("Conversation must begin with a user message.");

  return {
    ...(systemPrompt && { systemInstruction: { parts: [{ text: systemPrompt }] } }),
    contents,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature:     0.7,
      ...generationConfig,
    },
  };
};

/** Convert any Axios / provider error into a clean user-facing string. */
const parseError = (err) => {
  const status = err.response?.status;
  const detail =
    err.response?.data?.error?.message ||
    err.response?.data?.message        ||
    err.message                        ||
    "Unknown error";

  if (status === 400) return `Bad request: ${detail}`;
  if (status === 401) return "API key is invalid or missing. Check your .env file.";
  if (status === 403) return "Access denied — verify your API key permissions.";
  if (status === 404) return "Model not found. The slug may be wrong or unavailable in your region.";
  if (status === 429) return "Rate limit reached. Please wait a moment and try again.";
  if (status === 503 || status === 529) return "Model is temporarily overloaded. Please try again shortly.";
  return detail;
};

/* ─────────────────────────────────────────────────────────────
   MAIN ROUTE   POST /api/chat
   ─────────────────────────────────────────────────────────────
   Expected body:
     {
       messages: [ { role: "user"|"assistant", content: string }, … ],
       mode:     "general"|"coding"|"learning"|"problem"|"productivity"|null
     }
───────────────────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const { messages, mode } = req.body;

  /* ── Input validation ── */
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      message: "`messages` must be a non-empty array of { role, content } objects.",
    });
  }
  for (const msg of messages) {
    if (!msg.role || typeof msg.content !== "string" || !msg.content.trim()) {
      return res.status(400).json({
        message: "Every message needs a `role` ('user'|'assistant') and non-empty `content`.",
      });
    }
  }

  const resolvedMode = MODELS[mode] ? mode : "general";
  const { slug, displayName } = MODELS[resolvedMode];

  try {
    let reply = "";

    /* ════════════════════════════════════════════════════════
       GENERAL  ──  Groq  ──  llama-3.3-70b-versatile
    ════════════════════════════════════════════════════════ */
    if (resolvedMode === "general") {
      const r = await groqClient.post("/chat/completions", {
        model:       slug,
        messages:    [
          { role: "system", content: "You are a helpful, friendly StudyFlow AI assistant." },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens:  2048,
      });
      reply = extractOpenAIReply(r.data);
    }

    /* ════════════════════════════════════════════════════════
       LEARNING  ──  Google Gemini  ──  gemini-3-flash-preview
    ════════════════════════════════════════════════════════ */
    else if (resolvedMode === "learning") {
      const payload = toGeminiPayload(
        messages,
        "You are a patient, encouraging tutor. Explain concepts with simple language, real-world analogies, and concrete examples. Break complex ideas into digestible steps.",
        { temperature: 0.7, maxOutputTokens: 2048 }
      );
      const r = await geminiLearningClient.post(
        `/models/${slug}:generateContent`,     // x-goog-api-key header carries the key
        payload
      );
      reply = extractGeminiReply(r.data);
    }

    /* ════════════════════════════════════════════════════════
       CODING  ──  Google Gemini  ──  gemini-2.5-pro
    ════════════════════════════════════════════════════════ */
    else if (resolvedMode === "coding") {
      const payload = toGeminiPayload(
        messages,
        "You are an expert software engineer. Write clean, well-commented, production-quality code. Briefly explain your approach before each code block. Always use markdown code fences with the correct language tag.",
        { temperature: 0.3, maxOutputTokens: 8192 }  // lower temp = more deterministic code
      );
      const r = await geminiCodingClient.post(
        `/models/${slug}:generateContent`,
        payload
      );
      reply = extractGeminiReply(r.data);
    }

    /* ════════════════════════════════════════════════════════
       PROBLEM SOLVING  ──  Groq  ──  openai/gpt-oss-120b
       Uses a separate API key (GROQ_PROBLEM_API_KEY) if provided,
       falls back to the main GROQ_API_KEY otherwise.
    ════════════════════════════════════════════════════════ */
    else if (resolvedMode === "problem") {
      const problemKey = process.env.GROQ_PROBLEM_API_KEY || process.env.GROQ_API_KEY;
      const r = await groqClient.post(
        "/chat/completions",
        {
          model:       slug,
          messages:    [
            { role: "system", content: "You are an expert problem-solver and logical thinker. Think step-by-step, show your full reasoning chain, and verify your answer at the end." },
            ...messages,
          ],
          temperature: 0.5,
          max_tokens:  2048,
        },
        { headers: { Authorization: `Bearer ${problemKey}` } }
      );
      reply = extractOpenAIReply(r.data);
    }

    /* ════════════════════════════════════════════════════════
       PRODUCTIVITY  ──  OpenRouter  ──  minimax/minimax-m2.5:free
    ════════════════════════════════════════════════════════ */
    else if (resolvedMode === "productivity") {
      const r = await openRouterClient.post("/chat/completions", {
        model:       slug,
        messages:    [
          { role: "system", content: "You are a productivity expert. Give structured, actionable advice. Use numbered steps and clear headings. Be concise and practical." },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens:  2048,
      });
      reply = extractOpenAIReply(r.data);
    }

    else {
      return res.status(400).json({ message: "Invalid mode selected." });
    }

    return res.json({ reply, modelName: displayName, fallback: false });

  } catch (primaryErr) {
    const errMsg = parseError(primaryErr);
    console.error(
      `[ChatBot] Mode="${resolvedMode}" (${displayName}) failed:`,
      primaryErr.response?.data || primaryErr.message
    );

    /* ── Graceful fallback: use Groq Llama when any specialist model fails ── */
    if (resolvedMode !== "general") {
      console.log("[ChatBot] Falling back to Llama 3.3 70B on Groq...");
      try {
        const fb = await groqClient.post("/chat/completions", {
          model:       MODELS.general.slug,
          messages:    [
            { role: "system", content: "You are a helpful StudyFlow AI assistant." },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens:  2048,
        });
        return res.json({
          reply:     extractOpenAIReply(fb.data),
          modelName: `${MODELS.general.displayName} (fallback)`,
          fallback:  true,
        });
      } catch (fbErr) {
        console.error("[ChatBot] Fallback also failed:", fbErr.message);
        return res.status(500).json({
          message: `Primary model failed (${errMsg}). Fallback also failed (${parseError(fbErr)}).`,
        });
      }
    }

    return res.status(500).json({ message: errMsg });
  }
});

module.exports = router;