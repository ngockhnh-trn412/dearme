"use client";

import { use, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { useSanctuary } from "@/context/SanctuaryContext";
import type { Capsule } from "@/types";
import { isCapsuleOpenable, formatUnlockDateTime } from "@/lib/timezone";
import SplitView from "@/components/SplitView";
import SealedCapsule from "@/components/SealedCapsule";

export default function LetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, getCapsule, getTimeThreads, updateCapsule, addTimeThread, hydrated } =
    useSanctuary();

  const [capsule, setCapsule] = useState<Capsule | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !hydrated) return;
    if (!user) {
      router.push("/");
      return;
    }
    const cap = getCapsule(id);
    if (!cap) {
      setCapsule(undefined);
      return;
    }
    // A locked capsule only opens once its scheduled time has actually arrived.
    // Never unlock early — refreshing or reopening must not bypass the seal.
    if (cap.isLocked && isCapsuleOpenable(cap, user)) {
      updateCapsule(id, { isLocked: false, isRead: true });
      setCapsule({ ...cap, isLocked: false, isRead: true });
    } else {
      setCapsule(cap);
    }
  }, [mounted, hydrated, user, router, id, getCapsule, isCapsuleOpenable, updateCapsule]);

  const handleReply = useCallback(
    (capsuleId: string, reply: string) => {
      if (!user) return;
      addTimeThread({ capsuleId, userId: user.id, reply });
    },
    [user, addTimeThread]
  );

  const handleSaveEarlyNote = useCallback(
    (note: string) => {
      updateCapsule(id, { earlyUnlockNote: note });
    },
    [id, updateCapsule]
  );

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted font-serif italic">Loading...</p>
      </div>
    );
  }

  if (!user || !capsule) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted font-serif italic">Memory not found.</p>
      </div>
    );
  }

  const threads = getTimeThreads(capsule.id);

  if (capsule.isLocked) {
    return (
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-6 font-serif"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to your map
        </button>
        <SealedCapsule capsule={capsule} user={user} />
        {capsule.unlockDate && (
          <p className="text-xs text-muted font-serif italic text-center mt-4 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Opens {formatUnlockDateTime(capsule.unlockDate)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-6 font-serif"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to your map
      </button>

      <SplitView
        capsule={capsule}
        threads={threads}
        onReply={handleReply}
        onSaveEarlyNote={handleSaveEarlyNote}
      />
    </div>
  );
}
