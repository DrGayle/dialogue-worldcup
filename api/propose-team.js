import Anthropic from "@anthropic-ai/sdk";
import { MODEL, ROSTER_TEXT, findByName } from "./_lib.js";

// Vercel Node serverless function. The Anthropic API key is read from the
// ANTHROPIC_API_KEY environment variable and never reaches the client.

const SYSTEM =`You are the heart of the Dialogue World Cup Team Game, made by Dialogue, a school that teaches English to immigrants and newcomers through soccer and shared stories.

A user has answered five questions. Based on their answers, propose a symbolic English-learning "team": exactly 11 players plus exactly 1 coach, drawn ONLY from the provided roster. Every player must have coach=false; the coach must have coach=true. Use each person's EXACT name as written in the roster.

Choose people whose language journeys, migration stories, countries, or playing spirit resonate with what the user told you. Favor a humane, story-driven team over pure star power: lean into multilingual journeys, migration, and the teams or players the user mentioned. Aim for a meaningful spread across both the men's 2026 and women's 2023 tournaments and across countries — this is a team, not an all-star XI.

Write a warm two-to-three sentence "theme" explaining the team's shared spirit and how it connects to the user's answers. For each pick, write one short sentence on why they belong in THIS user's team.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    theme: { type: "string" },
    coach: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        reason: { type: "string" },
      },
      required: ["name", "reason"],
    },
    players: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          reason: { type: "string" },
        },
        required: ["name", "reason"],
      },
    },
  },
  required: ["theme", "coach", "players"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });
  }

  let answers;
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    answers = body?.answers;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }
  if (!answers) {
    return res.status(400).json({ error: "Missing answers." });
  }

  const client = new Anthropic();

  const userPrompt = `Here are the user's answers to the five questions:

${JSON.stringify(answers, null, 2)}

Here is the full roster to choose from:

${ROSTER_TEXT}

Propose the team now: exactly 11 players and exactly 1 coach, using exact names from the roster.`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
    const parsed = JSON.parse(text);

    // Map the model's name choices back to full player records.
    const coachRecord = findByName(parsed.coach?.name);
    const team = (parsed.players ?? [])
      .map((pick) => {
        const record = findByName(pick.name);
        return record ? { ...record, reason: pick.reason } : null;
      })
      .filter(Boolean)
      .filter((p) => !p.coach);

    if (!coachRecord || !coachRecord.coach) {
      return res
        .status(502)
        .json({ error: "The model did not return a valid coach." });
    }
    if (team.length < 11) {
      return res.status(502).json({
        error: `The model returned only ${team.length} valid players.`,
      });
    }

    return res.status(200).json({
      theme: parsed.theme ?? "",
      coach: { ...coachRecord, reason: parsed.coach.reason },
      team: team.slice(0, 11),
    });
  } catch (err) {
    console.error("propose-team error:", err);
    return res
      .status(500)
      .json({ error: err?.message ?? "Failed to propose a team." });
  }
}
