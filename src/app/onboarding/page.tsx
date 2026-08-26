"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DearMeIcon } from "@/components/DearMeLogo";
import { useSanctuary } from "@/context/SanctuaryContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useSanctuary();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    const ageNum = parseInt(age, 10) || 0;
    setUser({
      id: crypto.randomUUID?.() ?? `user-${Date.now()}`,
      name: name.trim(),
      age: ageNum,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
    router.push("/dashboard");
  }, [name, age, setUser, router]);

  if (!mounted) return null;
  if (user) return null;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-2xl border border-border p-8 paper-texture animate-scale-in">
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-primary-muted flex items-center justify-center mb-5 mx-auto">
              <DearMeIcon size={32} className="text-primary" />
            </div>

            <h1 className="text-2xl font-serif text-foreground text-center mb-2">
              Welcome to Dear Me
            </h1>
            <p className="text-sm text-muted text-center mb-6 font-serif italic">
              A quiet space to write across time.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1 font-serif">
                  What would you like us to call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What would you like us to call you?"
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1 font-serif">
                  How old are you?
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age..."
                  min={1}
                  max={150}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                Begin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
