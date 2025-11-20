"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useChangePassword } from "@/hooks/use-user-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { validatePassword } from "@/lib/types/user"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SecuritySettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const changePasswordMutation = useChangePassword()
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, authLoading, router])

  // Validate new password on change
  useEffect(() => {
    if (newPassword) {
      const { errors } = validatePassword(newPassword)
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }
  }, [newPassword])

  const passwordsMatch = newPassword === confirmPassword
  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    validationErrors.length === 0 &&
    passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          // Reset form
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
          setValidationErrors([])
        },
      }
    )
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
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
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

            {/* Password Requirements */}
            {newPassword && validationErrors.length > 0 && (
              <Alert variant="destructive">
                <Icons.Warning className="size-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Password Requirements Info */}
            {!newPassword && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Password must contain:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3" />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3" />
                    One uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3" />
                    One lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3" />
                    One number (0-9)
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="size-3" />
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
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
