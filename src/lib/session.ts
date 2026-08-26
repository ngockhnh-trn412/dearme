const SESSION_KEY = "sanctuary_session";
const ACCOUNTS_KEY = "sanctuary_accounts";

export interface Account {
  username: string;
  password: string;
  displayName: string;
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(username: string) {
  localStorage.setItem(SESSION_KEY, username);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAccount(account: Account) {
  const accounts = getAccounts().filter((a) => a.username !== account.username);
  accounts.push(account);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function findAccount(username: string): Account | undefined {
  return getAccounts().find((a) => a.username === username);
}

export function stateKey(): string {
  const username = getSession();
  return username ? `sanctuary_state_${username}` : "sanctuary-state";
}

export function photoKey(): string {
  const username = getSession();
  return username ? `sanctuary_personal_photo_${username}` : "sanctuary_personal_photo";
}

export function triggerKey(): string {
  const username = getSession();
  return username ? `sanctuary_trigger_words_${username}` : "sanctuary_trigger_words";
}
