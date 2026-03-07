"use client";

import type { ClarifyOutput } from "@/lib/schemas";

interface InlineClarityCardProps {
    cardType: "decision" | "plan" | "overwhelm" | "message_prep";
    card: ClarifyOutput;
    introMessage: string;
}

const CARD_LABELS: Record<string, string> = {
    decision: "Decision",
    plan: "Plan",
    overwhelm: "Overwhelm",
    message_prep: "Message Prep",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <div
                style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(251,191,36,0.7)",
                    marginBottom: "6px",
                }}
            >
                {title}
            </div>
            {children}
        </div>
    );
}

function BulletList({ items }: { items: string[] }) {
    return (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {items.map((item, i) => (
                <li
                    key={i}
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                        color: "rgba(210,235,215,0.88)",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                    }}
                >
                    <span style={{ color: "rgba(251,191,36,0.55)", marginTop: "2px", flexShrink: 0 }}>•</span>
                    {item}
                </li>
            ))}
        </ul>
    );
}

function Prose({ text }: { text: string }) {
    return (
        <p
            style={{
                margin: 0,
                color: "rgba(210,235,215,0.88)",
                fontSize: "0.875rem",
                lineHeight: "1.6",
            }}
        >
            {text}
        </p>
    );
}

export default function InlineClarityCard({ cardType, card, introMessage }: InlineClarityCardProps) {
    return (
        <div
            className="w-full"
            style={{ animation: "card-appear 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
        >
            {/* Bear intro message */}
            <div
                style={{
                    color: "rgba(220,240,225,0.88)",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    marginBottom: "12px",
                    paddingLeft: "4px",
                }}
            >
                {introMessage}
            </div>

            {/* Card */}
            <div
                style={{
                    background: "rgba(8,22,10,0.82)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    backdropFilter: "blur(12px)",
                    maxWidth: "520px",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(251,191,36,0.08)",
                }}
            >
                {/* Card type badge */}
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                        style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "99px",
                            background: "rgba(251,191,36,0.15)",
                            border: "1px solid rgba(251,191,36,0.3)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(251,191,36,0.9)",
                        }}
                    >
                        {CARD_LABELS[cardType] ?? cardType}
                    </span>
                    <span
                        style={{
                            flex: 1,
                            height: "1px",
                            background: "rgba(251,191,36,0.12)",
                        }}
                    />
                </div>

                {/* Core issue */}
                <Section title="What's going on">
                    <Prose text={card.core_issue} />
                </Section>

                {/* Sharp question */}
                {card.one_sharp_question && (
                    <Section title="The key question">
                        <div
                            style={{
                                fontStyle: "italic",
                                color: "rgba(251,191,36,0.85)",
                                fontSize: "0.9375rem",
                                lineHeight: "1.5",
                            }}
                        >
                            {card.one_sharp_question}
                        </div>
                    </Section>
                )}

                {/* ── DECISION FIELDS ── */}
                {cardType === "decision" && (
                    <>
                        {card.options && card.options.length > 0 && (
                            <Section title="Options">
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {card.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                borderRadius: "10px",
                                                padding: "10px 14px",
                                                border: "1px solid rgba(255,255,255,0.06)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: "rgba(220,240,225,0.95)",
                                                    fontSize: "0.875rem",
                                                    marginBottom: "4px",
                                                }}
                                            >
                                                {opt.option}
                                            </div>
                                            <div
                                                style={{
                                                    color: "rgba(180,210,190,0.75)",
                                                    fontSize: "0.8125rem",
                                                    lineHeight: "1.5",
                                                    marginBottom: opt.when_it_wins ? "4px" : 0,
                                                }}
                                            >
                                                {opt.why}
                                            </div>
                                            {opt.when_it_wins && (
                                                <div
                                                    style={{
                                                        color: "rgba(251,191,36,0.6)",
                                                        fontSize: "0.8rem",
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    Best when: {opt.when_it_wins}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}
                        {card.decision_levers && <Section title="What matters most"><BulletList items={card.decision_levers} /></Section>}
                        {card.tradeoffs && <Section title="Tradeoffs"><BulletList items={card.tradeoffs} /></Section>}
                        {card.next_steps_14_days && <Section title="Next 14 days"><BulletList items={card.next_steps_14_days} /></Section>}
                    </>
                )}

                {/* ── PLAN FIELDS ── */}
                {cardType === "plan" && (
                    <>
                        {card.hidden_assumptions && <Section title="Key milestones"><BulletList items={card.hidden_assumptions} /></Section>}
                        {card.next_steps_14_days && <Section title="Next 14 days"><BulletList items={card.next_steps_14_days} /></Section>}
                        {card.tradeoffs && <Section title="Risks"><BulletList items={card.tradeoffs} /></Section>}
                        {card.decision_levers && <Section title="Success looks like"><BulletList items={card.decision_levers} /></Section>}
                    </>
                )}

                {/* ── OVERWHELM FIELDS ── */}
                {cardType === "overwhelm" && (
                    <>
                        {card.top_3_priorities_today && <Section title="Focus on today"><BulletList items={card.top_3_priorities_today} /></Section>}
                        {card.top_3_defer_or_ignore && <Section title="Defer or drop"><BulletList items={card.top_3_defer_or_ignore} /></Section>}
                        {card.next_10_minutes && (
                            <Section title="Right now">
                                <div
                                    style={{
                                        background: "rgba(251,191,36,0.1)",
                                        borderRadius: "8px",
                                        padding: "8px 12px",
                                        color: "rgba(251,191,36,0.9)",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {card.next_10_minutes}
                                </div>
                            </Section>
                        )}
                        {card.next_24_hours && <Section title="By tomorrow"><Prose text={card.next_24_hours} /></Section>}
                        {card.constraint_or_boundary && <Section title="Protect this"><Prose text={card.constraint_or_boundary} /></Section>}
                    </>
                )}

                {/* ── MESSAGE PREP FIELDS ── */}
                {cardType === "message_prep" && (
                    <>
                        {card.purpose_outcome && <Section title="Goal"><Prose text={card.purpose_outcome} /></Section>}
                        {card.key_points && <Section title="Key points"><BulletList items={card.key_points} /></Section>}
                        {card.structure_outline && (
                            <Section title="Structure">
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "6px",
                                        fontSize: "0.8125rem",
                                        color: "rgba(200,225,210,0.82)",
                                        lineHeight: "1.5",
                                    }}
                                >
                                    <div><span style={{ color: "rgba(251,191,36,0.6)", fontWeight: 600 }}>Open — </span>{card.structure_outline.opening}</div>
                                    {Array.isArray(card.structure_outline.body)
                                        ? card.structure_outline.body.map((b, i) => (
                                            <div key={i}><span style={{ color: "rgba(251,191,36,0.6)", fontWeight: 600 }}>Body — </span>{b}</div>
                                        ))
                                        : <div><span style={{ color: "rgba(251,191,36,0.6)", fontWeight: 600 }}>Body — </span>{card.structure_outline.body}</div>
                                    }
                                    <div><span style={{ color: "rgba(251,191,36,0.6)", fontWeight: 600 }}>Close — </span>{card.structure_outline.close}</div>
                                </div>
                            </Section>
                        )}
                        {card.likely_questions_or_objections && <Section title="Likely questions"><BulletList items={card.likely_questions_or_objections} /></Section>}
                        {card.rehearsal_checklist && <Section title="Prepare"><BulletList items={card.rehearsal_checklist} /></Section>}
                    </>
                )}

                {/* Refining questions — shown for all card types */}
                {card.refining_questions && card.refining_questions.length > 0 && (
                    <Section title="To refine this">
                        <BulletList items={card.refining_questions} />
                    </Section>
                )}
            </div>
        </div>
    );
}
