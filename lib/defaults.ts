export type SectionId = string
export type ThemeId = "navy" | "dark"

export interface TaskDef {
  id: string
  name: string
  section: SectionId
  countInScore: boolean
  enabled: boolean
  order: number
}

export interface SectionDef {
  id: SectionId
  name: string
  enabled: boolean
  order: number
}

export interface PrayerDef {
  id: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"
  label: string
  show: boolean
  notify: boolean
  /** Aladhan API key */
  apiKey: string
}

export interface SiigaConfig {
  show: boolean
  label: string
  countInScore: boolean
  showSlipModal: boolean
  whyLabel: string
  preventionLabel: string
}

export interface WeeklyField {
  id: string
  label: string
  show: boolean
}

export interface AppConfig {
  appTitle: string
  duration: number
  theme: ThemeId
  quote: string
  showQuote: boolean
  scoreLabel: string
  showScore: boolean
  showRules: boolean
  showPrayerRow: boolean
  showCountdown: boolean
  tasks: TaskDef[]
  sections: SectionDef[]
  prayers: PrayerDef[]
  siiga: SiigaConfig
  rules: { id: string; text: string }[]
  weeklyFields: WeeklyField[]
}

export const DEFAULT_SECTIONS: SectionDef[] = [
  { id: "fajr", name: "Fajr", enabled: true, order: 0 },
  { id: "subax", name: "Subax", enabled: true, order: 1 },
  { id: "dharaar", name: "Dharaar", enabled: true, order: 2 },
  { id: "habeenkii", name: "Habeenkii", enabled: true, order: 3 },
  { id: "kahor", name: "Kahor Hurdada", enabled: true, order: 4 },
]

export const DEFAULT_TASKS: TaskDef[] = [
  { id: "fajr", name: "Fajr Jamaaco", section: "fajr", countInScore: true, enabled: true, order: 0 },
  { id: "quran", name: "Qur'aan (10-20 min)", section: "fajr", countInScore: true, enabled: true, order: 1 },
  { id: "adkaar", name: "Adkaar Subax", section: "fajr", countInScore: true, enabled: true, order: 2 },
  { id: "jimicsi", name: "Jimicsi (Exercise)", section: "subax", countInScore: true, enabled: true, order: 3 },
  { id: "dhuhr", name: "Dhuhr Jamaaco", section: "dharaar", countInScore: true, enabled: true, order: 4 },
  { id: "casar", name: "Casar Jamaaco", section: "dharaar", countInScore: true, enabled: true, order: 5 },
  { id: "maghrib", name: "Maghrib Jamaaco", section: "dharaar", countInScore: true, enabled: true, order: 6 },
  { id: "cisho", name: "Cisho Jamaaco", section: "dharaar", countInScore: true, enabled: true, order: 7 },
  { id: "kitaab", name: "Kitaab / Audiobook (15-30 min)", section: "habeenkii", countInScore: true, enabled: true, order: 8 },
  { id: "layl", name: "Salaatul Layl", section: "kahor", countInScore: true, enabled: true, order: 9 },
]

export const DEFAULT_PRAYERS: PrayerDef[] = [
  { id: "fajr", label: "Fajr", show: true, notify: true, apiKey: "Fajr" },
  { id: "dhuhr", label: "Dhuhr", show: true, notify: true, apiKey: "Dhuhr" },
  { id: "asr", label: "Casar", show: true, notify: true, apiKey: "Asr" },
  { id: "maghrib", label: "Maghrib", show: true, notify: true, apiKey: "Maghrib" },
  { id: "isha", label: "Cisho", show: true, notify: true, apiKey: "Isha" },
]

export const DEFAULT_SIIGA: SiigaConfig = {
  show: true,
  label: "Caado xun oo aad rabtid inad joojiso",
  countInScore: false,
  showSlipModal: true,
  whyLabel: "Maxaa kuu keenay?",
  preventionLabel: "Sideen uga hortagi karaa berri?",
}

export const DEFAULT_RULES = [
  {
    id: "rule1",
    text: "Xeerka 1: Maalin eber ah ma jirto. Ugu yaraan: 1 bog Qur'aan, 5 daqiiqo jimicsi, 2 rakcadood Salaatul Layl.",
  },
  { id: "rule2", text: "Xeerka 2: Ha seegin laba maalmood oo isku xiga." },
  { id: "rule3", text: "Xeerka 3: Consistency > Perfection." },
]

export const DEFAULT_WEEKLY_FIELDS: WeeklyField[] = [
  { id: "good", label: "Waxa Fiicnaa", show: true },
  { id: "bad", label: "Waxa Liitay", show: true },
  { id: "fix", label: "Waxa La Saxayo", show: true },
]

export const DEFAULT_QUOTE =
  "Maanta waan qabanayaa, xitaa haddii aan si yar u qabto."

export function defaultConfig(): AppConfig {
  return {
    appTitle: "90 Day Transformation",
    duration: 90,
    theme: "navy",
    quote: DEFAULT_QUOTE,
    showQuote: true,
    scoreLabel: "Score-da Maanta",
    showScore: true,
    showRules: true,
    showPrayerRow: true,
    showCountdown: true,
    tasks: DEFAULT_TASKS.map((t) => ({ ...t })),
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
    prayers: DEFAULT_PRAYERS.map((p) => ({ ...p })),
    siiga: { ...DEFAULT_SIIGA },
    rules: DEFAULT_RULES.map((r) => ({ ...r })),
    weeklyFields: DEFAULT_WEEKLY_FIELDS.map((f) => ({ ...f })),
  }
}
