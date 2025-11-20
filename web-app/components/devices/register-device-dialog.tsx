"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { registerDevice } from "@/lib/api/devices"
import { toast } from "sonner"
import { ApiKeyDialog } from "./api-key-dialog"

interface RegisterDeviceDialogProps {
  trigger?: React.ReactNode
}

export function RegisterDeviceDialog({ trigger }: RegisterDeviceDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [deviceId, setDeviceId] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [generatedApiKey, setGeneratedApiKey] = useState("")

  const registerMutation = useMutation({
    mutationFn: registerDevice,
    onSuccess: (data) => {
      // Store the API key and device name
      setGeneratedApiKey(data.device.apiKey)

      // Close registration dialog and open API key dialog
      setOpen(false)
      setShowApiKeyDialog(true)

      // Invalidate devices list query
      queryClient.invalidateQueries({ queryKey: ['devices'] })

      toast.success(`Device "${data.device.name}" registered successfully`)
    },
    onError: (error: any) => {
      console.error("Failed to register device:", error)
      toast.error(error?.message || "Failed to register device")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deviceId.trim() || !deviceName.trim()) {
      toast.error("Device ID and name are required")
      return
    }
    registerMutation.mutate({
      deviceId: deviceId.trim(),
      name: deviceName.trim(),
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setDeviceId("")
      setDeviceName("")
    }
  }

  const defaultTrigger = (
    <Button>
      <Icons.Plus className="size-4 mr-2" />
      Register Device
    </Button>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register New Device</DialogTitle>
            <DialogDescription>
              Register a new IoT device to start collecting heart rate and SpO2 measurements.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deviceId">
                Device ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deviceId"
                placeholder="e.g., photon-12345abc"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                disabled={registerMutation.isPending}
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for your IoT device (e.g., Particle Photon device ID)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">
                Device Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deviceName"
                placeholder="e.g., Living Room Monitor"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                disabled={registerMutation.isPending}
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                A friendly name to identify this device (max 100 characters)
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={registerMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? (
                  <>
                    <Icons.Loader className="size-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Icons.Plus className="size-4 mr-2" />
                    Register Device
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        apiKey={generatedApiKey}
        deviceName={deviceName}
      />
    </>
  )
}
