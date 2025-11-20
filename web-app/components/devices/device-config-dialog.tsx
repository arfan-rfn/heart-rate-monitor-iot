"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateDeviceConfig } from "@/lib/api/devices"
import { toast } from "sonner"
import type { Device } from "@/lib/types/device"

interface DeviceConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: Device | null
}

// Common IANA timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "UTC", label: "UTC" },
]

export function DeviceConfigDialog({
  open,
  onOpenChange,
  device,
}: DeviceConfigDialogProps) {
  const queryClient = useQueryClient()
  const [measurementFrequency, setMeasurementFrequency] = useState("")
  const [activeStartTime, setActiveStartTime] = useState("")
  const [activeEndTime, setActiveEndTime] = useState("")
  const [timezone, setTimezone] = useState("")

  // Initialize form with device config when device changes
  useEffect(() => {
    if (device) {
      setMeasurementFrequency(String(device.config.measurementFrequency))
      setActiveStartTime(device.config.activeStartTime)
      setActiveEndTime(device.config.activeEndTime)
      setTimezone(device.config.timezone)
    }
  }, [device])

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => {
      if (!device) throw new Error("No device selected")
      return updateDeviceConfig(device.deviceId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['device', device?.deviceId] })
      toast.success("Device configuration updated successfully")
      onOpenChange(false)
    },
    onError: (error: any) => {
      console.error("Failed to update device config:", error)
      toast.error(error?.message || "Failed to update device configuration")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const frequency = parseInt(measurementFrequency)
    if (isNaN(frequency) || frequency < 900 || frequency > 14400) {
      toast.error("Measurement frequency must be between 900 and 14400 seconds (15 min - 4 hours)")
      return
    }

    updateConfigMutation.mutate({
      measurementFrequency: frequency,
      activeStartTime,
      activeEndTime,
      timezone,
    })
  }

  if (!device) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Device</DialogTitle>
          <DialogDescription>
            Update the configuration for &quot;{device.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">
              Measurement Frequency (seconds)
            </Label>
            <Input
              id="frequency"
              type="number"
              min={900}
              max={14400}
              step={1}
              value={measurementFrequency}
              onChange={(e) => setMeasurementFrequency(e.target.value)}
              disabled={updateConfigMutation.isPending}
              required
            />
            <p className="text-xs text-muted-foreground">
              How often the device should take measurements (900-14400 seconds, default: 1800)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Active Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={activeStartTime}
                onChange={(e) => setActiveStartTime(e.target.value)}
                disabled={updateConfigMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Active End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={activeEndTime}
                onChange={(e) => setActiveEndTime(e.target.value)}
                disabled={updateConfigMutation.isPending}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Time window when the device should actively collect measurements
          </p>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={timezone}
              onValueChange={setTimezone}
              disabled={updateConfigMutation.isPending}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Timezone for the active time window
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateConfigMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateConfigMutation.isPending}>
              {updateConfigMutation.isPending ? (
                <>
                  <Icons.Loader className="size-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icons.Settings className="size-4 mr-2" />
                  Update Config
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
