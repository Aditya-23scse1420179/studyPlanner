/**
 * AI Provider utility — generates MCQ questions using:
 *   PRIMARY  : Groq  (llama-3.3-70b) — free, 30 req/min, ultra-fast
 *   FALLBACK : Gemini (gemini-2.0-flash) — free, 15 req/min
 *
 * Flow: tries Groq first → if fails, automatically tries Gemini.
 */

const https = require("https");

// ─── Config ────────────────────────────────────────────────────────────────
const GROQ_MODEL   = "llama-3.3-70b-versatile";   // best free Groq model
const GEMINI_MODEL = "gemini-2.0-flash";           // fallback

const MAX_RETRIES    = 2;
const RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Generic HTTPS POST helper ─────────────────────────────────────────────
const httpsPost = (hostname, path, headers, body) =>
  new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname,
      path,
      method:  "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const msg = parsed?.error?.message || `HTTP ${res.statusCode}`;
            const err = new Error(msg);
            err.status = res.statusCode;
            reject(err);
          }
        } catch {
          const err = new Error(`HTTP ${res.statusCode}: unparseable response`);
          err.status = res.statusCode;
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });

// ─── Groq provider ─────────────────────────────────────────────────────────
const callGroq = async (apiKey, prompt) => {
  const body = await httpsPost(
    "api.groq.com",
    "/openai/v1/chat/completions",
    { Authorization: `Bearer ${apiKey}` },
    {
      model:       GROQ_MODEL,
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens:  4096,
    }
  );

  const text = body?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response.");
  return text.trim();
};

// ─── Gemini provider ───────────────────────────────────────────────────────
const callGemini = async (apiKey, prompt) => {
  const body = await httpsPost(
    "generativelanguage.googleapis.com",
    `/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {},
    {
      contents:         [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }
  );

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  return text.trim();
};

// ─── Retry wrapper ─────────────────────────────────────────────────────────
const withRetry = async (fn, label) => {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retryable = [429, 500, 503].includes(err.status);
      if (retryable && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.warn(`[${label}] attempt ${attempt} failed (${err.status}), retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        break;
      }
    }
  }
  throw lastErr;
};

// ─── Friendly error messages ───────────────────────────────────────────────
const friendlyError = (err, provider) => {
  const s = err?.status;
  if (s === 429) return `${provider} rate limit hit. Switching provider...`;
  if (s === 503) return `${provider} is busy. Switching provider...`;
  if (s === 401 || s === 403) return `Invalid ${provider} API key.`;
  return err?.message || `${provider} error.`;
};

// ─── Prompt ────────────────────────────────────────────────────────────────
const buildPrompt = (topic) => `
You are an expert quiz generator. Generate exactly 10 multiple-choice questions (MCQs) on the topic: "${topic}".

Distribution:
- 3 EASY questions
- 3 MEDIUM questions
- 4 HARD questions

Rules:
1. Each question must have exactly 4 options.
2. Only one option is correct.
3. Include a brief explanation for why the correct answer is right.
4. Easy: fundamental concepts; Medium: applied knowledge; Hard: advanced/tricky scenarios.

Respond ONLY with a valid JSON array. No markdown, no code fences, no extra text.

Format:
[
  {
    "id": "q1",
    "question": "Question text?",
    "difficulty": "easy",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation here."
  }
]

Generate all 10 questions now:
`.trim();

// ─── Parse & validate questions ────────────────────────────────────────────
const parseQuestions = (raw) => {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned an unexpected format. Please try again.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI returned an empty question list. Please try again.");
  }

  return questions.map((q, idx) => {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.correctAnswer ||
      !["easy", "medium", "hard"].includes(q.difficulty)
    ) {
      throw new Error(`Question ${idx + 1} has invalid structure. Please try again.`);
    }
    return {
      id:            q.id || `q${idx + 1}`,
      question:      String(q.question),
      difficulty:    q.difficulty,
      options:       q.options.map(String),
      correctAnswer: String(q.correctAnswer),
      explanation:   q.explanation ? String(q.explanation) : "",
    };
  });
};

// ─── Main export: Groq → Gemini fallback ──────────────────────────────────
/**
 * Generate 10 MCQ questions (3 easy, 3 medium, 4 hard) for any topic.
 * Uses Groq as primary, Gemini as automatic fallback.
 * @param {string} topic
 * @returns {Promise<Array>}
 */
const generateQuizQuestions = async (topic) => {
  const groqKey   = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const prompt    = buildPrompt(topic);

  // ── 1. Try Groq (primary) ─────────────────────────────────────────────
  if (groqKey && groqKey !== "your_groq_api_key_here") {
    try {
      console.log(`[AI] Using Groq (${GROQ_MODEL})`);
      const raw = await withRetry(() => callGroq(groqKey, prompt), "Groq");
      return parseQuestions(raw);
    } catch (err) {
      console.warn(`[AI] Groq failed: ${friendlyError(err, "Groq")} → trying Gemini...`);
    }
  } else {
    console.warn("[AI] GROQ_API_KEY not set → trying Gemini...");
  }

  // ── 2. Try Gemini (fallback) ──────────────────────────────────────────
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    try {
      console.log(`[AI] Using Gemini (${GEMINI_MODEL})`);
      const raw = await withRetry(() => callGemini(geminiKey, prompt), "Gemini");
      return parseQuestions(raw);
    } catch (err) {
      const s = err?.status;
      if (s === 429) throw new Error("Both AI providers are rate-limited. Please wait a minute and try again.");
      if (s === 503) throw new Error("Both AI providers are temporarily busy. Please try again shortly.");
      if (s === 401 || s === 403) throw new Error("Invalid Gemini API key. Please check GEMINI_API_KEY in .env.");
      throw new Error("AI generation failed. Please try again.");
    }
  }

  throw new Error("No AI provider configured. Please set GROQ_API_KEY or GEMINI_API_KEY in .env.");
};

module.exports = { generateQuizQuestions };
