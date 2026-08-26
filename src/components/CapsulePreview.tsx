"use client";

import { X, Feather } from "lucide-react";
import type { Capsule } from "@/types";
import { SENTIMENT_LABELS } from "@/types";
import { useSanctuary } from "@/context/SanctuaryContext";
import { isCapsuleOpenable } from "@/lib/timezone";
import SealedCapsule from "./SealedCapsule";

interface CapsulePreviewProps {
  capsule: Capsule;
  onClose: () => void;
  onOpen: () => void;
}

export default function CapsulePreview({ capsule, onClose, onOpen }: CapsulePreviewProps) {
  const { user } = useSanctuary();
  const openable = !capsule.isLocked || isCapsuleOpenable(capsule, user);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-border shadow-2xl animate-scale-in paper-texture">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 p-6">
          {openable ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center mb-4">
                <Feather className="w-6 h-6 text-primary" />
              </div>

              <h2 className="text-xl font-serif text-foreground mb-2">{capsule.title}</h2>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-muted text-primary/80 font-serif">
                  {capsule.customEmotion ?? (capsule.sentimentTag ? SENTIMENT_LABELS[capsule.sentimentTag] : "Unlabeled")}
                </span>
                <span className="text-xs text-muted font-serif">
                  Age {capsule.currentAgeAtCreation}
                </span>
              </div>

              {capsule.mediaUrl && (
                <div className="mb-4">
                  <div className="polaroid inline-block">
                    <img
                      src={capsule.mediaUrl}
                      alt={capsule.title}
                      className="max-h-40 object-cover rounded-sm"
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
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 whitespace-pre-wrap font-serif italic max-h-64 overflow-y-auto">
                  {capsule.content}
                </p>
              )}

              <button
                type="button"
                onClick={onOpen}
                className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] cursor-pointer"
              >
                Open this letter
              </button>
            </>
          ) : (
            <SealedCapsule capsule={capsule} user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
