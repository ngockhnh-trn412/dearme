"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { getTriggerWords } from "./DangerousBox";

interface TriggerReminderProps {
  text: string;
}

export default function TriggerReminder({ text }: TriggerReminderProps) {
  const [triggerWords, setTriggerWords] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTriggerWords(getTriggerWords());
  }, []);

  const hasTrigger = useMemo(() => {
    if (triggerWords.length === 0 || !text) return false;
    const lower = text.toLowerCase();
    return triggerWords.some((word) => lower.includes(word));
  }, [text, triggerWords]);

  useEffect(() => {
    if (hasTrigger) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [hasTrigger]);

  if (!visible || triggerWords.length === 0) return null;

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-xl bg-primary-muted border border-primary/20 transition-all duration-500 ${
        hasTrigger
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <p className="text-xs text-foreground/80 font-serif italic leading-relaxed">
       Take a deep breath &mdash;
        remember not to be too hard on yourself...
      </p>
    </div>
  );
}
