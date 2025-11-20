"use client"

import { useCallback } from "react"
import posthog from "posthog-js"

export function usePostHog() {
  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (posthog.__loaded) {
      posthog.capture(eventName, properties)
    }
  }, [])

  return { track }
}
