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
import { apiClient } from "@/lib/api/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface ApiKeyData {
  apiKey?: string
  keyPreview?: string
  name?: string
  expiresAt?: string
  expiresIn?: number
}

export default function SecuritySettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // API key management state
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch API key using TanStack Query
  const { data: apiKeyData, isLoading: isLoadingApiKey } = useQuery({
    queryKey: ['api-key'],
    queryFn: async () => {
      try {
        const data = await apiClient.get<ApiKeyData>("/users/api-key")
        return data
      } catch (error: any) {
        if (error?.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: isAuthenticated,
    retry: false,
  })

  // Generate API key mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post<ApiKeyData>("/users/api-key")
    },
    onSuccess: (data) => {
      setNewApiKey(data.apiKey || null)
      setShowNewApiKeyDialog(true)
      queryClient.invalidateQueries({ queryKey: ['api-key'] })
      toast.success("API key generated successfully")
    },
    onError: (error: any) => {
      console.error("Failed to generate API key:", error)
      toast.error(error?.message || "Failed to generate API key")
      // If key already exists, refetch to update the UI
      if (error?.status === 400 || error?.message?.includes("already exists")) {
        queryClient.invalidateQueries({ queryKey: ['api-key'] })
      }
    },
  })

  // Regenerate API key mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post<ApiKeyData>("/users/api-key/regenerate")
    },
    onSuccess: (data) => {
      setNewApiKey(data.apiKey || null)
      setShowRegenerateDialog(false)
      setShowNewApiKeyDialog(true)
      queryClient.invalidateQueries({ queryKey: ['api-key'] })
      toast.success("API key regenerated successfully")
    },
    onError: (error: any) => {
      console.error("Failed to regenerate API key:", error)
      toast.error(error?.message || "Failed to regenerate API key")
    },
  })

  // Revoke API key mutation
  const revokeMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.delete("/users/api-key")
    },
    onSuccess: () => {
      setShowRevokeDialog(false)
      queryClient.invalidateQueries({ queryKey: ['api-key'] })
      toast.success("API key revoked successfully")
    },
    onError: (error: any) => {
      console.error("Failed to revoke API key:", error)
      toast.error(error?.message || "Failed to revoke API key")
    },
  })

  const handleGenerateApiKey = () => {
    generateMutation.mutate()
  }

  const handleRegenerateApiKey = () => {
    regenerateMutation.mutate()
  }

  const handleRevokeApiKey = () => {
    revokeMutation.mutate()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const isApiKeyLoading = isLoadingApiKey || generateMutation.isPending || regenerateMutation.isPending || revokeMutation.isPending

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

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Key className="size-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Manage your account-level API key for IoT device authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isApiKeyLoading && !apiKeyData ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.Loader className="size-4 animate-spin" />
              Loading API key...
            </div>
          ) : apiKeyData?.keyPreview ? (
            // API key exists - show preview and management options
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current API Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={apiKeyData.keyPreview}
                    disabled
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKeyData.keyPreview || "")}
                  >
                    <Icons.Copy className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Only the last 8 characters are shown for security
                </p>
              </div>

              {apiKeyData.expiresAt && (
                <div className="space-y-1">
                  <Label className="text-sm">Expires</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(apiKeyData.expiresAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              <Alert>
                <Icons.Info className="size-4" />
                <AlertTitle>Using Your API Key</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>
                    Use this API key to authenticate your IoT devices. Include it in the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">X-API-Key</code> header
                    when making requests to the API.
                  </p>
                  <p className="font-medium">
                    Remember to include <code className="bg-muted px-1 py-0.5 rounded text-xs">deviceId</code>{" "}
                    in your request body when submitting measurements.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateDialog(true)}
                  disabled={isApiKeyLoading}
                >
                  <Icons.RefreshCw className="size-4 mr-2" />
                  Regenerate Key
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRevokeDialog(true)}
                  disabled={isApiKeyLoading}
                >
                  <Icons.Trash className="size-4 mr-2" />
                  Revoke Key
                </Button>
              </div>
            </div>
          ) : (
            // No API key - show generate button
            <div className="space-y-4">
              <Alert>
                <Icons.Info className="size-4" />
                <AlertTitle>No API Key Found</AlertTitle>
                <AlertDescription>
                  Generate an account-level API key to authenticate your IoT devices.
                  This key will work for all devices registered to your account.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGenerateApiKey}
                disabled={isApiKeyLoading}
              >
                {isApiKeyLoading ? (
                  <>
                    <Icons.Loader className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Icons.Plus className="size-4 mr-2" />
                    Generate API Key
                  </>
                )}
              </Button>
            </div>
          )}
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

      {/* New API Key Dialog */}
      <Dialog open={showNewApiKeyDialog} onOpenChange={setShowNewApiKeyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              Save this API key now for use with your IoT devices.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <Icons.AlertTriangle className="size-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Copy and save this API key securely. While you can view a masked preview later, the full key is only shown once during generation.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={newApiKey || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(newApiKey || "")}
                  className="shrink-0"
                >
                  <Icons.Copy className="size-4" />
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b border-border">
                <p className="text-sm font-medium">Usage Example:</p>
              </div>
              <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-900 text-slate-200">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/measurements \\
  -H "X-API-Key: ${newApiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "your-device-id",
    "heartRate": 72,
    "spO2": 98,
    "timestamp": "2025-11-20T03:42:00.000Z"
  }'`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowNewApiKeyDialog(false)
            }}>
              I&apos;ve Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key?</DialogTitle>
            <DialogDescription>
              This will revoke your current API key and generate a new one. All devices using the old key will stop working.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <Icons.AlertTriangle className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your IoT devices will need to be reconfigured with the new API key.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerateApiKey}
              disabled={isApiKeyLoading}
            >
              {isApiKeyLoading ? (
                <>
                  <Icons.Loader className="size-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Regenerate Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key?</DialogTitle>
            <DialogDescription>
              This will permanently delete your API key. All devices using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <Icons.AlertTriangle className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. You&apos;ll need to generate a new API key to use with your devices.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeApiKey}
              disabled={isApiKeyLoading}
            >
              {isApiKeyLoading ? (
                <>
                  <Icons.Loader className="size-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
