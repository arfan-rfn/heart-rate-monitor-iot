'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Settings } from 'lucide-react'
import { useUpdateDeviceConfig } from '@/hooks/use-physician'
import {
  MEASUREMENT_FREQUENCY_OPTIONS,
  MEASUREMENT_FREQUENCY_LIMITS,
  type PatientDevice,
} from '@/lib/types/physician'

const deviceConfigSchema = z.object({
  measurementFrequency: z
    .number()
    .min(MEASUREMENT_FREQUENCY_LIMITS.MIN)
    .max(MEASUREMENT_FREQUENCY_LIMITS.MAX)
    .optional(),
  activeStartTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format')
    .optional(),
  activeEndTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format')
    .optional(),
})

type DeviceConfigFormValues = z.infer<typeof deviceConfigSchema>

interface DeviceConfigFormProps {
  patientId: string
  device: PatientDevice
}

export function DeviceConfigForm({ patientId, device }: DeviceConfigFormProps) {
  const [open, setOpen] = useState(false)
  const updateConfig = useUpdateDeviceConfig()

  const form = useForm<DeviceConfigFormValues>({
    resolver: zodResolver(deviceConfigSchema),
    defaultValues: {
      measurementFrequency: device.config.measurementFrequency,
      activeStartTime: device.config.activeStartTime,
      activeEndTime: device.config.activeEndTime,
    },
  })

  const onSubmit = async (data: DeviceConfigFormValues) => {
    // Only send fields that have changed
    const updates: DeviceConfigFormValues = {}
    if (
      data.measurementFrequency &&
      data.measurementFrequency !== device.config.measurementFrequency
    ) {
      updates.measurementFrequency = data.measurementFrequency
    }
    if (
      data.activeStartTime &&
      data.activeStartTime !== device.config.activeStartTime
    ) {
      updates.activeStartTime = data.activeStartTime
    }
    if (
      data.activeEndTime &&
      data.activeEndTime !== device.config.activeEndTime
    ) {
      updates.activeEndTime = data.activeEndTime
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      setOpen(false)
      return
    }

    try {
      await updateConfig.mutateAsync({
        patientId,
        deviceId: device.deviceId,
        config: updates,
      })
      setOpen(false)
    } catch (error) {
      // Error toast handled by mutation hook
      console.error('Failed to update device config:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Device Configuration</DialogTitle>
          <DialogDescription>
            Adjust measurement settings for {device.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="measurementFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Measurement Frequency</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEASUREMENT_FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often the device should take measurements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activeStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    When the device should start taking measurements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activeEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active End Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    When the device should stop taking measurements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateConfig.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateConfig.isPending}>
                {updateConfig.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
