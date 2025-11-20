"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./auth-provider"
import QueryProvider from "./query-provider"
import { PostHogProvider } from "./posthog-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}