import { useState } from "react";
import { QUESTIONS } from "./questions.js";
import { proposeTeam } from "./api.js";
import Welcome from "./screens/Welcome.jsx";
import Questions from "./screens/Questions.jsx";
import TeamProposal from "./screens/TeamProposal.jsx";
import Nomination from "./screens/Nomination.jsx";

// The four acts of the game. Nomination is the final screen and ends with the
// Donate $25 via Zeffy button.
const ACTS = {
  WELCOME: "welcome",
  QUESTIONS: "questions",
  PROPOSAL: "proposal",
  NOMINATION: "nomination",
};

export default function App() {
  const [act, setAct] = useState(ACTS.WELCOME);
  const [answers, setAnswers] = useState({});

  // The proposed team: { theme, coach, team: [...] }.
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function start() {
    setAnswers({});
    setProposal(null);
    setError(null);
    setAct(ACTS.QUESTIONS);
  }

  // Called when the 5th question is answered.
  async function finishQuestions(finalAnswers) {
    setAnswers(finalAnswers);
    setAct(ACTS.PROPOSAL);
    setLoading(true);
    setError(null);
    try {
      const result = await proposeTeam(finalAnswers);
      setProposal(result);
    } catch (e) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function retryProposal() {
    setLoading(true);
    setError(null);
    try {
      setProposal(await proposeTeam(answers));
    } catch (e) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {act === ACTS.WELCOME && <Welcome onStart={start} />}

        {act === ACTS.QUESTIONS && (
          <Questions questions={QUESTIONS} onComplete={finishQuestions} />
        )}

        {act === ACTS.PROPOSAL && (
          <TeamProposal
            proposal={proposal}
            loading={loading}
            error={error}
            answers={answers}
            onRetry={retryProposal}
            onSwap={setProposal}
            onContinue={() => setAct(ACTS.NOMINATION)}
          />
        )}

        {act === ACTS.NOMINATION && <Nomination proposal={proposal} />}
      </main>
    </div>
  );
}
