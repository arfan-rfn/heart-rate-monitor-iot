"use client"

import { Suspense, useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { env } from "@/env"
import { useAuthContext } from "./auth-provider"

interface PostHogProviderProps {
  children: React.ReactNode
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedUrl = useRef<string>("")

  // Track pageviews with deduplication
  useEffect(() => {
    if (pathname && posthog.__loaded) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      // Only track if URL actually changed (prevents duplicate pageviews)
      if (url !== lastTrackedUrl.current) {
        lastTrackedUrl.current = url
        posthog.capture("$pageview", { $current_url: url })
      }
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const { user, isAuthenticated } = useAuthContext()

  // Initialize PostHog
  useEffect(() => {
    if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
      const apiPath = env.NEXT_PUBLIC_POSTHOG_API_PATH || "/t"
      const apiHost = env.NEXT_PUBLIC_POSTHOG_HOST || `${env.NEXT_PUBLIC_API_URL}${apiPath}`

      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: apiHost,
        capture_pageview: false, // Manual pageview tracking
        capture_pageleave: false, // Disable pageleave to reduce events
        autocapture: false, // Disable autocapture
        person_profiles: "identified_only", // Only track logged-in users
        disable_web_experiments: true, // Disable if not using experiments
        disable_surveys: true, // Disable if not using surveys
        capture_performance: false, // Disable web vitals tracking
      })
    }
  }, [])

  // Identify user
  useEffect(() => {
    if (posthog.__loaded) {
      if (isAuthenticated && user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.name,
        })
      } else {
        posthog.reset()
      }
    }
  }, [isAuthenticated, user])

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
