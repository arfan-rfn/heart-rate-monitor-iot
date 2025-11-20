"use client"

import { createContext, useContext, ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

interface AuthContextType {
  user: any
  session: any
  isLoading: boolean
  isAuthenticated: boolean
  error: any
  signIn: any
  signUp: any
  signOut: () => Promise<void>
  refresh: (queryParams?: any) => void
  getAuthToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  // Helper function to get the current auth token
  const getAuthToken = () => {
    return auth.session?.session?.token || null
  }

  return (
    <AuthContext.Provider value={{ ...auth, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}