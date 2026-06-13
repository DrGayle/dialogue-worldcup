import { useState } from "react";

// One question per screen. Minimal but working: collects an answer for each
// question type, supports Back/Next, and calls onComplete after the last one.
// Richer visuals (especially the image question) come in the per-screen build.

export default function Questions({ questions, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const current = answers[q.id];

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  }

  function next() {
    if (isLast) onComplete(answers);
    else setIndex((i) => i + 1);
  }

  // An answer is "present" enough to advance.
  const hasAnswer = (() => {
    if (q.type === "image") return Boolean(current);
    if (q.type === "choice-text")
      return Boolean(current?.choice || current?.other?.trim());
    return Boolean(current?.trim?.());
  })();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between text-sm text-teal-600">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i <= index ? "bg-teal-500" : "bg-teal-200"
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-teal-800">
        {q.prompt}
      </h2>

      <QuestionBody q={q} value={current} onChange={setAnswer} />

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="text-teal-600 disabled:opacity-30"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!hasAnswer}
          className="rounded-full bg-teal-500 px-7 py-2.5 font-medium text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-40"
        >
          {isLast ? "Build my team" : "Next"}
        </button>
      </div>
    </div>
  );
}

function QuestionBody({ q, value, onChange }) {
  if (q.type === "choice-text") {
    return (
      <div className="flex flex-col gap-3">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange({ choice: opt, other: "" })}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              value?.choice === opt
                ? "border-teal-500 bg-teal-100"
                : "border-teal-200 bg-white hover:border-teal-300"
            }`}
          >
            {opt}
          </button>
        ))}
        {q.allowOther && (
          <input
            type="text"
            placeholder={q.otherLabel}
            value={value?.other ?? ""}
            onChange={(e) => onChange({ choice: "", other: e.target.value })}
            className="rounded-xl border border-teal-200 bg-white px-4 py-3 focus:border-teal-500 focus:outline-none"
          />
        )}
      </div>
    );
  }

  if (q.type === "image") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`rounded-xl border px-4 py-8 text-center transition ${
              value === opt.id
                ? "border-teal-500 bg-teal-100"
                : "border-teal-200 bg-white hover:border-teal-300"
            }`}
          >
            {/* TODO: replace text label with artwork in the per-screen build */}
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  // Free text (any language).
  return q.multiline ? (
    <textarea
      rows={4}
      placeholder={q.placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-teal-200 bg-white px-4 py-3 focus:border-teal-500 focus:outline-none"
    />
  ) : (
    <input
      type="text"
      placeholder={q.placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-teal-200 bg-white px-4 py-3 focus:border-teal-500 focus:outline-none"
    />
  );
}
