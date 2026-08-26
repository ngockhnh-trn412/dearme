"use client";

import { Lock, Clock } from "lucide-react";
import type { Capsule, User } from "@/types";
import { formatUnlockDateTime } from "@/lib/timezone";

interface SealedCapsuleProps {
  capsule: Capsule;
  user: User | null;
  compact?: boolean;
}

export default function SealedCapsule({ capsule, user, compact }: SealedCapsuleProps) {
  if (compact) {
    return (
      <div className="w-full h-full min-h-32 rounded-lg bg-surface-hover border border-dashed border-border flex flex-col items-center justify-center gap-2 p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs font-serif text-muted italic">Sealed</p>
        {(capsule.unlockDate || capsule.targetAge) && (
          <p className="text-[10px] text-muted/80 font-serif italic leading-relaxed">
            {capsule.targetAge && user && user.age < capsule.targetAge
              ? `Until you turn ${capsule.targetAge}`
              : capsule.unlockDate
                ? `Until ${formatUnlockDateTime(capsule.unlockDate)}`
                : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 paper-texture">
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center mb-4 animate-pulse-glow">
          <Lock className="w-6 h-6 text-primary" />
        </div>

        <p className="text-xs font-medium text-primary uppercase tracking-wider font-serif mb-2">
          Sealed
        </p>

        <h2 className="text-lg font-serif text-foreground mb-2">{capsule.title}</h2>

        {(capsule.unlockDate || capsule.targetAge) && (
          <p className="text-sm text-muted font-serif italic leading-relaxed">
            {capsule.targetAge && user && user.age < capsule.targetAge && (
              <span>
                This memory is sealed until you turn {capsule.targetAge}
                {capsule.unlockDate ? `, and will open on ${formatUnlockDateTime(capsule.unlockDate)}.` : "."}
              </span>
            )}
            {(!capsule.targetAge || (user && user.age >= capsule.targetAge)) &&
              capsule.unlockDate && (
                <span>
                  This memory is sealed until{" "}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatUnlockDateTime(capsule.unlockDate)}
                  </span>
                  .
                </span>
              )}
          </p>
        )}

        <p className="text-xs text-muted/70 font-serif italic mt-3">
          Your words are safe here. They will be ready when the time comes.
        </p>
      </div>
    </div>
  );
}