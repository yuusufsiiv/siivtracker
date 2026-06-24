export const SOMALI_DAYS_FULL = [
  "Axad",
  "Isniin",
  "Talaado",
  "Arbaco",
  "Khamiis",
  "Jimce",
  "Sabti",
]

export const SOMALI_DAYS_SHORT = [
  "Axd",
  "Itn",
  "Tls",
  "Arb",
  "Kms",
  "Jim",
  "Sbt",
]

export const SOMALI_MONTHS = [
  "Jannaayo",
  "Febraayo",
  "Maarso",
  "Abriil",
  "Maajo",
  "Juun",
  "Luulyo",
  "Agoosto",
  "Sebtembar",
  "Oktoobar",
  "Nofembar",
  "Diseembar",
]

/** Local YYYY-MM-DD key (avoids UTC shift from toISOString). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Whole-day difference between two date keys (b - a). */
export function diffDays(aKey: string, bKey: string): number {
  const a = fromDateKey(aKey)
  const b = fromDateKey(bKey)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/** 1-based day number in the challenge. */
export function dayNumber(startKey: string, key: string): number {
  return diffDays(startKey, key) + 1
}

export function somaliDayName(date: Date): string {
  return SOMALI_DAYS_FULL[date.getDay()]
}

export function somaliDate(date: Date): string {
  return `${SOMALI_DAYS_FULL[date.getDay()]}, ${date.getDate()} ${
    SOMALI_MONTHS[date.getMonth()]
  } ${date.getFullYear()}`
}

export function isFutureKey(key: string): boolean {
  return diffDays(todayKey(), key) > 0
}

export function isPastKey(key: string): boolean {
  return diffDays(todayKey(), key) < 0
}

export function phaseForDay(dayNum: number): 1 | 2 | 3 {
  if (dayNum <= 30) return 1
  if (dayNum <= 60) return 2
  return 3
}

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`
}
