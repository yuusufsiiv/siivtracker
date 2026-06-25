export function hashPin(pin: string): string {
  let h = 5381
  for (let i = 0; i < pin.length; i++) {
    h = (h * 33) ^ pin.charCodeAt(i)
  }
  return (h >>> 0).toString(16)
}

export function pinToPassword(pin: string, email?: string): string {
  const normalizedEmail = (email ?? "anon").trim().toLowerCase()
  const safeEmail = normalizedEmail.replace(/[^a-z0-9@.-]/g, "")
  return `siiv_secure_${safeEmail}_${pin}_tracker_2026`
}
