// Shared roster helpers for the Anthropic-backed endpoints. Files prefixed with
// "_" are not treated as routes by Vercel, but can be imported by routes.
import players from "../src/data/players.json" with { type: "json" };

export const MODEL = "claude-opus-4-8";

export const PLAYER_POOL = players.filter((p) => !p.coach);
export const COACH_POOL = players.filter((p) => p.coach);

// Compact one-line description so the model can reason over the whole pool.
export function rosterLine(p) {
  const tag = p.coach ? "COACH" : p.position;
  return `- ${p.name} | ${p.country} ${p.flag} | ${p.tournament} | ${tag} | ${p.languages.join(
    ", "
  )} | ${p.story}`;
}

export const ROSTER_TEXT = [
  "PLAYERS (coach=false):",
  ...PLAYER_POOL.map(rosterLine),
  "",
  "COACHES (coach=true):",
  ...COACH_POOL.map(rosterLine),
].join("\n");

// Accent-insensitive, case-insensitive name match (so "Martinez" matches
// "Martínez", etc.).
export function normalizeName(s) {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function findByName(name) {
  if (!name) return null;
  const target = normalizeName(name);
  return players.find((p) => normalizeName(p.name) === target) ?? null;
}

export { players };
