import { ClarityMode } from "./schemas";

export const CLARIFY_SYSTEM_PROMPT = `Write clearly and simply. Avoid jargon. Use plain English. Keep sentences short. Prioritize clarity over sophistication.
You are an AI assistant specialized in helping people see things clearly.
Your goal is to identify the core issue and give practical, grounded next steps depending on the mode.
Make your answers feel like a smart friend helping, not a consultant writing a report.
Constraints:
- Do NOT mirror the user's phrasing.
- Be neutral, supportive, and grounded; no therapy tone; no motivational fluff.
- Each field must add NEW information or structure.
- Output MUST be valid JSON matching the requested schema.
- Do NOT wrap JSON in markdown code blocks.`;

function getClarityModeDetails(mode: ClarityMode) {
  let instructions = "";
  let example = "";

  switch (mode) {
    case "decision":
      instructions = `Mode: DECISION (Focus on options and keeping things simple)
- core_issue: 1-2 sentences. What's the real choice here?
- options: 2-3 clear paths. For each include { option, why, when_it_wins }.
- decision_levers: 1-3 key factors that help you decide (like "Time" or "Cost").
- tradeoffs: 1-3 things you'll have to give up for each path.
- next_steps_14_days: A SINGLE small thing to try this week to get a better handle on things.
- one_sharp_question: A question to cut through the noise.
- refining_questions: Exactly 3 short, high-signal questions whose answers would sharpen this decision analysis further (e.g. constraints, time pressure, what matters most).`;
      example = `{
  "problem_type": "decision",
  "core_issue": "string",
  "options": [{"option": "string", "why": "string", "when_it_wins": "string"}],
  "decision_levers": ["string"],
  "tradeoffs": ["string"],
  "next_steps_14_days": ["single experiment"],
  "one_sharp_question": "string",
  "refining_questions": ["question 1", "question 2", "question 3"]
}`;
      break;

    case "plan":
      instructions = `Mode: PLAN (Focus on getting things done)
- core_issue: A simple statement of the goal.
- hidden_assumptions: 3-5 major steps or milestones.
- next_steps_14_days: 5-10 clear actions.
- tradeoffs: 2-4 risks and how to handle them.
- decision_levers: 1-2 ways to tell if it's working.
- one_sharp_question: A question to make sure the plan is solid.
- refining_questions: Exactly 3 short, high-signal questions that would improve milestones, risk handling, or success criteria.`;
      example = `{
  "problem_type": "plan",
  "core_issue": "string",
  "hidden_assumptions": ["milestone1", "milestone2", "milestone3"],
  "next_steps_14_days": ["action1", "action2", "action3", "action4", "action5"],
  "tradeoffs": ["risk1", "risk2"],
  "decision_levers": ["metric1"],
  "one_sharp_question": "string",
  "refining_questions": ["question 1", "question 2", "question 3"]
}`;
      break;

    case "overwhelm":
      instructions = `Mode: OVERWHELM (Focus on clearing your head)
- core_issue: 1 clear sentence on what's actually causing the stress.
- top_3_priorities_today: Just 3 things that matter most today.
- top_3_defer_or_ignore: 3 things you can safely ignore for now.
- next_10_minutes: What to do RIGHT NOW.
- next_24_hours: What to do by tomorrow.
- constraint_or_boundary: A simple rule to follow (e.g., "Stop after this one thing").
- one_sharp_question: A gentle question to ground you.
- refining_questions: Exactly 3 short, high-signal questions to better understand the overwhelm, capacity constraints, or what can be dropped.`;
      example = `{
  "problem_type": "overwhelm",
  "core_issue": "string",
  "top_3_priorities_today": ["priority1", "priority2", "priority3"],
  "top_3_defer_or_ignore": ["defer1", "defer2", "defer3"],
  "next_10_minutes": "single action",
  "next_24_hours": "single action",
  "constraint_or_boundary": "string",
  "one_sharp_question": "string",
  "refining_questions": ["question 1", "question 2", "question 3"]
}`;
      break;

    case "message_prep":
      instructions = `Mode: PREP (Focus on being clear and heard)
- core_issue: What this message is really about.
- purpose_outcome: What do you want to happen after they read/hear this?
- key_points: 3-6 simple, direct points.
- structure_outline: { opening: "string", body: ["point1", "point2", ...], close: "string" }. Keep the body to 2-4 points.
- likely_questions_or_objections: 3-6 things they might ask.
- rehearsal_checklist: 3-6 things to check before you're done.
- one_sharp_question: A question to test if it's clear enough.
- refining_questions: Exactly 3 short, high-signal questions to improve the message structure, audience understanding, or outcome clarity.`;
      example = `{
  "problem_type": "message_prep",
  "core_issue": "string",
  "purpose_outcome": "string",
  "key_points": ["point1", "point2", "point3"],
  "structure_outline": {
    "opening": "string",
    "body": ["bodypoint1", "bodypoint2"],
    "close": "string"
  },
  "likely_questions_or_objections": ["q1", "q2", "q3"],
  "rehearsal_checklist": ["check1", "check2", "check3"],
  "one_sharp_question": "string",
  "refining_questions": ["question 1", "question 2", "question 3"]
}`;
      break;
  }

  return { instructions, example };
}

export function buildClarityPrompt(mode: ClarityMode, text: string, followup_answer?: string) {
  const { instructions: modeInstructions, example: outputExample } = getClarityModeDetails(mode);

  let prompt = `Mode: ${mode}\n\nInput Text:\n"""\n${text}\n"""\n`;

  if (followup_answer) {
    prompt += `\nUser's Follow-up Answer:\n"""\n${followup_answer}\n"""\n\nIncorporate this new information to refine the assessment.`;
  }

  prompt += `\n\n${modeInstructions}\n\nOutput ONLY valid JSON in this exact format:\n${outputExample}\n\nDo NOT add any extra fields. Do NOT wrap in markdown.`;

  return prompt;
}

export function buildClarityRefinePrompt(
  mode: ClarityMode,
  text: string,
  refining_answers: [string, string, string],
  extra_context?: string,
  prior_questions?: [string, string, string]
) {
  const { instructions: modeInstructions, example: outputExample } = getClarityModeDetails(mode);

  const qa = refining_answers
    .map((ans, i) => {
      const q = prior_questions?.[i] ? `Q: ${prior_questions[i]}\n` : "";
      return `${q}A: ${ans || "(skipped)"}`;
    })
    .join("\n\n");

  const extraBlock = extra_context?.trim()
    ? `\nAdditional context from user:\n"""\n${extra_context}\n"""\n`
    : "";

  return `Mode: ${mode}

Original Input:
"""
${text}
"""

The user answered 3 refining questions to help improve the analysis:
${qa}
${extraBlock}

${modeInstructions}

Using ALL of the above information, produce an IMPROVED and updated clarity assessment.

Output ONLY valid JSON in this exact format:
${outputExample}

Do NOT add any extra fields. Do NOT wrap in markdown.`;
}

export const COMMUNICATE_SYSTEM_PROMPT = `Write clearly and simply. Avoid jargon. Use plain English. Keep sentences short. Prioritize clarity over sophistication.
You are a helpful editor and communication coach.
Your goal is to rewrite messages to be natural, realistic, and easy to read.
Make drafts feel like they were written by a person, not a machine.
Constraints:
- Do NOT invent facts beyond the message.
- "evaluative": Clear, professional, and focused on outcomes.
- "technical": Precise and structured, but still readable.
- "persuasive": Simple benefits, clear next steps, easy to agree with.
- "personal": Warm, human, and conversational (unless formal=true).
- Output MUST be valid JSON matching the requested schema.
- Do NOT wrap JSON in markdown code blocks.`;

export function buildCommunicatePrompt(
  message: string,
  contexts: string[],
  intent: string,
  options: { preserveMeaning: boolean; concise: boolean; formal: boolean },
  refiningAnswer?: string
) {
  const contextsStr = contexts.join(", ");

  const prompt = `Original Message:
"""
${message}
"""

Selected Contexts: ${contextsStr}
Intent: ${intent}
Options: ${JSON.stringify(options)}

${refiningAnswer ? `Refining Answer (Incorporating this into follow-up drafts):\n"""\n${refiningAnswer}\n"""\n` : ""}
Generate one draft for EACH selected context (${contexts.length} total)${contexts.length > 1 ? " PLUS one additional 'combined' draft that intelligently blends all selected contexts" : ""}.

For each draft:
- Rewrite the message to fit the context and intent.
- Do NOT invent facts.
- Keep key_changes grounded (2-5 items describing what you changed).
- Provide a tone descriptor.

Also generate refining_questions: an array of EXACTLY 3 short, high-signal questions. If answered, they would help create even better drafts (focus on tone, intent, audience constraints, or missing context).

Output ONLY valid JSON in this exact format:
{
  "drafts": [
    {
      "context": "evaluative",
      "intent": "inform",
      "draft": "rewritten message",
      "key_changes": ["change1", "change2"],
      "tone": "professional"
    },
    {
      "context": "combined",
      "intent": "inform",
      "draft": "blended rewritten message",
      "key_changes": ["blended change1", "blended change2"],
      "tone": "balanced and strategic"
    }
  ],
  "refining_questions": ["question 1", "question 2", "question 3"]
}

Do NOT add extra fields. Do NOT wrap in markdown.`;

  return prompt;
}

export function buildCommunicateRefinePrompt(
  message: string,
  contexts: string[],
  intent: string,
  options: { preserveMeaning: boolean; concise: boolean; formal: boolean },
  refining_answers: [string, string, string],
  extra_context?: string,
  prior_questions?: [string, string, string]
) {
  const contextsStr = contexts.join(", ");
  const qa = refining_answers
    .map((ans, i) => {
      const q = prior_questions?.[i] ? `Q: ${prior_questions[i]}\n` : "";
      return `${q}A: ${ans || "(skipped)"}`;
    })
    .join("\n\n");

  const extraBlock = extra_context?.trim()
    ? `\nAdditional context from user:\n"""\n${extra_context}\n"""\n`
    : "";

  return `Original Message:
"""
${message}
"""

Selected Contexts: ${contextsStr}
Intent: ${intent}
Options: ${JSON.stringify(options)}

The user answered 3 refining questions to improve the drafts:
${qa}
${extraBlock}
Using ALL of the above, produce IMPROVED drafts in the same JSON schema (one per context${contexts.length > 1 ? " plus a combined draft" : ""}, plus a fresh set of 3 refining_questions).

Do NOT add extra fields. Do NOT wrap in markdown.`;
}
