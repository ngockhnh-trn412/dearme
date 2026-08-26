import { findAccount, saveAccount, setSession } from "./session";
import { stateKey } from "./session";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo1234";

const DEMO_ACCOUNT = {
  username: DEMO_USERNAME,
  password: DEMO_PASSWORD,
  displayName: "Alex Chen",
};

// Warm window-view illustration — matches the studio window capsule
const STUDIO_WINDOW_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#2e281f"/><rect x="40" y="30" width="320" height="240" rx="4" fill="#1a1612" stroke="#3d3529" stroke-width="2"/><rect x="50" y="40" width="145" height="110" fill="#c9a96e" opacity="0.15"/><rect x="205" y="40" width="145" height="110" fill="#c9a96e" opacity="0.12"/><rect x="50" y="160" width="145" height="100" fill="#c9a96e" opacity="0.10"/><rect x="205" y="160" width="145" height="100" fill="#c9a96e" opacity="0.08"/><rect x="193" y="28" width="14" height="244" fill="#3d3529"/><rect x="48" y="153" width="304" height="14" fill="#3d3529"/><circle cx="120" cy="85" r="20" fill="#c9a96e" opacity="0.25"/><circle cx="280" cy="90" r="15" fill="#c9a96e" opacity="0.18"/><rect x="100" y="200" width="60" height="50" rx="2" fill="#8b7355" opacity="0.3"/><rect x="118" y="210" width="10" height="20" rx="1" fill="#6b4423" opacity="0.5"/><rect x="250" y="195" width="50" height="55" rx="2" fill="#8b7355" opacity="0.25"/><rect x="260" y="220" width="8" height="16" rx="1" fill="#c9a96e" opacity="0.4"/><rect x="280" y="220" width="8" height="16" rx="1" fill="#c9a96e" opacity="0.3"/><circle cx="200" cy="15" r="8" fill="#c9a96e" opacity="0.15"/></svg>`)}`;

// Warm sunset-bridge illustration — for the golden hour capsule
const BRIDGE_SUNSET_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3d3529"/><stop offset="60%" stop-color="#8b6535"/><stop offset="100%" stop-color="#c9a96e" stop-opacity="0.4"/></linearGradient></defs><rect width="400" height="300" fill="url(#sky)"/><circle cx="200" cy="100" r="35" fill="#c9a96e" opacity="0.3"/><rect x="0" y="180" width="400" height="120" fill="#1a1612" opacity="0.6"/><path d="M 50 180 Q 120 160, 200 175 Q 280 190, 350 170" stroke="#8b7355" stroke-width="3" fill="none" opacity="0.5"/><path d="M 80 180 L 80 200 M 140 175 L 140 200 M 200 178 L 200 200 M 260 182 L 260 200 M 320 172 L 320 200" stroke="#8b7355" stroke-width="2" opacity="0.3"/><rect x="0" y="200" width="400" height="100" fill="#1a1612"/><rect x="0" y="195" width="400" height="8" fill="#c9a96e" opacity="0.08"/><circle cx="200" cy="250" r="40" fill="#c9a96e" opacity="0.06"/></svg>`)}`;

// Warm bookshop illustration — for the bookshop memory
const BOOKSHOP_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#241f18"/><rect x="30" y="40" width="340" height="220" rx="6" fill="#2e281f" stroke="#3d3529" stroke-width="1.5"/><rect x="50" y="60" width="30" height="100" rx="2" fill="#8b7355" opacity="0.6"/><rect x="85" y="55" width="25" height="105" rx="2" fill="#c9a96e" opacity="0.4"/><rect x="115" y="62" width="28" height="98" rx="2" fill="#6b8f6b" opacity="0.35"/><rect x="148" y="58" width="22" height="102" rx="2" fill="#8b7355" opacity="0.5"/><rect x="175" y="64" width="30" height="96" rx="2" fill="#c9a96e" opacity="0.3"/><rect x="210" y="56" width="26" height="104" rx="2" fill="#8b7355" opacity="0.45"/><rect x="241" y="60" width="32" height="100" rx="2" fill="#6b8f6b" opacity="0.3"/><rect x="278" y="58" width="24" height="102" rx="2" fill="#c9a96e" opacity="0.35"/><rect x="307" y="63" width="28" height="97" rx="2" fill="#8b7355" opacity="0.4"/><circle cx="200" cy="200" r="25" fill="#c9a96e" opacity="0.15"/><rect x="170" y="195" width="60" height="30" rx="3" fill="#c9a96e" opacity="0.08"/><text x="200" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#c9a96e" opacity="0.4">Maple St.</text></svg>`)}`;

// Personal photo placeholder — soft warm portrait silhouette
const PERSONAL_PHOTO_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#2e281f"/><circle cx="150" cy="150" r="140" fill="#3d3529"/><circle cx="150" cy="120" r="45" fill="#8b7355" opacity="0.5"/><ellipse cx="150" cy="210" rx="65" ry="55" fill="#8b7355" opacity="0.4"/><circle cx="150" cy="150" r="100" fill="none" stroke="#c9a96e" stroke-width="1" opacity="0.2"/><circle cx="150" cy="150" r="80" fill="none" stroke="#c9a96e" stroke-width="0.5" opacity="0.15"/></svg>`)}`;

const CAPSULE_1 = "c1a2b3c4-d5e6-4f78-9a0b-1c2d3e4f5a6b";
const CAPSULE_2 = "d2b3c4d5-e6f7-4a89-0b1c-2d3e4f5a6b7c";
const CAPSULE_3 = "e3c4d5e6-f7a8-4b90-1c2d-3e4f5a6b7c8d";
const CAPSULE_4 = "f4d5e6f7-a8b9-4c01-2d3e-4f5a6b7c8d9e";
const CAPSULE_5 = "a5e6f7a8-b9c0-4d12-3e4f-5a6b7c8d9e0f";
const CAPSULE_6 = "b6f7a8b9-c0d1-4e23-4f5a-6b7c8d9e0f1a";

function getDemoState() {
  return {
    user: {
      id: "demo-user-001",
      name: "Alex Chen",
      age: 24,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    capsules: [
      {
        id: CAPSULE_1,
        type: "letter" as const,
        title: "To whoever I am at 30",
        content:
          "Hey future me,\n\nI hope you reading this means things worked out. I'm 24 right now, sitting in my tiny apartment, wondering if the choices I'm making matter.\n\nI just quit my job at the marketing firm. Everyone thinks I'm crazy. Maybe I am. But I couldn't keep spending my days writing copy for products I don't believe in.\n\nI'm starting a photography project next week. Street photography in the old quarter. I'm terrified and alive.\n\nPlease tell me you still feel that way. Please tell me you didn't let the world make you small.\n\nWith love and hope,\nAlex",
        currentAgeAtCreation: 24,
        sentimentTag: "#hopeful" as const,
        isLocked: false,
        isRead: true,
        createdAt: "2026-06-15T14:30:00.000Z",
      },
      {
        id: CAPSULE_2,
        type: "letter" as const,
        title: "A letter for my 26th birthday",
        content:
          "Dear Alex,\n\nHappy birthday. Or it will be, when you read this.\n\nI wrote this on a Tuesday morning in August. The coffee was too hot and I burned my tongue. Small things, but I wanted to remember them.\n\nI don't know what 26 looks like. I hope it looks like courage. I hope you took that trip to Lisbon. I hope you called Mom more often.\n\nMost of all I hope you're kind to yourself. You deserve that more than you know.\n\nAlways,\nAlex at 24",
        currentAgeAtCreation: 24,
        targetAge: 26,
        sentimentTag: "#grateful" as const,
        isLocked: true,
        isRead: false,
        createdAt: "2026-07-20T09:15:00.000Z",
      },
      {
        id: CAPSULE_3,
        type: "letter" as const,
        title: "The night I almost gave up",
        content:
          "I need to write this down before it fades.\n\nTonight I almost called the whole thing off. The photography project, the freelance work, all of it. I sat on the floor of my studio and cried because nothing felt like it was working.\n\nBut then I looked at the photos on my wall. The ones from last week. An old man feeding pigeons. A girl drawing chalk art. A couple slow-dancing on a bridge.\n\nThose moments are real. I captured them. I made something beautiful out of ordinary light.\n\nI'm not giving up. Not tonight.\n\nNote to future self: remember this night. Remember that you almost stopped. Remember that you didn't.",
        currentAgeAtCreation: 24,
        sentimentTag: "#proud" as const,
        isLocked: false,
        isRead: true,
        createdAt: "2026-08-02T23:45:00.000Z",
      },
      {
        id: CAPSULE_4,
        type: "letter" as const,
        title: "Promise to my 28-year-old self",
        content:
          "I am sealing this on a cold November evening.\n\nBy the time you read this, two years will have passed. I wonder what has changed. I wonder what stayed the same.\n\nHere is my promise: I will not abandon the things that make me feel alive. Even when it's hard. Even when the world tells me to be practical.\n\nIf you're reading this and you kept that promise, I'm proud of us.\n\nSealed with hope,\nAlex",
        currentAgeAtCreation: 24,
        unlockDate: "2028-11-15T18:00",
        sentimentTag: "#hopeful" as const,
        isLocked: true,
        isRead: false,
        createdAt: "2026-11-10T18:00:00.000Z",
      },
      {
        id: CAPSULE_5,
        type: "media" as const,
        title: "The view from my studio window",
        content: "",
        mediaUrl: STUDIO_WINDOW_SVG,
        optionalMemoryText:
          "This is what I see every morning. The old building across the street with the red door. I'll miss this view when I move.",
        currentAgeAtCreation: 24,
        sentimentTag: "#curious" as const,
        isLocked: false,
        isRead: true,
        createdAt: "2026-09-05T07:20:00.000Z",
      },
      {
        id: CAPSULE_6,
        type: "letter" as const,
        title: "Things I want to remember",
        content:
          "A list of small things that matter right now:\n\n- The sound of rain on the skylight\n- How my cat (Mochi) curls up on my lap when I write\n- The smell of old bookshops on Maple Street\n- The way golden hour light hits the bridge downtown\n- My grandmother's voice telling me stories\n- That feeling when a photo turns out exactly how I imagined\n- Late night tea with too much sugar\n- The silence after snowfall\n\nRemember these. They are the texture of a good life.",
        currentAgeAtCreation: 24,
        sentimentTag: "#grateful" as const,
        isLocked: false,
        isRead: true,
        createdAt: "2026-10-12T21:00:00.000Z",
      },
    ],
    timeThreads: [
      {
        id: "thread-001",
        capsuleId: CAPSULE_1,
        userId: "demo-user-001",
        reply:
          "I just read this again. I did go to Lisbon. And I did keep photographing. Thank you for believing in us.",
        createdAt: "2026-08-20T10:30:00.000Z",
      },
      {
        id: "thread-002",
        capsuleId: CAPSULE_3,
        userId: "demo-user-001",
        reply:
          "We didn't give up. That night became the turning point. The series from those streets ended up in a gallery. You were right to keep going.",
        createdAt: "2026-09-14T16:45:00.000Z",
      },
    ],
  };
}

const DEMO_TRIGGER_WORDS = ["worthless", "failure", "not good enough"];

export function seedDemoAccount() {
  if (typeof window === "undefined") return DEMO_USERNAME;

  if (!findAccount(DEMO_USERNAME)) {
    saveAccount(DEMO_ACCOUNT);
  }

  const key = `sanctuary_state_${DEMO_USERNAME}`;
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(getDemoState()));
  }

  const triggerKey = `sanctuary_trigger_words_${DEMO_USERNAME}`;
  if (!localStorage.getItem(triggerKey)) {
    localStorage.setItem(triggerKey, JSON.stringify(DEMO_TRIGGER_WORDS));
  }

  const photoKey = `sanctuary_personal_photo_${DEMO_USERNAME}`;
  if (!localStorage.getItem(photoKey)) {
    localStorage.setItem(photoKey, PERSONAL_PHOTO_SVG);
  }

  return DEMO_USERNAME;
}
