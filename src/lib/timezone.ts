export function getUserTimeZone(): string {
  if (typeof window === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function getLocalDateInTimezone(timeZone: string | undefined, date = new Date()): string {
  const tz = timeZone ?? getUserTimeZone();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    return `${map.year}-${map.month}-${map.day}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function isUnlockDateReached(unlockDate: string, timeZone?: string): boolean {
  const today = getLocalDateInTimezone(timeZone);
  return today >= unlockDate;
}

export function isUnlockDateTimeReached(unlockDate: string): boolean {
  const hasTime = unlockDate.includes("T");
  if (!hasTime) return isUnlockDateReached(unlockDate);
  const target = new Date(unlockDate).getTime();
  if (Number.isNaN(target)) return isUnlockDateReached(unlockDate);
  // A datetime-local string (e.g. "2026-09-01T14:30") is parsed as the
  // browser's local time, so comparing against the current wall-clock time
  // honors the exact minute the author chose.
  return Date.now() >= target;
}

export function formatUnlockDateTime(unlockDate: string): string {
  const hasTime = unlockDate.includes("T");
  const date = new Date(unlockDate);
  if (Number.isNaN(date.getTime())) return unlockDate;
  const day = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (!hasTime) return day;
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} at ${time}`;
}

export function isCapsuleOpenable(
  capsule: { isLocked?: boolean; targetAge?: number; unlockDate?: string; currentAgeAtCreation?: number },
  user: { age?: number; timeZone?: string } | null
): boolean {
  if (!capsule.isLocked) return true;
  if (!user) return false;
  if (capsule.targetAge && user.age != null && user.age < capsule.targetAge) return false;
  if (capsule.unlockDate && !isUnlockDateTimeReached(capsule.unlockDate)) {
    return false;
  }
  return true;
}
