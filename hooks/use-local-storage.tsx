"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  /* 1️⃣  Run this effect ONCE per key (not on every re-render) */
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item) as T
        /* 2️⃣  Update only when the value is really different */
        if (JSON.stringify(parsed) !== JSON.stringify(storedValue)) {
          setStoredValue(parsed)
        }
      }
    } catch (error) {
      console.error("useLocalStorage → read error:", error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]) // ⬅️  initialValue removed
  /* eslint rule disabled because we intentionally exclude storedValue from deps */

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error("useLocalStorage → write error:", error)
    }
  }

  return [storedValue, setValue] as const
}
