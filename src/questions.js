// The five questions of the Dialogue World Cup Team Game.
//
// Question types:
//   "choice-text"  — multiple choice plus a free-text "other" field
//   "image"        — pick one of four images (text labels for now; art to come)
//   "text"         — free text, accepts any language
//
// Free-text fields accept input in any language. The answers object is what
// gets sent to the Anthropic API to propose a team.

export const QUESTIONS = [
  {
    id: "why_here",
    type: "choice-text",
    prompt: "What brought you here today?",
    options: [
      "I want to learn English",
      "I love soccer",
      "Someone I care about is learning English",
      "I support Dialogue's mission",
      "I'm just curious",
    ],
    allowOther: true,
    otherLabel: "Something else (write in any language)",
  },
  {
    id: "image_pick",
    type: "image",
    prompt: "Pick an image.",
    options: [
      { id: "stadium", label: "A crowded stadium" },
      { id: "dusty_street", label: "A child kicking a ball in a dusty street" },
      { id: "classroom", label: "A classroom with one window" },
      { id: "passport", label: "A passport full of stamps" },
    ],
  },
  {
    id: "recent_teams",
    type: "text",
    prompt:
      "As best you remember, which national soccer teams did you most recently see playing?",
    placeholder: "Write in any language…",
    multiline: true,
  },
  {
    id: "team_care_about",
    type: "text",
    prompt:
      "Whether they qualified or not, which national team do you know or care about most?",
    placeholder: "Write in any language…",
    multiline: false,
  },
  {
    id: "good_player",
    type: "text",
    prompt: "Who is a soccer player you would call good or great?",
    placeholder: "Write in any language…",
    multiline: false,
  },
];
