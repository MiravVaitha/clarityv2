"use client";

import { useEffect, useState, useRef } from "react";
import { ClarifyOutput, ClarifyOutputSchema, ClarityMode } from "@/lib/schemas";
import { useLocalStorage } from "@/hooks/use-local-storage";
import ClarityResults from "@/components/ClarityCard";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import CollapsibleSection from "@/components/CollapsibleSection";
import RefinementFlow from "@/components/RefinementFlow";
import { stableHash, getCachedResult, setCachedResult, clearExpiredCache } from "@/lib/aiCache";
import { apiClient, APIError } from "@/lib/api-client";
import ConfirmationModal from "@/components/ConfirmationModal";

interface ClarityStoredData {
    requestHash: string;
    result: ClarifyOutput;
}

interface RateLimitInfo {
    retryAfterSeconds: number;
    countdown: number;
}

interface ClarityExample {
    id: string;
    label: string;
    mode: ClarityMode;
    inputText: string;
}

const CLARITY_EXAMPLES: ClarityExample[] = [
    {
        id: "burnout",
        label: "Burnout Triage",
        mode: "overwhelm",
        inputText: "I have 12 overlapping deadlines, my inbox is at 400 unread, two team members are out sick, and I'm supposed to present a strategy doc tomorrow that I haven't started. I feel paralyzed and don't know where to begin."
    },
    {
        id: "career-pivot",
        label: "Career Pivot",
        mode: "decision",
        inputText: "I've been a software engineer for 8 years but I'm feeling unfulfilled. I have an offer to move into Product Management at my current company, or I could take a senior dev role at a high-growth startup for more equity but higher risk."
    },
    {
        id: "project-launch",
        label: "Project Launch",
        mode: "plan",
        inputText: "We need to launch the new mobile app by October 1st. We have the design ready, but the backend is only 40% done, and we haven't started QA or the marketing campaign. We need a realistic path to hitting the date."
    },
    {
        id: "board-prep",
        label: "Board Presentation",
        mode: "message_prep",
        inputText: "I need to present our quarterly growth numbers to the board of directors. The numbers are mostly good, but we missed our churn target. I need to explain why this happened and what we are doing to fix it without losing their confidence."
    },
    {
        id: "startup-pivot",
        label: "Startup Pivot",
        mode: "plan",
        inputText: "Our social media app isn't gaining traction with teens as expected, but high-end interior designers are using it for mood boards. We need to pivot the entire product strategy to serve this new niche in 30 days."
    },
];

export default function ClarityPage() {
    const [inputText, setInputText] = useLocalStorage<string>("clarity_input", "");
    const [mode, setMode] = useLocalStorage<ClarityMode>("clarity_mode", "overwhelm");
    const [storedData, setStoredData] = useLocalStorage<ClarityStoredData | null>("clarity_stored_data", null);

    const [clarityData, setClarityData] = useState<ClarifyOutput | null>(null);
    const [lastExampleId, setLastExampleId] = useLocalStorage<string | null>("clarity_last_example_id", null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
    const [retryStatus, setRetryStatus] = useState<{ attempt: number; maxRetries: number } | null>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    // Increment to reset RefinementFlow key when regenerating
    const [refinementKey, setRefinementKey] = useState(0);

    const [isClient, setIsClient] = useState(false);
    const hasHydrated = useRef(false);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const computeBaseHash = async (textToHash: string, modeToHash: ClarityMode) => {
        return await stableHash({ mode: modeToHash, text: textToHash });
    };

    useEffect(() => {
        setIsClient(true);
        clearExpiredCache();

        if (hasHydrated.current) return;

        const restore = async () => {
            if (!storedData) return;
            const currentHash = await computeBaseHash(inputText, mode);
            if (storedData.requestHash === currentHash) {
                setClarityData(storedData.result);
            }
            hasHydrated.current = true;
        };

        restore();
    }, [inputText, mode, storedData]);

    // Countdown timer for rate limit
    useEffect(() => {
        if (rateLimitInfo && rateLimitInfo.countdown > 0) {
            countdownIntervalRef.current = setInterval(() => {
                setRateLimitInfo(prev => {
                    if (!prev || prev.countdown <= 1) {
                        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                        return null;
                    }
                    return { ...prev, countdown: prev.countdown - 1 };
                });
            }, 1000);
            return () => {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            };
        }
    }, [rateLimitInfo]);

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            setError("Please enter some thoughts first.");
            return;
        }
        if (isLoading) return;

        const request = { mode, text: inputText };

        setIsLoading(true);
        setError(null);
        setRateLimitInfo(null);
        setRetryStatus(null);

        try {
            const cacheKey = await stableHash(request);
            const cached = getCachedResult(cacheKey);
            if (cached) {
                setClarityData(cached.data);
                const currentHash = await computeBaseHash(inputText, mode);
                setStoredData({ requestHash: currentHash, result: cached.data });
                setRefinementKey(k => k + 1);
                setIsLoading(false);
                return;
            }

            const data = await apiClient<ClarifyOutput>("/api/clarify", { action: "generate", ...request }, {
                onRetry: (attempt, maxRetries) => setRetryStatus({ attempt, maxRetries })
            });
            const currentHash = await computeBaseHash(inputText, mode);
            setStoredData({ requestHash: currentHash, result: data });
            setClarityData(data);
            setRefinementKey(k => k + 1);
            setCachedResult(cacheKey, data);
        } catch (err: any) {
            if (err.errorType === "RATE_LIMIT") {
                const retryAfter = err.retryAfterSeconds || 60;
                setRateLimitInfo({ retryAfterSeconds: retryAfter, countdown: retryAfter });
                setError(err.message);
            } else {
                setError(err.message || "Failed to generate clarity assessment");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyRefinement = async (answers: [string, string, string], extraContext: string) => {
        if (!clarityData || !inputText.trim()) return;

        setIsRefining(true);
        setError(null);

        try {
            const data = await apiClient<ClarifyOutput>("/api/clarify", {
                action: "refine",
                mode,
                text: inputText,
                refining_answers: answers,
                extra_context: extraContext || undefined,
                prior_output: clarityData,
            }, {
                onRetry: (attempt, maxRetries) => setRetryStatus({ attempt, maxRetries })
            });
            const currentHash = await computeBaseHash(inputText, mode);
            setStoredData({ requestHash: currentHash, result: data });
            setClarityData(data);
        } catch (err: any) {
            if (err.errorType === "RATE_LIMIT") {
                const retryAfter = err.retryAfterSeconds || 60;
                setRateLimitInfo({ retryAfterSeconds: retryAfter, countdown: retryAfter });
                setError(err.message);
            } else {
                setError(err.message || "Failed to apply refinement");
            }
        } finally {
            setIsRefining(false);
            setRetryStatus(null);
        }
    };

    const clearSession = () => {
        setInputText("");
        setClarityData(null);
        setStoredData(null);
        setRefinementKey(0);
        setIsResetModalOpen(false);
    };

    const fillExample = () => {
        let available = CLARITY_EXAMPLES;
        if (lastExampleId) {
            available = CLARITY_EXAMPLES.filter(ex => ex.id !== lastExampleId);
        }
        const randomExample = available[Math.floor(Math.random() * available.length)];
        setClarityData(null);
        setStoredData(null);
        setError(null);
        setRefinementKey(0);
        setInputText(randomExample.inputText);
        setMode(randomExample.mode);
        setLastExampleId(randomExample.id);
    };

    if (!isClient) return null;

    const leftContent = (
        <div className="space-y-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-bg-heading flex items-center gap-3">
                    <span className="w-2 md:w-3 h-8 bg-blue-600 rounded-full"></span>
                    Clarity Engine
                </h1>
                <p className="text-on-bg-body text-sm md:text-base">Cut through the noise. Get strategic clarity.</p>
            </header>

            {/* Inputs in Accordion for Mobile */}
            <div className="lg:hidden">
                <CollapsibleSection title="Settings" variant="blue" defaultOpen={!clarityData}>
                    <div className="space-y-6 pt-2">
                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-bg-muted">Analysis Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "decision" as ClarityMode, label: "Decision", icon: "⚖️" },
                                    { id: "plan" as ClarityMode, label: "Plan", icon: "📋" },
                                    { id: "overwhelm" as ClarityMode, label: "Overwhelm", icon: "🌊" },
                                    { id: "message_prep" as ClarityMode, label: "Message Prep", icon: "🎯" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`p-3 text-left rounded-xl border transition-all ${mode === m.id
                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "bg-white/80 border-white/40 text-slate-900 hover:bg-white/100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{m.icon}</span>
                                            <span className="font-bold text-xs uppercase tracking-wider">{m.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-bg-muted">Your Thoughts</label>
                                <button onClick={fillExample} className="text-[10px] font-bold text-blue-400 uppercase hover:underline">Use Example</button>
                            </div>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Unpack your brain here..."
                                className="w-full h-40 p-4 bg-white/80 border border-white/40 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white/100 outline-none transition-all resize-none text-sm leading-relaxed text-slate-950 font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </CollapsibleSection>
            </div>

            {/* Desktop Inputs (Not collapsed) */}
            <div className="hidden lg:block space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-bg-muted">Analysis Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: "decision" as ClarityMode, label: "Decision", icon: "⚖️", desc: "Compare" },
                            { id: "plan" as ClarityMode, label: "Plan", icon: "📋", desc: "Execution" },
                            { id: "overwhelm" as ClarityMode, label: "Overwhelm", icon: "🌊", desc: "Triage" },
                            { id: "message_prep" as ClarityMode, label: "Message Prep", icon: "🎯", desc: "Strategy" },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`p-4 text-left rounded-2xl border transition-all ${mode === m.id
                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]"
                                    : "bg-white/80 border-white/40 text-slate-900 hover:bg-white/100 hover:border-white/60"
                                    }`}
                            >
                                <span className="text-xl block mb-1">{m.icon}</span>
                                <span className="font-black text-xs uppercase tracking-widest">{m.label}</span>
                                <p className={`text-[10px] font-bold ${mode === m.id ? "text-blue-100" : "text-slate-600"}`}>{m.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-bg-muted">Your Thoughts</label>
                        <button onClick={fillExample} className="text-[10px] font-bold text-blue-400 uppercase hover:underline flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Use Example
                        </button>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Unpack your brain here..."
                        className="w-full h-64 p-5 bg-white/80 border border-white/40 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-600 focus:bg-white/100 outline-none transition-all resize-none text-base leading-relaxed text-slate-950 font-medium placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || isRefining || !!rateLimitInfo}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {retryStatus
                                ? `Service busy — retrying (${retryStatus.attempt} of ${retryStatus.maxRetries})...`
                                : "Generating..."}
                        </>
                    ) : rateLimitInfo ? (
                        `Cooldown: ${rateLimitInfo.countdown}s`
                    ) : (
                        clarityData ? "Regenerate Clarity" : "Generate Clarity"
                    )}
                </button>

                {error && !isLoading && !rateLimitInfo && (
                    <button
                        onClick={handleGenerate}
                        className="w-full py-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Try Again
                    </button>
                )}
                {clarityData && (
                    <button onClick={() => setIsResetModalOpen(true)} className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                        Reset Session
                    </button>
                )}
            </div>

            <ConfirmationModal
                isOpen={isResetModalOpen}
                title="Reset session?"
                message="This will clear your current input, results, and refining questions."
                confirmLabel="Reset session"
                onConfirm={clearSession}
                onCancel={() => setIsResetModalOpen(false)}
                variant="destructive"
            />
        </div>
    );

    const rightContent = (
        <div className="space-y-6">
            {clarityData ? (
                <>
                    <ClarityResults key={storedData?.requestHash} data={clarityData} />

                    {/* 3-step Refinement Flow */}
                    {clarityData.refining_questions && clarityData.refining_questions.length >= 3 && (
                        <RefinementFlow
                            key={refinementKey}
                            questions={clarityData.refining_questions}
                            onApply={handleApplyRefinement}
                            onReset={() => { }}
                            isLoading={isRefining}
                            themeColor="blue"
                        />
                    )}
                </>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 glass-light !bg-white/10 !border-dashed !border-white/20">
                    <div className="w-16 h-16 mb-6 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl shadow-sm">⚡</div>
                    <h3 className="font-bold text-white mb-2">Ready for Clarity?</h3>
                    <p className="text-white/60 text-sm max-w-xs">Enter your thoughts on the left to generate a strategic breakdown.</p>
                </div>
            )}
        </div>
    );

    return (
        <ResponsiveLayout
            leftContent={leftContent}
            rightContent={rightContent}
            hasResults={!!clarityData}
            themeColor="blue"
        />
    );
}
