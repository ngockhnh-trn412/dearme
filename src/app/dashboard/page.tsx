"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Feather, PenLine, LogOut, Image, HelpCircle, X, Wind, Sparkles, Star, ArrowLeft, AlertTriangle } from "lucide-react";
import { DearMeIcon } from "@/components/DearMeLogo";
import { useSanctuary } from "@/context/SanctuaryContext";
import type { Capsule } from "@/types";
import { clearSession } from "@/lib/session";
import { isCapsuleOpenable, formatUnlockDateTime } from "@/lib/timezone";
import MemoryMap from "@/components/MemoryMap";
import MultimediaAlcove from "@/components/MultimediaAlcove";
import EchoTrigger from "@/components/EchoTrigger";
import PersonalPhoto from "@/components/PersonalPhoto";
import ShadowDrawer from "@/components/DangerousBox";
import SplitView from "@/components/SplitView";

const POSITIVE_TAGS = new Set(["#grateful", "#proud", "#hopeful", "#curious"]);

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    capsules,
    getTimeThreads,
    updateCapsule,
    addTimeThread,
    hydrated,
    refreshState,
  } = useSanctuary();

  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [showSplitView, setShowSplitView] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "alcove">("map");
  const [showHelp, setShowHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Grounding / Breathing state
  const [showGroundingPrompt, setShowGroundingPrompt] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showWelcomingLights, setShowWelcomingLights] = useState(false);
  const [lockedMessage, setLockedMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hydrated && !user) {
      router.push("/");
    }
  }, [mounted, hydrated, user, router]);

  const closeSplitView = useCallback(() => {
    setShowSplitView(false);
    setSelectedCapsule(null);
  }, []);

  // Silently grant permission to open any capsule whose time has actually arrived.
  // No auto-open, no countdown displayed — the capsule simply becomes openable.
  useEffect(() => {
    if (!mounted || !hydrated || !user) return;
    capsules.forEach((c) => {
      if (c.isLocked && isCapsuleOpenable(c, user)) {
        updateCapsule(c.id, { isLocked: false });
      }
    });
  }, [mounted, hydrated, user, capsules, updateCapsule]);

  const handleCapsuleClick = useCallback(
    (capsule: Capsule) => {
      if (!user) return;

      if (capsule.isLocked && !isCapsuleOpenable(capsule, user)) {
        if (capsule.targetAge && user.age < capsule.targetAge) {
          setLockedMessage(
            capsule.unlockDate
              ? `This memory is sealed until you turn ${capsule.targetAge} — and it opens on ${formatUnlockDateTime(capsule.unlockDate)}.`
              : `This memory is sealed until you turn ${capsule.targetAge}.`
          );
        } else if (capsule.unlockDate) {
          setLockedMessage(
            `This memory is sealed until ${formatUnlockDateTime(capsule.unlockDate)}.`
          );
        } else {
          setLockedMessage("This memory is sealed.");
        }
        setTimeout(() => setLockedMessage(""), 4000);
        return;
      }

      if (capsule.isLocked) {
        updateCapsule(capsule.id, { isLocked: false, isRead: true });
        setSelectedCapsule({ ...capsule, isLocked: false, isRead: true });
      } else {
        setSelectedCapsule(capsule);
      }
      setShowSplitView(true);
    },
    [user, updateCapsule]
  );

  const handleSaveEarlyNote = useCallback(
    (note: string) => {
      if (!selectedCapsule) return;
      updateCapsule(selectedCapsule.id, { earlyUnlockNote: note });
      setSelectedCapsule((prev) => prev ? { ...prev, earlyUnlockNote: note } : null);
    },
    [selectedCapsule, updateCapsule]
  );

  const handleReply = useCallback(
    (capsuleId: string, reply: string) => {
      if (!user) return;
      addTimeThread({ capsuleId, userId: user.id, reply });
    },
    [user, addTimeThread]
  );

  const handleLogout = useCallback(() => {
    clearSession();
    refreshState();
    router.push("/");
  }, [refreshState, router]);

  // Grounding flow
  const handleRequestGrounding = useCallback(() => {
    setShowGroundingPrompt(true);
  }, []);

  const handleDeclineGrounding = useCallback(() => {
    setShowGroundingPrompt(false);
    setShowWelcomingLights(true);
  }, []);

  const handleAcceptBreathing = useCallback(() => {
    setShowGroundingPrompt(false);
    setShowBreathing(true);
  }, []);

  const handleFinishBreathing = useCallback(() => {
    setShowBreathing(false);
    setShowWelcomingLights(true);
  }, []);

  const handleBackToMap = useCallback(() => {
    setShowWelcomingLights(false);
  }, []);

  const positiveCapsules = useMemo(
    () =>
      (Array.isArray(capsules) ? capsules : []).filter(
        (c) =>
          c.sentimentTag &&
          POSITIVE_TAGS.has(c.sentimentTag) &&
          (!c.isLocked || isCapsuleOpenable(c, user))
      ),
    [capsules, user]
  );

  if (!mounted || !hydrated || !user) return null;

  const threads = selectedCapsule
    ? getTimeThreads(selectedCapsule.id)
    : [];

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DearMeIcon size={24} className="text-primary" title="Dear Me" />
            <span className="text-lg font-serif text-foreground">
              Dear Me
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-serif italic hidden sm:block">
              {user.name}, age {user.age}
            </span>
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              title="How to use Dear Me"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/write?type=letter")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.97]"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Write</span>
            </button>
            <button
              onClick={() => router.push("/write?type=media")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:bg-surface-hover transition-all"
            >
              <Image className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {activeTab === "map" && !showWelcomingLights && (
              <MemoryMap
                capsules={capsules}
                currentAge={user.age}
                onCapsuleClick={handleCapsuleClick}
              />
            )}

            {activeTab === "map" && showWelcomingLights && (
              <div className="bg-surface rounded-xl border border-border p-6 paper-texture animate-fade-in">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-serif text-foreground">
                        Lights from your peaceful moments
                      </h2>
                    </div>
                    <button
                      onClick={handleBackToMap}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-muted text-primary text-xs font-medium font-serif hover:bg-primary/20 transition-all"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back to Map
                    </button>
                  </div>

                  {positiveCapsules.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted font-serif italic">
                        No peaceful memories yet. Write something kind to yourself and it will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {positiveCapsules.map((capsule) => (
                        <button
                          key={capsule.id}
                          onClick={() => handleCapsuleClick(capsule)}
                          className="w-full text-left p-4 rounded-xl bg-surface-hover border border-border hover:border-primary/30 hover:bg-primary-muted/30 transition-all group animate-fade-in"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center shrink-0 group-hover:animate-pulse-glow">
                              <Star className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-serif text-foreground truncate">
                                {capsule.title}
                              </p>
                              <p className="text-xs text-muted font-serif italic mt-0.5 line-clamp-2">
                                {capsule.content || capsule.optionalMemoryText || "A preserved moment"}
                              </p>
                              <span className="text-xs text-primary/70 font-serif mt-1 inline-block">
                                {capsule.sentimentTag === "#grateful" && "Grateful"}
                                {capsule.sentimentTag === "#proud" && "Proud"}
                                {capsule.sentimentTag === "#hopeful" && "Hopeful"}
                                {capsule.sentimentTag === "#curious" && "Curious"}
                                &nbsp;&mdash; Age {capsule.currentAgeAtCreation}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "alcove" && (
              <MultimediaAlcove
                capsules={capsules}
                onCapsuleClick={handleCapsuleClick}
              />
            )}

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "map"
                    ? "bg-primary-muted text-primary"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Memory Map
              </button>
              <button
                onClick={() => setActiveTab("alcove")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "alcove"
                    ? "bg-primary-muted text-primary"
                    : "text-muted hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                The Alcove
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Card 1 — Send a message */}
            <div className="bg-surface rounded-xl border border-border p-4 paper-texture">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Feather className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-serif text-foreground">
                    Send a message
                  </h3>
                </div>
                <p className="text-xs text-muted mb-3 font-serif italic">
                  Write a letter to your future self.
                </p>
                <button
                  onClick={() => router.push("/write?type=letter")}
                  className="w-full py-2 px-3 rounded-lg bg-primary-muted text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                >
                  New letter
                </button>
              </div>
            </div>

            {/* Card 2 — Having a hard day? */}
            <EchoTrigger onRequestGrounding={handleRequestGrounding} />

            {/* Card 3 — Personal Photo */}
            <PersonalPhoto />

            {/* Card 4 — The Shadow Drawer */}
            <ShadowDrawer />
          </div>
        </div>

        {/* Locked message toast */}
        {lockedMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-900/80 border border-red-700/50 text-sm text-red-200 font-serif shadow-2xl backdrop-blur-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{lockedMessage}</span>
            </div>
          </div>
        )}

        {/* Crisis resource footer */}
        <div className="border-t border-border mt-12 py-6 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-xs text-muted font-serif italic leading-relaxed">
              If you are in crisis or experiencing thoughts of self-harm, please reach out for support:{" "}
              <a
                href="https://988lifeline.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover underline underline-offset-2"
              >
                988 Suicide &amp; Crisis Lifeline
              </a>
              {" "}&mdash; Call or text 988 (US).
            </p>
          </div>
        </div>

        {/* SplitView overlay */}
        {showSplitView && selectedCapsule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
              onClick={closeSplitView}
            />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl border border-border shadow-2xl animate-scale-in paper-texture">
              <button
                onClick={closeSplitView}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-surface-hover text-muted hover:text-foreground hover:bg-border transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-4 sm:p-6">
                <SplitView
                  capsule={selectedCapsule}
                  threads={threads}
                  onReply={handleReply}
                  onSaveEarlyNote={handleSaveEarlyNote}
                />
              </div>
            </div>
          </div>
        )}

        {/* Grounding prompt overlay */}
        {showGroundingPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
              onClick={handleDeclineGrounding}
            />
            <div className="relative max-w-md w-full bg-surface rounded-2xl border border-border shadow-2xl animate-scale-in p-8 paper-texture text-center">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-5">
                  <Wind className="w-7 h-7 text-primary" />
                </div>
                <p className="text-base text-foreground font-serif italic mb-6 leading-relaxed">
                  Not feeling calm? Would you like a short exercise to help you feel more grounded?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptBreathing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium font-serif hover:bg-primary-hover transition-all active:scale-[0.98]"
                  >
                    Yes, please
                  </button>
                  <button
                    onClick={handleDeclineGrounding}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border text-muted text-sm font-medium font-serif hover:text-foreground hover:bg-surface-hover transition-all"
                  >
                    No, thank you
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breathing lantern overlay */}
        {showBreathing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div className="relative flex flex-col items-center gap-8 animate-fade-in">
              <p className="text-sm text-primary font-serif italic tracking-wider">
                Breathe with the lantern
              </p>

              <div className="w-48 h-48 rounded-full bg-primary-muted border border-primary/40 animate-breathe-lantern flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Wind className="w-10 h-10 text-primary" />
                </div>
              </div>

              <p className="text-xs text-muted font-serif italic max-w-xs text-center leading-relaxed">
                Inhale for 4 seconds &mdash; Hold for 7 seconds &mdash; Exhale for 8 seconds
              </p>

              <button
                onClick={handleFinishBreathing}
                className="px-6 py-2 rounded-xl bg-primary-muted text-primary text-xs font-medium font-serif hover:bg-primary/20 transition-all"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Help Guide Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowHelp(false)}
          />
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full animate-scale-in p-8 paper-texture max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-full bg-primary-muted flex items-center justify-center mb-5 mx-auto">
                <DearMeIcon size={32} className="text-primary" />
              </div>

              <h2 className="text-2xl font-serif text-foreground text-center mb-6">
                Welcome to Dear Me
              </h2>

              <div className="space-y-5 text-sm text-foreground/85 leading-relaxed font-serif">
                <p className="italic">
                  This is a quiet space to send thoughts, photographs, and
                  feelings to different versions of yourself.
                </p>

                <div className="bg-surface-hover rounded-xl p-4 space-y-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">✉️</span>
                    <div>
                      <p className="font-medium text-foreground mb-0.5">Click a star to preview a memory</p>
                      <p className="text-xs text-muted italic">
                        Choose an icon on your map to view a past memory. A preview will appear. Click &ldquo;Open this letter&rdquo; to read it in full.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🔒</span>
                    <div>
                      <p className="font-medium text-foreground mb-0.5">Seal a message for the future</p>
                      <p className="text-xs text-muted italic">
                        Write a new letter or capture a moment and lock it away for a specific age or date.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🌊</span>
                    <div>
                      <p className="font-medium text-foreground mb-0.5">The Echo</p>
                      <p className="text-xs text-muted italic">
                        If you are having a heavy day, click &ldquo;I&apos;m having a hard day&rdquo; to let your resilient past self whisper an Echo of hope back to you.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🖼️</span>
                    <div>
                      <p className="font-medium text-foreground mb-0.5">The Alcove</p>
                      <p className="text-xs text-muted italic">
                        Switch to The Alcove tab to browse preserved photos and videos.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted text-center italic pt-2 border-t border-border/50">
                  Your words travel across time. Write gently.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
