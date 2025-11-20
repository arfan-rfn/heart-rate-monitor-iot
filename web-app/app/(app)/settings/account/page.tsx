"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useUserProfile } from "@/hooks/use-user-management"
import { useDeleteUserAccount } from "@/hooks/use-user-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"

export default function AccountSettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const router = useRouter()

  // Combined loading state
  const isLoading = authLoading || profileLoading
  const [deletePassword, setDeletePassword] = useState("")

  // TanStack Query hooks
  const deleteAccountMutation = useDeleteUserAccount()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, isLoading, router])

  const handleDeleteAccount = () => {
    if (deletePassword) {
      deleteAccountMutation.mutate(
        { password: deletePassword },
        {
          onSettled: () => {
            setDeletePassword("") // Reset the input
          },
        }
      )
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  const isDeleteConfirmed = deletePassword.length > 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.User className="size-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and identifiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Icons.User className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground truncate">{profile?.user.name || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.Mail className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground truncate">{profile?.user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.Calendar className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.user.createdAt ? new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <Icons.Key className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Account ID</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">{profile?.user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icons.Warning className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            These actions cannot be undone. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="shrink-0 w-full sm:w-auto"
            >
              <Icons.LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog onOpenChange={(open) => !open && setDeletePassword("")}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="shrink-0 w-full sm:w-auto"
                  disabled={deleteAccountMutation.isPending}
                >
                  <Icons.Trash className="size-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      {/* Warning Banner */}
                      <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <Icons.Warning className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-destructive">
                            This action cannot be undone
                          </p>
                          <p className="text-xs text-muted-foreground">
                            All your data will be permanently deleted.
                          </p>
                        </div>
                      </div>

                      {/* Consequences */}
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-foreground">
                          This will permanently delete:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                          <li>Your account and profile</li>
                          <li>All registered devices ({profile?.stats.deviceCount || 0} devices)</li>
                          <li>All measurement data ({profile?.stats.recentMeasurementCount || 0}+ measurements)</li>
                          <li>All sessions and API keys</li>
                        </ul>
                      </div>

                      {/* Password Confirmation */}
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="delete-password" className="font-medium text-sm text-foreground">
                          Enter your password to confirm:
                        </Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                          disabled={deleteAccountMutation.isPending}
                          autoComplete="current-password"
                        />
                        <p className="text-xs text-muted-foreground">
                          You must enter your password to confirm deletion.
                        </p>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel disabled={deleteAccountMutation.isPending} className="w-full sm:w-auto">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                    disabled={deleteAccountMutation.isPending || !isDeleteConfirmed}
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <Icons.Loader className="size-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Icons.Trash className="size-4 mr-2" />
                        Delete My Account
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}