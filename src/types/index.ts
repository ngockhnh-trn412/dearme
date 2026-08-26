export type SentimentTag =
  | "#grateful"
  | "#proud"
  | "#sad"
  | "#seekinghope"
  | "#curious"
  | "#hopeful";

export const SENTIMENT_TAGS: SentimentTag[] = [
  "#grateful",
  "#proud",
  "#sad",
  "#seekinghope",
  "#curious",
  "#hopeful",
];

export const SENTIMENT_LABELS: Record<SentimentTag, string> = {
  "#grateful": "Grateful",
  "#proud": "Proud",
  "#sad": "Sad",
  "#seekinghope": "Seeking hope",
  "#curious": "Curious",
  "#hopeful": "Hopeful",
};

export type CapsuleType = "letter" | "media";

export interface CreateCapsuleInput {
  type: CapsuleType;
  title: string;
  content: string;
  mediaUrl?: string;
  optionalMemoryText?: string;
  currentAgeAtCreation: number;
  targetAge?: number;
  unlockDate?: string;
  sentimentTag?: SentimentTag;
  customEmotion?: string;
}

export interface Capsule {
  id: string;
  type: CapsuleType;
  title: string;
  content: string;
  mediaUrl?: string;
  optionalMemoryText?: string;
  currentAgeAtCreation: number;
  targetAge?: number;
  unlockDate?: string;
  sentimentTag?: SentimentTag;
  customEmotion?: string;
  isLocked: boolean;
  isRead: boolean;
  earlyUnlockNote?: string;
  createdAt: string;
}

export interface TimeThread {
  id: string;
  capsuleId: string;
  userId: string;
  reply: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  timeZone?: string;
}
