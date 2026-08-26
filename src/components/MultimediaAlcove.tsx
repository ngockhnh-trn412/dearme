"use client";

import { Image } from "lucide-react";
import type { Capsule } from "@/types";
import { useSanctuary } from "@/context/SanctuaryContext";
import { isCapsuleOpenable } from "@/lib/timezone";
import SealedCapsule from "./SealedCapsule";

interface MultimediaAlcoveProps {
  capsules: Capsule[];
  onCapsuleClick: (capsule: Capsule) => void;
}

export default function MultimediaAlcove({ capsules, onCapsuleClick }: MultimediaAlcoveProps) {
  const { user } = useSanctuary();
  const mediaCapsules = (Array.isArray(capsules) ? capsules : []).filter((c) => c.mediaUrl);

  if (mediaCapsules.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-12 paper-texture">
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-4">
            <Image className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-serif text-foreground mb-2">The Alcove is empty</h3>
          <p className="text-sm text-muted font-serif italic">
            Preserve a photo or video and it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 paper-texture">
      <div className="relative z-10">
        <h2 className="text-lg font-serif text-foreground mb-6">The Alcove</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mediaCapsules.map((capsule) =>
            capsule.isLocked && !isCapsuleOpenable(capsule, user) ? (
              <div key={capsule.id} className="text-left group">
                <SealedCapsule capsule={capsule} user={user} compact />
                <p className="text-xs text-muted mt-2 font-serif italic truncate">
                  Sealed moment
                </p>
              </div>
            ) : (
              <button
                key={capsule.id}
                onClick={() => onCapsuleClick(capsule)}
                className="text-left group"
              >
                <div className="polaroid">
                  <img
                    src={capsule.mediaUrl}
                    alt={capsule.title}
                    className="w-full h-32 object-cover rounded-sm"
                  />
                </div>
                <p className="text-xs text-foreground mt-2 font-serif truncate">
                  {capsule.title}
                </p>
                {capsule.optionalMemoryText && (
                  <p className="text-xs text-muted mt-0.5 font-serif italic truncate">
                    {capsule.optionalMemoryText}
                  </p>
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
