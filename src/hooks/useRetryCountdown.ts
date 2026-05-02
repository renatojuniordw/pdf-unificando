'use client'

import { useState, useRef, useCallback } from 'react'

interface UseRetryCountdownReturn {
  secondsLeft: number
  isBlocked: boolean
  progress: number
  startCountdown: (seconds: number) => void
  reset: () => void
}

export function useRetryCountdown(): UseRetryCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [total, setTotal] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTotal(seconds)
    setSecondsLeft(seconds)

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setSecondsLeft(0)
    setTotal(0)
  }, [])

  return {
    secondsLeft,
    isBlocked: secondsLeft > 0,
    progress: total > 0 ? secondsLeft / total : 0,
    startCountdown,
    reset,
  }
}
