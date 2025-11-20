"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Icons } from "@/components/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteDevice, updateDevice } from "@/lib/api/devices"
import { toast } from "sonner"
import type { Device, DeviceStatus } from "@/lib/types/device"
import { DeviceConfigDialog } from "./device-config-dialog"

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteDevice(device.deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success(`Device "${device.name}" deleted successfully`)
      setShowDeleteDialog(false)
    },
    onError: (error: any) => {
      console.error("Failed to delete device:", error)
      toast.error(error?.message || "Failed to delete device")
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: DeviceStatus) => updateDevice(device.deviceId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      toast.success("Device status updated")
    },
    onError: (error: any) => {
      console.error("Failed to update device:", error)
      toast.error(error?.message || "Failed to update device status")
    },
  })

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-600">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  const formatFrequency = (seconds: number) => {
    const minutes = seconds / 60
    if (minutes < 60) return `${minutes} min`
    const hours = minutes / 60
    return `${hours} hr`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Icons.Activity className="size-5" />
                {device.name}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {device.deviceId}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(device.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Icons.MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowConfigDialog(true)}>
                    <Icons.Settings className="size-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate("active")}
                    disabled={device.status === "active"}
                  >
                    <Icons.Check className="size-4 mr-2" />
                    Mark Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatusMutation.mutate("inactive")}
                    disabled={device.status === "inactive"}
                  >
                    <Icons.Pause className="size-4 mr-2" />
                    Mark Inactive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Icons.Trash className="size-4 mr-2" />
                    Delete Device
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Last Seen</p>
              <p className="font-medium">{formatDate(device.lastSeen)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Measurement Freq.</p>
              <p className="font-medium">{formatFrequency(device.config.measurementFrequency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Hours</p>
              <p className="font-medium">
                {device.config.activeStartTime} - {device.config.activeEndTime}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Timezone</p>
              <p className="font-medium">{device.config.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{device.name}&quot; and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Icons.Loader className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Device"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Config Dialog */}
      <DeviceConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        device={device}
      />
    </>
  )
}
