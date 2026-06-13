import { useState } from "react";
import { swapPlayer } from "../api.js";

// Shows the team proposed by the Anthropic API. Click any card to reveal a
// Swap button; swapping asks the API for a single replacement for that slot,
// which slides in to replace the card. Swap as often as you like before
// nominating.

function SlotCard({
  person,
  slotLabel,
  selected,
  swapping,
  justSwapped,
  error,
  onToggle,
  onSwap,
}) {
  return (
    <div
      className={`relative rounded-xl border bg-white p-4 transition cursor-pointer ${
        selected
          ? "border-teal-500 ring-2 ring-teal-300"
          : "border-teal-200 hover:border-teal-300"
      } ${justSwapped ? "animate-slide-in" : ""} ${
        swapping ? "opacity-60" : ""
      }`}
      onClick={() => !swapping && onToggle()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !swapping) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-teal-800">
          {person.flag} {person.name}
        </span>
        <span className="text-xs text-teal-500">{slotLabel}</span>
      </div>
      <p className="mt-1 text-sm text-teal-600">
        {person.country} · {person.languages.join(", ")}
      </p>
      {person.reason && (
        <p className="mt-2 text-sm text-teal-700 italic">{person.reason}</p>
      )}

      {selected && !swapping && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            className="rounded-full bg-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-600"
          >
            Swap
          </button>
          <span className="text-xs text-teal-500">
            Find a different pick for this slot
          </span>
        </div>
      )}

      {swapping && (
        <div className="mt-3 flex items-center gap-2 text-sm text-teal-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-500" />
          Finding a replacement…
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function TeamProposal({
  proposal,
  loading,
  error,
  answers,
  onRetry,
  onSwap,
  onContinue,
}) {
  // key: "coach" for the coach slot, or a player's name for a player slot.
  const [selectedKey, setSelectedKey] = useState(null);
  const [swappingKey, setSwappingKey] = useState(null);
  const [justSwapped, setJustSwapped] = useState(null);
  const [swapError, setSwapError] = useState(null); // { key, message }

  async function handleSwap(slot, currentName, key) {
    setSwappingKey(key);
    setSelectedKey(null);
    setSwapError(null);

    const exclude = [
      proposal.coach.name,
      ...proposal.team.map((p) => p.name),
    ];

    try {
      const replacement = await swapPlayer({
        answers,
        slot,
        currentName,
        exclude,
      });

      if (slot === "coach") {
        onSwap({ ...proposal, coach: replacement });
      } else {
        onSwap({
          ...proposal,
          team: proposal.team.map((p) =>
            p.name === currentName ? replacement : p
          ),
        });
      }
      setJustSwapped(replacement.name);
    } catch (e) {
      setSwapError({ key, message: e.message ?? "Swap failed." });
    } finally {
      setSwappingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
        <p className="text-teal-700">Assembling your team…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-full bg-teal-500 px-6 py-2.5 font-medium text-white hover:bg-teal-600"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold text-teal-800">Your team</h2>
        {proposal.theme && (
          <p className="mt-2 text-teal-700">{proposal.theme}</p>
        )}
        <p className="mt-1 text-sm text-teal-500">
          Tap any card to swap that pick.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
          Coach
        </h3>
        <SlotCard
          key={`coach-${proposal.coach.name}`}
          person={proposal.coach}
          slotLabel="Coach"
          selected={selectedKey === "coach"}
          swapping={swappingKey === "coach"}
          justSwapped={justSwapped === proposal.coach.name}
          error={swapError?.key === "coach" ? swapError.message : null}
          onToggle={() =>
            setSelectedKey((k) => (k === "coach" ? null : "coach"))
          }
          onSwap={() => handleSwap("coach", proposal.coach.name, "coach")}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-600">
          The eleven
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {proposal.team.map((p) => (
            <SlotCard
              key={p.name}
              person={p}
              slotLabel={p.position}
              selected={selectedKey === p.name}
              swapping={swappingKey === p.name}
              justSwapped={justSwapped === p.name}
              error={swapError?.key === p.name ? swapError.message : null}
              onToggle={() =>
                setSelectedKey((k) => (k === p.name ? null : p.name))
              }
              onSwap={() => handleSwap("player", p.name, p.name)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={Boolean(swappingKey)}
          className="rounded-full bg-teal-500 px-7 py-2.5 font-medium text-white shadow-sm hover:bg-teal-600 disabled:opacity-50"
        >
          Nominate this team
        </button>
      </div>
    </div>
  );
}
