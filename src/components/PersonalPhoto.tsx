"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { photoKey } from "@/lib/session";

export default function PersonalPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(photoKey());
    if (saved) setPhoto(saved);
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhoto(dataUrl);
      localStorage.setItem(photoKey(), dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemove = useCallback(() => {
    setPhoto(null);
    localStorage.removeItem(photoKey());
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-4 paper-texture">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-serif text-foreground">My Photo</h3>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {photo ? (
          <div className="relative group">
            <img
              src={photo}
              alt="Personal photo"
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-muted hover:text-foreground hover:border-primary/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-primary-muted transition-colors">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted font-serif italic">
              Click or drag to add a personal photo
            </p>
          </button>
        )}
      </div>
    </div>
  );
}
