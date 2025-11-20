"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useUser } from "@/hooks/use-user"
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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDeleteAccount } from "@/hooks/use-account"
import { authClient } from "@/lib/auth"
import { AccountInfoSkeleton } from "@/components/ui/skeletons"

export default function AccountSettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { data: user, isLoading: userLoading } = useUser()
  const router = useRouter()

  // Combined loading state
  const isLoading = authLoading || userLoading
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  // TanStack Query hooks
  const deleteAccountMutation = useDeleteAccount()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, isLoading, router])

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "DELETE") {
      deleteAccountMutation.mutate()
      setDeleteConfirmation("") // Reset the input
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  const isDeleteConfirmed = deleteConfirmation === "DELETE"

  if (isLoading) {
    return <AccountInfoSkeleton />
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
                  <p className="text-sm text-muted-foreground truncate">{user?.name || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.Mail className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icons.Calendar className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
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
                  <p className="text-sm text-muted-foreground font-mono break-all">{user?.id}</p>
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
                Request account deletion. You will receive a verification email to confirm.
              </p>
            </div>
            <AlertDialog onOpenChange={(open) => !open && setDeleteConfirmation("")}>
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
                  <AlertDialogTitle>Request Account Deletion?</AlertDialogTitle>
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
                            Account deletion is a secure multi-step process to protect your account.
                          </p>
                        </div>
                      </div>

                      {/* Process Steps */}
                      <div className="bg-muted p-3 sm:p-4 rounded-lg space-y-3">
                        <div className="font-medium text-foreground text-sm">Here&apos;s what will happen:</div>
                        <ol className="space-y-2 text-sm">
                          <li className="flex gap-2 sm:gap-3">
                            <span className="font-semibold text-foreground shrink-0">1.</span>
                            <span>You&apos;ll receive a verification email with a confirmation link</span>
                          </li>
                          <li className="flex gap-2 sm:gap-3">
                            <span className="font-semibold text-foreground shrink-0">2.</span>
                            <span>Click the link in the email to proceed</span>
                          </li>
                          <li className="flex gap-2 sm:gap-3">
                            <span className="font-semibold text-foreground shrink-0">3.</span>
                            <span>You may need to sign in again to verify your identity</span>
                          </li>
                          <li className="flex gap-2 sm:gap-3">
                            <span className="font-semibold text-foreground shrink-0">4.</span>
                            <span>Your account will be permanently deleted</span>
                          </li>
                        </ol>
                      </div>

                      {/* Consequences */}
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-foreground">
                          Once deleted, this will:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                          <li>Permanently remove your account and profile</li>
                          <li>Delete all your personal data</li>
                          <li>Sign you out of all devices</li>
                        </ul>
                      </div>

                      {/* Confirmation Input */}
                      <div className="space-y-2 pt-2">
                        <div className="font-medium text-sm text-foreground">
                          Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs sm:text-sm">DELETE</span> to confirm:
                        </div>
                        <Input
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          className="font-mono"
                          disabled={deleteAccountMutation.isPending}
                        />
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icons.Mail className="size-4 mr-2" />
                        Send Verification Email
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