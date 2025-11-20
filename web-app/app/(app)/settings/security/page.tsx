"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PasswordStrength, validatePassword } from "@/components/ui/password-strength"
import { auth } from "@/lib/auth"
import { toast } from "sonner"

export default function SecuritySettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, authLoading, router])

  const passwordValidation = validatePassword(newPassword)
  const passwordsMatch = newPassword === confirmPassword
  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    passwordValidation.isValid &&
    passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    try {
      setIsLoading(true)
      await auth.changePassword(currentPassword, newPassword, false)
      toast.success("Password changed successfully")

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Password change error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated && !authLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Lock className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <Icons.EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Icons.Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <Icons.EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Icons.Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <PasswordStrength password={newPassword} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Min 8 chars with uppercase, lowercase, and number/special char
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <Icons.EyeOff className="size-4 text-muted-foreground" />
                  ) : (
                    <Icons.Eye className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.Loader className="size-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Icons.Lock className="size-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Shield className="size-5" />
            Security Tips
          </CardTitle>
          <CardDescription>
            Best practices for keeping your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Icons.Check className="size-4 mt-0.5 text-green-600 shrink-0" />
              <span>Use a unique password that you don&apos;t use for other accounts</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Check className="size-4 mt-0.5 text-green-600 shrink-0" />
              <span>Change your password regularly (every 3-6 months recommended)</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Check className="size-4 mt-0.5 text-green-600 shrink-0" />
              <span>Never share your password with anyone</span>
            </li>
            <li className="flex items-start gap-3">
              <Icons.Check className="size-4 mt-0.5 text-green-600 shrink-0" />
              <span>Use a password manager to generate and store strong passwords</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
