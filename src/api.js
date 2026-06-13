// Client-side helper to request a proposed team from the serverless function.
// The Anthropic API key lives only on the server (api/propose-team.js).

export async function proposeTeam(answers) {
  const res = await fetch("/api/propose-team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  // { team: Player[], coach: Player, theme: string }
  return res.json();
}

// Request a single replacement for one slot. `slot` is "player" | "coach";
// `exclude` is the list of names already in the team (so we don't repeat).
// Returns a full player record with an added `reason` string.
export async function swapPlayer({ answers, slot, currentName, exclude }) {
  const res = await fetch("/api/swap-player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, slot, currentName, exclude }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return res.json();
}
