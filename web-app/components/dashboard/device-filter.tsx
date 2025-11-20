'use client'

/**
 * Device Filter Component
 * Modern tab-based device filter for measurements
 */

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getDevices } from '@/lib/api/devices'
import { Smartphone, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeviceFilterProps {
  value: string | undefined
  onChange: (deviceId: string | undefined) => void
  className?: string
}

export function DeviceFilter({ value, onChange, className }: DeviceFilterProps) {
  const { data: devicesData, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices
  })

  if (isLoading) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
    )
  }

  const devices = devicesData?.devices || []

  if (devices.length === 0) {
    return null // Don't show filter if no devices
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm font-medium text-muted-foreground mr-1">View:</span>

      {/* All Devices Button */}
      <Button
        variant={!value ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(undefined)}
        className={cn(
          'gap-2 transition-all',
          !value && 'shadow-sm'
        )}
      >
        <Layers className="h-4 w-4" />
        All Devices
        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
          {devices.length}
        </Badge>
      </Button>

      {/* Individual Device Buttons */}
      {devices.map((device) => (
        <Button
          key={device.deviceId}
          variant={value === device.deviceId ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(device.deviceId)}
          className={cn(
            'gap-2 transition-all',
            value === device.deviceId && 'shadow-sm'
          )}
        >
          <Smartphone className="h-4 w-4" />
          {device.name || device.deviceId}
          {device.status === 'inactive' && (
            <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs border-muted-foreground/30">
              Inactive
            </Badge>
          )}
        </Button>
      ))}
    </div>
  )
}
