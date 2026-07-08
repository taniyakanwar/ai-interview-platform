// useDebounce.ts
// Generic debounce hook - delays updating a value until `delay` ms have passed
// since the last change. Used to avoid firing an API call on every keystroke.

import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Every time `value` changes, reset the timer
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: if `value` changes again before `delay` ms pass,
    // cancel the previous timer so we don't save stale content
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}