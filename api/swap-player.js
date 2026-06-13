import Anthropic from "@anthropic-ai/sdk";
import {
  MODEL,
  ROSTER_TEXT,
  findByName,
  normalizeName,
  PLAYER_POOL,
  COACH_POOL,
} from "./_lib.js";

// Proposes a single replacement for one slot in an already-proposed team.
// The Anthropic API key is read from ANTHROPIC_API_KEY and never reaches the client.

const SYSTEM = `You are the heart of the Dialogue World Cup Team Game, made by Dialogue, a school that teaches English to immigrants and newcomers through soccer and shared stories.

The user already has a team and wants to swap ONE slot. Propose a single replacement, drawn ONLY from the provided roster, that fits the user's answers and the spirit of their team.

Rules:
- If the slot is a coach, the replacement MUST have coach=true. If it is a player, it MUST have coach=false.
- The replacement MUST NOT be anyone already in the team (the excluded names), and must differ from the person being replaced.
- Use the person's EXACT name as written in the roster.
- Favor humane, story-driven picks: multilingual journeys, migration, and the teams or players the user cares about, with variety across the men's 2026 and women's 2023 tournaments and across countries.

Write one short sentence on why this new pick fits THIS user's team.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    reason: { type: "string" },
  },
  required: ["name", "reason"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  let answers, slot, currentName, exclude;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    ({ answers, slot, currentName, exclude } = body ?? {});
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }
  if (!answers || (slot !== "coach" && slot !== "player")) {
    return res.status(400).json({ error: "Missing answers or invalid slot." });
  }

  const excludeNames = Array.isArray(exclude) ? exclude : [];
  const excludeSet = new Set(excludeNames.map(normalizeName));

  // The only names the model is allowed to return for this slot: the right
  // pool (players vs coaches) minus anyone already in the team. This keeps
  // the model from reaching for a thematically-perfect person who isn't in our
  // roster (e.g. a national-team coach we don't carry).
  const pool = slot === "coach" ? COACH_POOL : PLAYER_POOL;
  const available = pool.filter((p) => !excludeSet.has(normalizeName(p.name)));
  const availableNames = available.map((p) => p.name);

  const client = new Anthropic();

  const userPrompt = `Here are the user's answers to the five questions:

${JSON.stringify(answers, null, 2)}

The slot to swap is a ${slot.toUpperCase()}.
The person being replaced: ${currentName ?? "(none)"}.

Here is the full roster (for the stories and context):

${ROSTER_TEXT}

You MUST choose exactly one name from this list of AVAILABLE ${slot.toUpperCase()}S, copied verbatim. Do not invent anyone or pick a real-world person who is not on this list, even if they would fit thematically:

${availableNames.join("\n")}

Propose exactly one replacement ${slot}, returning a name that appears verbatim in the available list above.`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
    const parsed = JSON.parse(text);
    const record = findByName(parsed.name);

    if (!record) {
      return res.status(502).json({ error: "The model returned an unknown name." });
    }
    if (slot === "coach" && !record.coach) {
      return res.status(502).json({ error: "The model returned a player for the coach slot." });
    }
    if (slot === "player" && record.coach) {
      return res.status(502).json({ error: "The model returned a coach for a player slot." });
    }
    if (excludeNames.some((n) => n.trim().toLowerCase() === record.name.toLowerCase())) {
      return res.status(502).json({ error: "The model picked someone already in the team." });
    }

    return res.status(200).json({ ...record, reason: parsed.reason });
  } catch (err) {
    console.error("swap-player error:", err);
    return res.status(500).json({ error: err?.message ?? "Failed to swap." });
  }
}
