"use client";

import { Heart } from "lucide-react";
import { useSanctuary } from "@/context/SanctuaryContext";

interface EchoTriggerProps {
  onRequestGrounding: () => void;
}

export default function EchoTrigger({ onRequestGrounding }: EchoTriggerProps) {
  const { user } = useSanctuary();

  return (
    <div className="bg-surface rounded-xl border border-border p-4 paper-texture">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-serif text-foreground">Having a hard day?</h3>
        </div>
        <p className="text-xs text-muted mb-3 font-serif italic">
          Let little {user?.name ?? "you"} send a message of hope back to right now.
        </p>
        <button
          onClick={onRequestGrounding}
          className="w-full py-2 px-3 rounded-lg bg-primary-muted text-primary text-xs font-medium hover:bg-primary/20 transition-all"
        >
          I&apos;m having a hard day
        </button>
      </div>
    </div>
  );
}
