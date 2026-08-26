"use client";

import { useState, useCallback } from "react";
import { MessageSquare, Send, Clock, User, Sparkles, BookOpen } from "lucide-react";
import type { Capsule, TimeThread } from "@/types";
import { SENTIMENT_LABELS } from "@/types";
import { useSanctuary } from "@/context/SanctuaryContext";
import { isCapsuleOpenable } from "@/lib/timezone";
import SealedCapsule from "./SealedCapsule";

interface SplitViewProps {
  capsule: Capsule;
  threads: TimeThread[];
  onReply: (capsuleId: string, reply: string) => void;
  onSaveEarlyNote?: (note: string) => void;
}

export default function SplitView({ capsule, threads, onReply, onSaveEarlyNote }: SplitViewProps) {
  const { user } = useSanctuary();
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [earlyNote, setEarlyNote] = useState(capsule.earlyUnlockNote ?? "");
  const [noteSaved, setNoteSaved] = useState(!!capsule.earlyUnlockNote);

  if (capsule.isLocked && !isCapsuleOpenable(capsule, user)) {
    return <SealedCapsule capsule={capsule} user={user} />;
  }

  const handleSend = useCallback(() => {
    if (!reply.trim()) return;
    onReply(capsule.id, reply);
    setReply("");
    setSent(true);
  }, [reply, capsule.id, onReply]);

  const handleSaveNote = useCallback(() => {
    if (onSaveEarlyNote) onSaveEarlyNote(earlyNote);
    setNoteSaved(true);
  }, [earlyNote, onSaveEarlyNote]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-6 flex flex-col paper-texture">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider font-serif">
                Past — Age {capsule.currentAgeAtCreation}
              </span>
            </div>

            <h2 className="text-lg font-serif text-foreground mb-2">{capsule.title}</h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-muted text-primary/80 font-serif">
                {capsule.customEmotion ?? (capsule.sentimentTag ? SENTIMENT_LABELS[capsule.sentimentTag] : "Unlabeled")}
              </span>
              <span className="text-xs text-muted">
                {new Date(capsule.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {capsule.mediaUrl && (
              <div className="mb-4">
                <div className="polaroid inline-block">
                  <img
                    src={capsule.mediaUrl}
                    alt={capsule.title}
                    className="max-h-48 object-cover rounded-sm"
                  />
                </div>
                {capsule.optionalMemoryText && (
                  <p className="text-xs text-muted mt-2 font-serif italic">
                    &ldquo;{capsule.optionalMemoryText}&rdquo;
                  </p>
                )}
              </div>
            )}

            {capsule.content && (
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-serif italic">
                  {capsule.content}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 flex flex-col paper-texture">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider font-serif">
                Present
              </span>
            </div>

            <h3 className="text-sm font-serif text-foreground mb-4 italic">
              Your younger self asked you a question in this memory!
            </h3>

            {threads.length > 0 && (
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="p-3 rounded-lg bg-surface-hover border border-border animate-fade-in"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary font-medium font-serif">
                        You (present)
                      </span>
                      <span className="text-xs text-muted ml-auto">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed font-serif italic">
                      {thread.reply}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!sent ? (
              <div className="mt-auto">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply to your past self..."
                  className="w-full h-28 p-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 resize-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-serif italic"
                />
                <button
                  onClick={handleSend}
                  disabled={!reply.trim()}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            ) : (
              <div className="mt-auto p-4 rounded-xl bg-unlocked/10 border border-unlocked/20 text-center animate-scale-in">
                <MessageSquare className="w-5 h-5 text-unlocked mx-auto mb-2" />
                <p className="text-sm font-serif text-foreground">
                  Your reply has been saved
                </p>
                <p className="text-xs text-muted mt-1 font-serif italic">
                  This thread is now part of your conversation!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {(capsule.targetAge || capsule.unlockDate) && (
        <div className="bg-surface rounded-xl border border-border p-5 paper-texture animate-fade-in">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-serif text-foreground">
                You opened this capsule early
              </h3>
            </div>
            <p className="text-xs text-muted mb-3 font-serif italic">
              Would you like to write a note to yourself explaining what brought you here today?
            </p>
            <textarea
              value={earlyNote}
              onChange={(e) => setEarlyNote(e.target.value)}
              placeholder="Optional — a few words about why you needed to read this now..."
              rows={3}
              className="w-full p-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 resize-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-serif italic"
            />
            <div className="flex justify-end mt-3">
              {!noteSaved ? (
                <button
                  onClick={handleSaveNote}
                  disabled={!earlyNote.trim()}
                  className="px-4 py-2 rounded-lg bg-primary-muted text-primary text-xs font-medium hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Save note
                </button>
              ) : (
                <span className="text-xs text-unlocked font-serif italic">
                  Note saved &mdash; it travels with this memory.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
