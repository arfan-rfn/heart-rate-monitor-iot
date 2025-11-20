/**
 * Quality Indicator Component
 * Shows measurement quality with color-coded badges
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MeasurementQuality } from '@/lib/types/measurement'
import { QUALITY_COLORS } from '@/lib/types/measurement'

interface QualityIndicatorProps {
  quality: MeasurementQuality
  className?: string
  showLabel?: boolean
}

const QUALITY_LABELS = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
} as const

const QUALITY_STYLES = {
  good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300'
} as const

export function QualityIndicator({
  quality,
  className,
  showLabel = true
}: QualityIndicatorProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        QUALITY_STYLES[quality],
        className
      )}
    >
      {showLabel ? QUALITY_LABELS[quality] : null}
      {!showLabel && (
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: QUALITY_COLORS[quality] }}
        />
      )}
    </Badge>
  )
}

interface QualityDistributionProps {
  good: number
  fair: number
  poor: number
  className?: string
}

/**
 * Shows distribution of measurement quality
 * Used in summary cards
 */
export function QualityDistribution({
  good,
  fair,
  poor,
  className
}: QualityDistributionProps) {
  const total = good + fair + poor

  if (total === 0) {
    return <span className="text-sm text-muted-foreground">No data</span>
  }

  const goodPercent = Math.round((good / total) * 100)
  const fairPercent = Math.round((fair / total) * 100)
  const poorPercent = Math.round((poor / total) * 100)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
          {goodPercent > 0 && (
            <div
              className="bg-green-500 h-full"
              style={{ width: `${goodPercent}%` }}
            />
          )}
          {fairPercent > 0 && (
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${fairPercent}%` }}
            />
          )}
          {poorPercent > 0 && (
            <div
              className="bg-red-500 h-full"
              style={{ width: `${poorPercent}%` }}
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {goodPercent}% Good
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          {fairPercent}% Fair
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {poorPercent}% Poor
        </span>
      </div>
    </div>
  )
}

/**
 * Quality indicator dot for charts
 * Small colored dot to show on chart points
 */
export function QualityDot({ quality }: { quality: MeasurementQuality }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: QUALITY_COLORS[quality] }}
      aria-label={`Quality: ${QUALITY_LABELS[quality]}`}
    />
  )
}
