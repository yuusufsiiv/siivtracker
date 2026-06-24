"use client"

import { useEffect, useState } from "react"

/** Returns a Date that refreshes on the given interval (ms). */
export function useNow(intervalMs = 60000): Date {
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
