"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Capsule, User, TimeThread, CreateCapsuleInput } from "@/types";
import { stateKey } from "@/lib/session";
import { getUserTimeZone } from "@/lib/timezone";

const SESSION_KEY = "sanctuary_session";

interface SanctuaryState {
  user: User | null;
  capsules: Capsule[];
  timeThreads: TimeThread[];
}

function loadState(): SanctuaryState {
  if (typeof window === "undefined") {
    return { user: null, capsules: [], timeThreads: [] };
  }
  try {
    const raw = localStorage.getItem(stateKey());
    if (!raw) return { user: null, capsules: [], timeThreads: [] };
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user
        ? { ...parsed.user, timeZone: parsed.user.timeZone ?? getUserTimeZone() }
        : null,
      capsules: Array.isArray(parsed.capsules) ? parsed.capsules : [],
      timeThreads: Array.isArray(parsed.timeThreads) ? parsed.timeThreads : [],
    };
  } catch {
    return { user: null, capsules: [], timeThreads: [] };
  }
}

function saveState(state: SanctuaryState) {
  try {
    localStorage.setItem(stateKey(), JSON.stringify(state));
  } catch {
    console.warn("Failed to save sanctuary state");
  }
}

interface SanctuaryContextValue {
  user: User | null;
  capsules: Capsule[];
  timeThreads: TimeThread[];
  hydrated: boolean;
  setUser: (user: User) => void;
  addCapsule: (input: CreateCapsuleInput) => void;
  getCapsule: (id: string) => Capsule | undefined;
  unlockCapsule: (id: string) => void;
  updateCapsule: (id: string, updates: Partial<Capsule>) => void;
  addTimeThread: (thread: { capsuleId: string; userId: string; reply: string }) => void;
  getTimeThreads: (capsuleId: string) => TimeThread[];
  refreshState: () => void;
}

const SanctuaryContext = createContext<SanctuaryContextValue | null>(null);

export function SanctuaryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SanctuaryState>({ user: null, capsules: [], timeThreads: [] });
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(loadState());
    setHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  const setUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const addCapsule = useCallback((input: CreateCapsuleInput) => {
    const now = new Date();
    const capsule: Capsule = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: input.type,
      title: input.title,
      content: input.content,
      mediaUrl: input.mediaUrl,
      optionalMemoryText: input.optionalMemoryText,
      currentAgeAtCreation: input.currentAgeAtCreation,
      targetAge: input.targetAge,
      unlockDate: input.unlockDate,
      sentimentTag: input.sentimentTag,
      customEmotion: input.customEmotion,
      isLocked: !!input.targetAge || !!input.unlockDate,
      isRead: false,
      createdAt: now.toISOString(),
    };
    setState((prev) => ({
      ...prev,
      capsules: [...(Array.isArray(prev.capsules) ? prev.capsules : []), capsule],
    }));
  }, []);

  const getCapsule = useCallback((id: string) => {
    return (Array.isArray(stateRef.current.capsules) ? stateRef.current.capsules : []).find((c) => c.id === id);
  }, []);

  const unlockCapsule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      capsules: (Array.isArray(prev.capsules) ? prev.capsules : []).map((c) =>
        c.id === id ? { ...c, isLocked: false, isRead: true } : c
      ),
    }));
  }, []);

  const updateCapsule = useCallback((id: string, updates: Partial<Capsule>) => {
    setState((prev) => ({
      ...prev,
      capsules: (Array.isArray(prev.capsules) ? prev.capsules : []).map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  }, []);

  const addTimeThread = useCallback(
    (thread: { capsuleId: string; userId: string; reply: string }) => {
      const newThread: TimeThread = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        capsuleId: thread.capsuleId,
        userId: thread.userId,
        reply: thread.reply,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        timeThreads: [...(Array.isArray(prev.timeThreads) ? prev.timeThreads : []), newThread],
      }));
    },
    []
  );

  const getTimeThreads = useCallback((capsuleId: string) => {
    return (Array.isArray(stateRef.current.timeThreads) ? stateRef.current.timeThreads : []).filter(
      (t) => t.capsuleId === capsuleId
    );
  }, []);

  return (
    <SanctuaryContext.Provider
      value={{
        user: state.user,
        capsules: state.capsules,
        timeThreads: state.timeThreads,
        hydrated,
        setUser,
        addCapsule,
        getCapsule,
        unlockCapsule,
        updateCapsule,
        addTimeThread,
        getTimeThreads,
        refreshState,
      }}
    >
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  const ctx = useContext(SanctuaryContext);
  if (!ctx) throw new Error("useSanctuary must be used within SanctuaryProvider");
  return ctx;
}
