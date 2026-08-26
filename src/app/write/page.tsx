"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Lock, Globe, Camera, Upload, X, MessageSquare } from "lucide-react";
import { useSanctuary } from "@/context/SanctuaryContext";
import { SENTIMENT_TAGS, SENTIMENT_LABELS } from "@/types";
import type { SentimentTag, CapsuleType } from "@/types";
import TriggerReminder from "@/components/TriggerReminder";

function localDatetimeNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, addCapsule, hydrated } = useSanctuary();

  const capsuleType = (searchParams.get("type") as CapsuleType) || "letter";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sentimentTag, setSentimentTag] = useState<SentimentTag | "other" | null>(null);
  const [customEmotion, setCustomEmotion] = useState("");
  const [deliveryType, setDeliveryType] = useState<"today" | "targetAge" | "targetDate">("today");
  const [targetAge, setTargetAge] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [optionalMemoryText, setOptionalMemoryText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hydrated && !user) {
      router.push("/");
    }
  }, [mounted, hydrated, user, router]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    },
    [title]
  );

  const handleSubmit = useCallback(() => {
    if (!user) return;
    if (capsuleType === "letter" && (!title.trim() || !content.trim())) return;
    if (capsuleType === "media" && !mediaUrl) return;

    addCapsule({
      type: capsuleType,
      title: title.trim() || "A moment preserved",
      content: content.trim(),
      mediaUrl: mediaUrl || undefined,
      optionalMemoryText: optionalMemoryText.trim() || undefined,
      currentAgeAtCreation: user.age,
      targetAge: deliveryType === "targetAge" ? parseInt(targetAge, 10) : undefined,
      unlockDate: deliveryType === "targetDate" ? targetDate : undefined,
      sentimentTag: sentimentTag !== "other" ? sentimentTag ?? undefined : undefined,
      customEmotion: sentimentTag === "other" ? customEmotion.trim() : undefined,
    });

    setSubmitted(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }, [
    user, capsuleType, title, content, mediaUrl, optionalMemoryText,
    deliveryType, targetAge, targetDate, sentimentTag, customEmotion, addCapsule, router,
  ]);

  if (!mounted || !hydrated || !user) return null;

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary-muted flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif text-foreground mb-2">
            {capsuleType === "media" ? "Moment preserved" : "Letter sealed"}
          </h2>
          <p className="text-sm text-muted font-serif italic">
            Your words are on their way through time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors mb-6 font-serif"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <h1 className="text-2xl font-serif text-foreground mb-6">
        {capsuleType === "media"
          ? "Preserve a moment"
          : "Write to your future self"}
      </h1>

      <div className="space-y-5">
        {capsuleType === "media" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!mediaUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 text-muted hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-serif">Drop a photo or video</span>
                <span className="text-xs">or click to browse</span>
              </button>
            ) : (
              <div className="relative">
                <div className="polaroid inline-block">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-sm"
                  />
                </div>
                <button
                  onClick={() => setMediaUrl("")}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <label className="flex items-center gap-1.5 text-xs text-muted mb-2 font-serif">
                <MessageSquare className="w-3 h-3" />
                What do you want to remember about this exact moment?
              </label>
              <textarea
                value={optionalMemoryText}
                onChange={(e) => setOptionalMemoryText(e.target.value)}
                placeholder="Optional — just a sentence or a deep story..."
                rows={3}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic resize-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5 font-serif">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              capsuleType === "media"
                ? "Name this moment..."
                : "What is this letter about?"
            }
            className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {capsuleType === "letter" && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 font-serif">
              Your letter
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dear me,..."
              rows={8}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic resize-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <div className="mt-2">
              <TriggerReminder text={content} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5 font-serif">
            How are you feeling right now? <span className="text-muted italic">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SENTIMENT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => { setSentimentTag(tag); setCustomEmotion(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sentimentTag === tag
                    ? "bg-primary-muted text-primary border-primary/30"
                    : "bg-surface-hover text-muted border-border hover:border-primary/20 hover:text-foreground"
                }`}
              >
                {SENTIMENT_LABELS[tag]}
              </button>
            ))}
            <button
              onClick={() => { setSentimentTag("other"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                sentimentTag === "other"
                  ? "bg-primary-muted text-primary border-primary/30"
                  : "bg-surface-hover text-muted border-border hover:border-primary/20 hover:text-foreground"
              }`}
            >
              Other
            </button>
          </div>
          {sentimentTag === "other" && (
            <div className="mt-3 animate-fade-in">
              <input
                type="text"
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                placeholder="Name your feeling..."
                className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5 font-serif">
            When should this unlock?
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { value: "today", label: "Today", icon: Globe },
              { value: "targetAge", label: "At a specific age", icon: Lock },
              { value: "targetDate", label: "On a date & time", icon: Lock },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDeliveryType(opt.value as typeof deliveryType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  deliveryType === opt.value
                    ? "bg-primary-muted text-primary border-primary/30"
                    : "bg-surface-hover text-muted border-border hover:border-primary/20 hover:text-foreground"
                }`}
              >
                <opt.icon className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
          </div>

          {deliveryType === "targetAge" && (
            <div className="animate-fade-in">
              <label className="block text-xs text-muted mb-1 font-serif">
                At what age should this unlock?
              </label>
              <input
                type="number"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                placeholder={`Enter age (you are currently ${user.age})`}
                min={user.age + 1}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted/50 font-serif italic outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

          {deliveryType === "targetDate" && (
            <div className="animate-fade-in">
              <label className="block text-xs text-muted mb-1 font-serif">
                On what date and time should this unlock?
              </label>
              <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={localDatetimeNow()}
                className="w-full py-2.5 px-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {targetDate && new Date(targetDate).getTime() <= Date.now() && (
                <p className="text-xs text-red-400 font-serif italic mt-1.5">
                  Please choose a moment in the future — your memory will stay sealed until then.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={
            capsuleType === "letter"
              ? !title.trim() || !content.trim()
              : !mediaUrl
          }
          className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          {capsuleType === "media"
            ? "Preserve this moment"
            : deliveryType === "today"
              ? "Save to your map"
              : "Seal and lock"}
        </button>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted font-serif italic">Loading...</p>
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
