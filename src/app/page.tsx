"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSanctuary } from "@/context/SanctuaryContext";
import { getSession, setSession, findAccount, saveAccount } from "@/lib/session";
import { DearMeIcon } from "@/components/DearMeLogo";
import { seedDemoAccount } from "@/lib/demo";

type AuthMode = "login" | "register";

export default function LandingPage() {
  const router = useRouter();
  const { hydrated, refreshState } = useSanctuary();
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hydrated && getSession()) {
      router.replace("/dashboard");
    }
  }, [mounted, hydrated, router]);

  const openAuth = useCallback((next: AuthMode) => {
    setMode(next);
    setError("");
    setUsername("");
    setPassword("");
    setDisplayName("");
    setAuthOpen(true);
  }, []);

const switchMode = useCallback(() => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  }, []);

  const handleDemo = useCallback(() => {
    const demoUser = seedDemoAccount();
    setSession(demoUser);
    refreshState();
    router.push("/dashboard");
  }, [refreshState, router]);

  const handleSubmit = useCallback(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password) {
      setError("Please enter both a username and a password.");
      return;
    }

    if (mode === "register") {
      if (!displayName.trim()) {
        setError("Please enter a display name.");
        return;
      }
      if (findAccount(trimmed)) {
        setError("That username is already taken.");
        return;
      }
      saveAccount({ username: trimmed, password, displayName: displayName.trim() });
      setSession(trimmed);
      refreshState();
      router.push("/onboarding");
      return;
    }

    const account = findAccount(trimmed);
    if (!account) {
      setError("This username is not registered. Create an account to get started.");
      return;
    }
    if (account.password !== password) {
      setError("Incorrect password.");
      return;
    }
    setSession(trimmed);
    refreshState();
    router.push("/dashboard");
  }, [username, password, displayName, mode, refreshState, router]);

  if (!mounted || !hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #c9a96e 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="animate-float">
          <DearMeIcon size={128} className="text-primary" title="Dear Me" />
        </div>
        <h1 className="animate-fade-in mt-10 max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
          Some words are worth waiting for.
        </h1>
        <p className="animate-fade-in mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
          Dear Me is a quiet place to write letters to your future self. Seal them,
          choose when they open, and let your own words find you again.
        </p>
        <div className="animate-fade-in mt-11 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="rounded-xl bg-primary px-9 py-3.5 font-serif text-lg font-semibold text-[#1a1612] transition hover:bg-primary-hover"
          >
            Write Your First Letter
          </button>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="rounded-xl border border-border px-9 py-3.5 font-serif text-lg text-primary transition hover:bg-primary-muted"
          >
Log In
          </button>
        </div>
        <button
          type="button"
          onClick={handleDemo}
          className="animate-fade-in mt-6 font-serif text-sm text-muted underline-offset-4 transition hover:text-primary hover:underline"
        >
          or try the demo &rarr;
        </button>
      </section>

      {/* Lifecycle Demo */}
      <section className="bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <header className="mb-16 text-center">
            <span className="font-serif text-xs uppercase tracking-[0.2em] text-primary">
              How a letter lives
            </span>
            <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
              From your hand to your future heart
            </h2>
          </header>
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {LIFECYCLE.map((step) => (
              <li
                key={step.n}
                className="paper-texture relative flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-hover px-5 py-7 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-primary-muted font-serif text-sm text-primary">
                  {step.n}
                </span>
                <div className="flex h-14 items-center justify-center">{step.figure}</div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="font-serif text-sm italic leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <header className="mb-16 text-center">
            <span className="font-serif text-xs uppercase tracking-[0.2em] text-primary">
              Simple as pen to paper
            </span>
            <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
              Three steps. That&apos;s all.
            </h2>
          </header>
          <ol className="flex flex-col gap-12">
            {STEPS.map((step) => (
              <li key={step.n} className="flex items-start gap-7">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border font-serif text-lg text-primary">
                  {step.n}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-serif text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 font-serif italic leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What Is Dear Me */}
      <section className="relative overflow-hidden bg-surface px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <span aria-hidden className="font-serif text-7xl leading-none text-primary/10">
            &ldquo;
          </span>
          <h2 className="-mt-4 font-serif text-3xl italic leading-snug text-foreground md:text-4xl">
            What would you tell your future self?
          </h2>
          <span aria-hidden className="mx-auto mt-8 block h-px w-10 bg-border" />
          <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed text-muted">
            <p>
              We grow up. We change. The person you are today won&apos;t be the person you
              are in a year, or five, or ten. But somewhere inside there is a thread that
              connects every version of you &mdash; every hope, every fear, every quiet
              realization at 2 a.m.
            </p>
            <p>
              Dear Me is a place to hold those moments. Write a letter when you are feeling
              something real, and seal it for the future. When you open it again you will
              hear your own voice from another time, talking to you like an old friend.
            </p>
            <p className="italic">
              It is not about remembering everything. It is about preserving the moments
              that made you, you.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="animate-float mx-auto w-fit">
            <DearMeIcon size={64} className="text-primary" />
          </div>
          <h2 className="mt-8 font-serif text-3xl text-foreground">
            Your future self is listening.
          </h2>
          <p className="mt-4 font-serif text-lg italic text-muted">
            Write the letter only you can write.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="rounded-xl bg-primary px-9 py-3.5 font-serif text-lg font-semibold text-[#1a1612] transition hover:bg-primary-hover"
            >
              Start Writing
            </button>
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="font-serif text-sm text-muted underline-offset-4 transition hover:text-primary hover:underline"
            >
Already have an account? Log in
            </button>
            <button
              type="button"
              onClick={handleDemo}
              className="font-serif text-sm text-muted/60 underline-offset-4 transition hover:text-primary hover:underline"
            >
              or explore the demo
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center">
        <span className="font-serif text-xs tracking-wide text-muted/60">
          Dear Me &mdash; letters to your past and future selves
        </span>
      </footer>

      {/* Auth Modal */}
      {authOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={mode === "login" ? "Log in" : "Create your account"}
          onClick={() => setAuthOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-scale-in paper-texture w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted text-primary">
              <DearMeIcon size={36} />
            </div>
            <h3 className="mt-5 text-center font-serif text-2xl text-foreground">
              {mode === "login" ? "Welcome back" : "Create your sanctuary"}
            </h3>
            <p className="mt-2 text-center font-serif text-sm italic text-muted">
              {mode === "login"
                ? "Your letters are waiting."
                : "A quiet space for your words."}
            </p>

            {error ? (
              <p className="mt-6 rounded-xl border border-red-700/50 bg-red-900/30 px-4 py-2.5 text-center font-serif text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-serif text-xs uppercase tracking-[0.15em] text-muted">
                  Username
                </span>
                <input
                  type="text"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="rounded-xl border border-border bg-background px-4 py-3 font-serif text-foreground outline-none transition focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-serif text-xs uppercase tracking-[0.15em] text-muted">
                  Password
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="rounded-xl border border-border bg-background px-4 py-3 font-serif text-foreground outline-none transition focus:border-primary"
                />
              </label>
              {mode === "register" && (
                <label className="flex flex-col gap-2 animate-fade-in">
                  <span className="font-serif text-xs uppercase tracking-[0.15em] text-muted">
                    Display Name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="What should we call you?"
                    className="rounded-xl border border-border bg-background px-4 py-3 font-serif text-foreground placeholder:text-muted/40 outline-none transition focus:border-primary"
                  />
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-7 w-full rounded-xl bg-primary py-3.5 font-serif text-lg font-semibold text-[#1a1612] transition hover:bg-primary-hover"
            >
              {mode === "login" ? "Log In" : "Create Account"}
            </button>

            <p className="mt-5 text-center font-serif text-sm text-muted">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary underline underline-offset-2 transition hover:text-primary-hover"
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const LIFECYCLE = [
  {
    n: "01",
    title: "Write",
    body: "Pour your thoughts onto the page.",
    figure: (
      <div className="h-14 w-20 rounded-sm bg-parchment px-2.5 pt-3">
        <span className="block h-0.5 w-full rounded-full bg-[#1a1612]/20" />
        <span className="mt-1 block h-0.5 w-[85%] rounded-full bg-[#1a1612]/15" />
        <span className="mt-1 block h-0.5 w-[70%] rounded-full bg-[#1a1612]/10" />
      </div>
    ),
  },
  {
    n: "02",
    title: "Seal",
    body: "Close it with a soft wax seal.",
    figure: (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8a6528]">
        <span className="h-10 w-10 rounded-full border border-parchment/20" />
      </div>
    ),
  },
  {
    n: "03",
    title: "Choose a date",
    body: "Pick the moment it finds you again.",
    figure: (
      <div className="h-14 w-14 overflow-hidden rounded-sm bg-parchment">
        <span className="block h-3.5 w-full bg-primary" />
        <span className="mt-1.5 grid grid-cols-3 gap-1 px-1.5">
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <span
              key={cell}
              className={cell === 4 ? "h-2 w-2 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-[#1a1612]/10"}
            />
          ))}
        </span>
      </div>
    ),
  },
  {
    n: "04",
    title: "Wait",
    body: "Your letter sleeps until the day arrives.",
    figure: (
      <div className="flex h-12 w-[68px] items-center justify-center rounded-sm border border-border bg-locked">
        <span className="h-5 w-5 rounded-full bg-[#8a6528]" />
      </div>
    ),
  },
  {
    n: "05",
    title: "Read",
    body: "Open it and hear your own voice.",
    figure: (
      <div className="animate-pulse-glow h-14 w-20 rounded-sm bg-parchment px-2.5 pt-4">
        <span className="block h-0.5 w-full rounded-full bg-[#1a1612]/20" />
        <span className="mt-1 block h-0.5 w-[85%] rounded-full bg-[#1a1612]/15" />
      </div>
    ),
  },
];

const STEPS = [
  {
    n: 1,
    title: "Write your letter",
    body: "To your future self, or someone you care about. Say what you need to say \u2014 no one reads it but the person you choose.",
  },
  {
    n: 2,
    title: "Choose when it opens",
    body: "A future date and time: next month, next year, your birthday, a decade from now. You decide when the seal breaks.",
  },
  {
    n: 3,
    title: "Come back and read it",
    body: "When the time comes your words are waiting. Your own voice, from another time, talking to you.",
  },
];
