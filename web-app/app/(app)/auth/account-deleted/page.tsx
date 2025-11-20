"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/providers/auth-provider"
import { useCompleteAccountDeletion } from "@/hooks/use-account"

function AccountDeletedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const completeDeletionMutation = useCompleteAccountDeletion()

  const token = searchParams.get("token")

  useEffect(() => {
    // If no token, this page was accessed directly (shouldn't happen)
    if (!token) {
      router.push("/")
      return
    }

    // If still loading auth state, wait
    if (authLoading) {
      return
    }

    // If not authenticated, redirect to sign-in with return URL
    if (!isAuthenticated) {
      const returnUrl = `/auth/account-deleted?token=${token}`
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    // If authenticated and have token, and not already processing, proceed with deletion
    if (!completeDeletionMutation.isPending && !completeDeletionMutation.isSuccess && !completeDeletionMutation.isError) {
      completeDeletionMutation.mutate(token)
    }
  }, [token, isAuthenticated, authLoading, router, completeDeletionMutation])

  // Handle successful deletion - redirect after 10 seconds
  useEffect(() => {
    if (completeDeletionMutation.isSuccess) {
      const timeout = setTimeout(() => {
        router.push("/")
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [completeDeletionMutation.isSuccess, router])

  // Loading state - checking authentication or processing deletion
  if (authLoading || completeDeletionMutation.isPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Icons.Loader className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {completeDeletionMutation.isPending ? "Deleting Account..." : "Verifying..."}
            </CardTitle>
            <CardDescription>
              {completeDeletionMutation.isPending
                ? "Please wait while we delete your account and all associated data"
                : "Checking authentication status"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Error state
  if (completeDeletionMutation.isError) {
    const errorMessage = completeDeletionMutation.error instanceof Error
      ? completeDeletionMutation.error.message
      : "Failed to delete account. The verification link may be invalid or expired."
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full">
                <Icons.Warning className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Deletion Failed</CardTitle>
            <CardDescription className="text-destructive">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The account deletion could not be completed. This may be because:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>The verification link has expired</li>
                <li>The verification link has already been used</li>
                <li>Your session has expired (please sign in again)</li>
                <li>An unexpected error occurred</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push("/settings/account")}
              >
                <Icons.Settings className="mr-2 h-5 w-5" />
                Back to Account Settings
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => router.push("/")}
              >
                <Icons.Home className="mr-2 h-5 w-5" />
                Go to Home Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state - only show when mutation succeeded
  if (completeDeletionMutation.isSuccess) {
    return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Icons.Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Account Deleted</CardTitle>
          <CardDescription>
            Your account has been permanently deleted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Your account and all associated data have been permanently removed from our servers.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium text-foreground">What was deleted:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your user profile and personal information</li>
                <li>All account preferences and settings</li>
                <li>Your activity history and data</li>
                <li>Any active subscriptions or services</li>
              </ul>
            </div>
            <p>
              We&apos;re sorry to see you go. If you ever decide to come back, you&apos;re always welcome to create a new account.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push("/")}
            >
              <Icons.Home className="mr-2 h-5 w-5" />
              Go to Home Page
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => router.push("/auth/sign-up")}
            >
              Create New Account
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to the home page in 10 seconds
          </p>
        </CardContent>
      </Card>
    </div>
    )
  }

  // Default fallback (should not reach here)
  return null
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Icons.Loader className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Loading...</CardTitle>
          <CardDescription>
            Please wait
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function AccountDeletedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccountDeletedContent />
    </Suspense>
  )
}
