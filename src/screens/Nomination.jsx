import { useEffect, useState } from "react";
import { ZEFFY_URL } from "../zeffy.js";

// The World Cup final — target for the live countdown (local time).
const FINAL_DATE = new Date("2026-07-19T00:00:00");

const SHARE_TEXT =
  "I nominated my World Cup English-learning team for Dialogue: The English Language School of the People. You can too. dialogueschool.org";

function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// Distinct languages / countries across all 12 people (coach + the eleven).
function summarize(people) {
  const languages = new Set();
  const countries = new Set();
  for (const p of people) {
    (p.languages ?? []).forEach((l) => languages.add(l.trim().toLowerCase()));
    if (p.country) countries.add(p.country.trim().toLowerCase());
  }
  return { languages: languages.size, countries: countries.size };
}

function timeLeft(target) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Countdown() {
  const [left, setLeft] = useState(() => timeLeft(FINAL_DATE));

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(FINAL_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "days", value: left.days },
    { label: "hours", value: left.hours },
    { label: "minutes", value: left.minutes },
    { label: "seconds", value: left.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center rounded-xl bg-teal-500 px-2 py-3 text-white sm:w-20"
        >
          <span className="text-2xl font-bold tabular-nums sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-teal-100 sm:text-xs">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Nomination({ proposal }) {
  const [copied, setCopied] = useState(false);

  if (!proposal) return null;

  const people = [...proposal.team, proposal.coach];
  const { languages, countries } = summarize(people);
  const flags = people.map((p) => p.flag).join(" ");
  const clipboardText = `${flags}\n${SHARE_TEXT}\n${window.location.origin}`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pt-4">
      {/* 1. Headline */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
          Your team is nominated.
        </h2>
      </div>

      {/* 2. Theme paragraph, repeated from the proposal */}
      {proposal.theme && (
        <p className="text-center text-lg text-teal-700">{proposal.theme}</p>
      )}

      {/* 3. Summary line from the team data */}
      <p className="text-center font-medium text-teal-800">
        Your team speaks {pluralize(languages, "language")} and represents{" "}
        {countries} {countries === 1 ? "country" : "countries"}.
      </p>

      {/* 4. Live countdown to the World Cup final */}
      <Countdown />

      {/* 5. Journey sentence */}
      <p className="text-center text-teal-700">
        The Men's World Cup final is July 19. Dialogue's first class starts
        September 3.
      </p>

      {/* Tagline + site link */}
      <p className="text-center text-sm text-teal-600">
        Dialogue: The English Language School of the People — free, intensive,
        live, expert English instruction, anywhere.{" "}
        <a
          href="https://dialogueschool.org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-teal-700 underline hover:text-teal-800"
        >
          dialogueschool.org
        </a>
      </p>

      {/* 6. Shareable team card */}
      <div className="rounded-2xl border border-teal-200 bg-white p-6 text-center shadow-sm">
        <div className="text-3xl leading-relaxed tracking-wide">{flags}</div>
        <p className="mt-4 text-teal-800">{SHARE_TEXT}</p>
        <button
          onClick={copyShare}
          className="mt-4 rounded-full border border-teal-400 px-5 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
        >
          {copied ? "Copied!" : "Copy to share"}
        </button>
      </div>

      {/* 7. Donate button, prominent */}
      <div className="flex flex-col items-center gap-2">
        <a
          href={ZEFFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-teal-500 px-10 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-teal-600"
        >
          Donate $25 via Zeffy
        </a>
      </div>
    </div>
  );
}
