"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
}

export function calculatePasswordStrength(password: string): {
  score: number // 0-3
  label: string
  color: string
} {
  if (!password) {
    return { score: 0, label: "", color: "bg-gray-200 dark:bg-gray-700" }
  }

  let score = 0

  // Check length (min 8 chars)
  if (password.length >= 8) score++

  // Check for uppercase + lowercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++

  // Check for number or special character
  if (/[0-9]/.test(password) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++

  const strengthMap = {
    1: { label: "Weak", color: "bg-red-500" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Strong", color: "bg-green-500" },
  }

  return {
    score,
    ...(strengthMap[score as keyof typeof strengthMap] || strengthMap[1]),
  }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password])

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              level <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", strength.color.replace("bg-", "text-"))}>
        {strength.label}
      </p>
    </div>
  )
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" }
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain uppercase and lowercase letters" }
  }
  if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: "Password must contain a number or special character" }
  }
  return { isValid: true }
}
