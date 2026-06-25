import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeErrorMessage(error: unknown): string {
  if (!error && error !== 0) return ""
  if (typeof error === "string") return error === "{}" ? "" : error
  if (typeof error === "number" || typeof error === "boolean") return String(error)
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>
    if (typeof err.message === "string") return err.message
    if (typeof err.error === "string") return err.error
    if (typeof err.description === "string") return err.description
    if (typeof err.msg === "string") return err.msg
    const keys = Object.keys(err)
    if (keys.length === 0) return ""
    try {
      const text = JSON.stringify(err)
      return text === "{}" ? "" : text
    } catch {
      return "Unknown error occurred"
    }
  }
  return ""
}
