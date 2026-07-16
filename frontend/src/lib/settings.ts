// User preferences, persisted locally until the Settings API exists (Phase 5).

const SETTINGS_KEY = "inkwell.settings";

export type UserSettings = {
  defaultStyle: string;
  defaultTone: string;
  defaultLanguage: string;
  autosaveSeconds: number;
  emailNotifications: boolean;
  publishReminders: boolean;
};

export const defaultSettings: UserSettings = {
  defaultStyle: "tutorial",
  defaultTone: "professional",
  defaultLanguage: "english",
  autosaveSeconds: 30,
  emailNotifications: true,
  publishReminders: false,
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<UserSettings>) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export const writingStyles = [
  { value: "tutorial", label: "Tutorial" },
  { value: "how-to", label: "How-To" },
  { value: "comparison", label: "Comparison" },
  { value: "listicle", label: "Listicle" },
  { value: "story", label: "Story" },
  { value: "opinion", label: "Opinion" },
  { value: "technical-guide", label: "Technical Guide" },
  { value: "case-study", label: "Case Study" },
  { value: "interview-experience", label: "Interview Experience" },
  { value: "product-review", label: "Product Review" },
  { value: "ai-news", label: "AI Generated News" },
];

export const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "conversational", label: "Conversational" },
  { value: "technical", label: "Technical" },
  { value: "beginner", label: "Beginner" },
  { value: "expert", label: "Expert" },
  { value: "motivational", label: "Motivational" },
];

export const languages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "portuguese", label: "Portuguese" },
  { value: "japanese", label: "Japanese" },
];
