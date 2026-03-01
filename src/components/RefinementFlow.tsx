"use client";

import { useState } from "react";

interface RefinementFlowProps {
    questions: string[];
    onApply: (answers: [string, string, string], extraContext: string) => void;
    onReset: () => void;
    isLoading: boolean;
    themeColor: "blue" | "indigo";
}

type Step = 0 | 1 | 2 | "extra" | "done";

const THEME = {
    blue: {
        bg: "!bg-blue-50 !border-blue-400/40",
        icon: "bg-blue-700 shadow-blue-500/20",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        heading: "text-blue-950",
        question: "text-blue-950",
        textarea: "border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 text-blue-950 placeholder:text-blue-400",
        btn: "bg-blue-600 hover:bg-blue-700 border-blue-700",
        skipBtn: "text-blue-400 hover:text-blue-600",
        doneBar: "bg-blue-100 border-blue-200/60 text-blue-700",
        doneBarBtn: "text-blue-600 hover:text-blue-800",
        progressDot: "bg-blue-600",
        progressDotEmpty: "bg-blue-200",
        fallback: "bg-blue-50 border-blue-200 text-blue-600",
    },
    indigo: {
        bg: "!bg-indigo-50 !border-indigo-400/40",
        icon: "bg-indigo-700 shadow-indigo-500/20",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
        heading: "text-indigo-950",
        question: "text-indigo-950",
        textarea: "border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-indigo-950 placeholder:text-indigo-400",
        btn: "bg-indigo-600 hover:bg-indigo-700 border-indigo-700",
        skipBtn: "text-indigo-400 hover:text-indigo-600",
        doneBar: "bg-indigo-100 border-indigo-200/60 text-indigo-700",
        doneBarBtn: "text-indigo-600 hover:text-indigo-800",
        progressDot: "bg-indigo-600",
        progressDotEmpty: "bg-indigo-200",
        fallback: "bg-indigo-50 border-indigo-200 text-indigo-600",
    },
};

export default function RefinementFlow({
    questions,
    onApply,
    onReset,
    isLoading,
    themeColor,
}: RefinementFlowProps) {
    const t = THEME[themeColor];
    const [step, setStep] = useState<Step>(0);
    const [answers, setAnswers] = useState<[string, string, string]>(["", "", ""]);
    const [extraContext, setExtraContext] = useState("");
    const [collapsed, setCollapsed] = useState(false);

    // ── Guard: must have exactly 3 valid questions ────────────────────────────
    if (!questions || questions.length < 3) {
        return (
            <div className={`p-5 rounded-2xl border text-sm font-bold animate-in fade-in ${t.fallback}`}>
                ⚠️ Refinement questions could not be loaded. Try regenerating.
            </div>
        );
    }

    // Safe: we know questions[0..2] exist
    const q0 = questions[0];
    const q1 = questions[1];
    const q2 = questions[2];

    const handleNext = () => {
        if (step === 0) setStep(1);
        else if (step === 1) setStep(2);
        else if (step === 2) setStep("extra");
    };

    const handleApply = () => {
        onApply(answers, extraContext);
        setCollapsed(true);
    };

    const handleRefineAgain = () => {
        setAnswers(["", "", ""]);
        setExtraContext("");
        setStep(0);
        setCollapsed(false);
        onReset();
    };

    const updateAnswer = (idx: 0 | 1 | 2, val: string) => {
        const next = [...answers] as [string, string, string];
        next[idx] = val;
        setAnswers(next);
    };

    const currentQuestion = step === 0 ? q0 : step === 1 ? q1 : step === 2 ? q2 : "";
    const stepNum = step === "done" ? 3 : step === "extra" ? 3 : (step as number);

    // ── Collapsed / done state ─────────────────────────────────────────────
    if (collapsed && !isLoading) {
        return (
            <div className={`flex items-center justify-between px-5 py-4 rounded-2xl border shadow-sm animate-in fade-in ${t.doneBar}`}>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-base">✓</span>
                    Refinement applied
                </div>
                <button
                    onClick={handleRefineAgain}
                    className={`text-xs font-black uppercase tracking-widest transition-colors ${t.doneBarBtn}`}
                >
                    Refine again
                </button>
            </div>
        );
    }

    // ── Loading spinner overlay ────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className={`p-6 glass-light ${t.bg} rounded-2xl shadow-md flex items-center justify-center gap-3 animate-in fade-in`}>
                <span className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ${themeColor === "blue" ? "text-blue-600" : "text-indigo-600"}`} />
                <span className={`text-sm font-black uppercase tracking-widest ${t.heading}`}>Applying refinement…</span>
            </div>
        );
    }

    return (
        <div className={`p-6 glass-light ${t.bg} rounded-2xl shadow-md space-y-5 animate-in fade-in slide-in-from-bottom-2`}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${t.icon} text-white rounded-lg flex items-center justify-center text-sm shadow-md`}>
                    🔧
                </div>
                <div className="flex-1 flex items-center justify-between gap-3">
                    <h3 className={`font-black ${t.heading} uppercase tracking-widest text-[10px]`}>
                        {step === "extra" ? "Optional extra context" : "Refine your results"}
                    </h3>
                    {step !== "extra" && (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.badge}`}>
                            {stepNum + 1} / 3
                        </span>
                    )}
                </div>
            </div>

            {/* Progress dots */}
            {step !== "extra" && (
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i <= stepNum ? `${t.progressDot} w-6` : `${t.progressDotEmpty} w-3`}`}
                        />
                    ))}
                </div>
            )}

            {/* Question / Extra context */}
            {step !== "extra" ? (
                <>
                    <p className={`text-sm font-black ${t.question} leading-relaxed italic`}>
                        &quot;{currentQuestion}&quot;
                    </p>
                    <div className="space-y-3">
                        <textarea
                            value={answers[step as 0 | 1 | 2]}
                            onChange={(e) => updateAnswer(step as 0 | 1 | 2, e.target.value)}
                            placeholder="Your answer (or leave blank to skip)…"
                            rows={3}
                            className={`w-full p-4 bg-white border-2 ${t.textarea} rounded-xl text-sm focus:ring-2 outline-none transition-all resize-none font-medium`}
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNext}
                                className={`flex-1 py-3 ${t.btn} text-white border rounded-xl font-black hover:opacity-90 transition-all text-xs uppercase tracking-widest shadow-md active:scale-95`}
                            >
                                {step === 2 ? "Continue →" : "Next →"}
                            </button>
                            <button
                                onClick={handleNext}
                                className={`text-xs font-bold ${t.skipBtn} transition-colors`}
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <p className={`text-sm font-bold ${t.question}`}>
                        Anything else you want to add? <span className="opacity-60">(optional)</span>
                    </p>
                    <div className="space-y-3">
                        <textarea
                            value={extraContext}
                            onChange={(e) => setExtraContext(e.target.value)}
                            placeholder="Add any extra context, constraints, or thoughts…"
                            rows={3}
                            className={`w-full p-4 bg-white border-2 ${t.textarea} rounded-xl text-sm focus:ring-2 outline-none transition-all resize-none font-medium`}
                        />
                        <button
                            onClick={handleApply}
                            className={`w-full py-3 ${t.btn} text-white border rounded-xl font-black hover:opacity-90 transition-all text-xs uppercase tracking-widest shadow-md active:scale-95`}
                        >
                            Apply refinement
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
