# Dialogue World Cup Team Game

A React + Vite web app, deployed to Vercel. A user answers five questions, then
the Anthropic API proposes a symbolic English-learning **team** — 11 soccer
players plus 1 coach — drawn from the 2026 Men's and 2023 Women's World Cup
rosters. The user can swap picks, nominate their team, and donate $25 via Zeffy.

## The four acts

1. **Welcome** — intro and start
2. **Questions** — five questions, one per screen (free text accepts any language)
3. **Team Proposal** — the API's 11 players + 1 coach, with swapping
4. **Nomination** — name/nominate the team; the final screen, ending with the Donate $25 via Zeffy button

## Stack

- **React 18 + Vite** front end
- **Tailwind CSS** — primary color teal `#2e7d8a`, font **Ubuntu**
- **Anthropic API** (`claude-opus-4-8`) via a Vercel serverless function in `api/`
- Player data in [`src/data/players.json`](src/data/players.json) (121 records)

## Project layout

```
api/propose-team.js   Serverless function — calls Anthropic, returns team
src/
  App.jsx               Act state machine
  questions.js          The five questions
  api.js                Client helper for /api/propose-team
  data/players.json     The roster (120 players + 8 coaches)
  screens/              One component per act
```

## Local development

```bash
npm install
cp .env.example .env       # add your ANTHROPIC_API_KEY
npm run dev                # http://localhost:5173
```

A dev-only Vite plugin (`vite.config.js`) serves the `api/` functions alongside
the UI, so plain `npm run dev` exercises the full flow — no Vercel account
needed. `npx vercel dev` also works if you want the exact production runtime.

## Environment variables

| Variable            | Where    | Purpose                                  |
| ------------------- | -------- | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | server   | Auth for the Anthropic API (never shipped to the client) |
| `VITE_ZEFFY_URL`    | client   | The Zeffy donation campaign URL          |

Set both in the Vercel project settings before deploying.

## Deploy

Push to a Git repo connected to Vercel, or run `npx vercel`. Vercel builds the
Vite app and deploys `api/` as serverless functions automatically.
