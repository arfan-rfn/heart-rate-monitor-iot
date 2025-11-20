"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDevices } from "@/lib/api/devices"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { RegisterDeviceDialog } from "@/components/devices/register-device-dialog"
import { DeviceCard } from "@/components/devices/device-card"

export default function DevicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push("/auth/sign-in")
    }
  }, [isAuthenticated, authLoading, router])

  const { data, isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    enabled: isAuthenticated,
  })

  if (!isAuthenticated && !authLoading) {
    return null
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IoT Devices</h1>
          <p className="text-muted-foreground mt-2">
            Manage your heart rate monitoring devices
          </p>
        </div>
        <RegisterDeviceDialog />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Icons.Loader className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <Icons.AlertTriangle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load devices"}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && data && data.devices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Icons.Activity className="size-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No devices registered</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by registering your first IoT device to begin collecting heart rate
            and SpO2 measurements.
          </p>
          <RegisterDeviceDialog />
        </div>
      )}

      {/* Devices Grid */}
      {!isLoading && !error && data && data.devices.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {data.count} {data.count === 1 ? 'device' : 'devices'} registered
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      {!isLoading && data && data.devices.length > 0 && (
        <Alert>
          <Icons.Info className="size-4" />
          <AlertTitle>Device Management</AlertTitle>
          <AlertDescription>
            Click the menu icon on any device card to configure settings, change status, or delete the device.
            Each device has its own API key that was provided during registration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
