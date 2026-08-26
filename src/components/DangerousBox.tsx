"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Archive, Check } from "lucide-react";
import { triggerKey } from "@/lib/session";

function loadWords(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(triggerKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWords(words: string[]) {
  try {
    localStorage.setItem(triggerKey(), JSON.stringify(words));
  } catch {
    console.warn("Failed to save trigger words");
  }
}

export function getTriggerWords(): string[] {
  return loadWords();
}

export default function ShadowDrawer() {
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [swallowed, setSwallowed] = useState(false);
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = loadWords();
    setWords(saved);
    setCount(saved.length);
  }, []);

  useEffect(() => {
    if (mounted) saveWords(words);
  }, [words, mounted]);

  const lockWord = useCallback(() => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || words.includes(trimmed)) return;
    setWords((prev) => {
      const next = [...prev, trimmed];
      setCount(next.length);
      return next;
    });
    setInput("");
    setSwallowed(true);
    setTimeout(() => setSwallowed(false), 1200);
    inputRef.current?.focus();
  }, [input, words]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        lockWord();
      }
    },
    [lockWord]
  );

  if (!mounted) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-4 paper-texture">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Archive className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm font-serif text-foreground flex-1">
            The Shadow Drawer
          </h3>
          {count > 0 && (
            <span className="text-xs text-muted font-serif">{count} locked</span>
          )}
        </div>

        <p className="text-xs text-muted mb-3 font-serif italic leading-relaxed">
          Type an unkind word you say to yourself. Press Enter to lock it away
          in the dark where it cannot hurt you.
        </p>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSwallowed(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Lock away an unkind word here..."
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-surface-hover border border-border text-xs text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/40 transition-all"
          />
          <button
            onClick={lockWord}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg bg-primary-muted text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-5 mt-2 flex items-center justify-center">
          {swallowed && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary font-serif italic animate-fade-in">
              <Check className="w-3 h-3" />
              Locked away
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
