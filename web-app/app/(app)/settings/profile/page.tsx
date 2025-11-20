"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useUserProfile, useUpdateUserProfile } from "@/hooks/use-user-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileSettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const updateProfileMutation = useUpdateUserProfile()
  const router = useRouter()

  const [name, setName] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const isLoading = authLoading || profileLoading

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, isLoading, router])

  // Initialize form with profile data
  useEffect(() => {
    if (profile?.user) {
      setName(profile.user.name || "")
    }
  }, [profile])

  // Check if there are changes
  useEffect(() => {
    if (profile?.user) {
      setHasChanges(name !== profile.user.name)
    }
  }, [name, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    updateProfileMutation.mutate(
      { name },
      {
        onSuccess: () => {
          setHasChanges(false)
        },
      }
    )
  }

  const handleReset = () => {
    if (profile?.user) {
      setName(profile.user.name || "")
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
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
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.User className="size-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={updateProfileMutation.isPending}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your name will be displayed across the application.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.user.email || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed through this interface.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Account Role</Label>
                <Input
                  type="text"
                  value={profile?.user.role === "physician" ? "Physician" : "User"}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Your account role is managed by administrators.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={!hasChanges || updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Icons.Loader className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              {hasChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.BarChart className="size-5" />
            Account Statistics
          </CardTitle>
          <CardDescription>
            Overview of your account activity and data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Icons.Heart className="size-5 mt-0.5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Recent Measurements</p>
                <p className="text-2xl font-bold">{profile?.stats.recentMeasurementCount || 0}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Icons.Smartphone className="size-5 mt-0.5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Registered Devices</p>
                <p className="text-2xl font-bold">{profile?.stats.deviceCount || 0}</p>
                <p className="text-xs text-muted-foreground">Active devices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
