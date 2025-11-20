'use client'

/**
 * Threshold Alerts Component
 * Shows warnings when measurements are outside normal ranges
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import {
  HEART_RATE_THRESHOLDS,
  SPO2_THRESHOLDS,
  isAbnormalHeartRate,
  isAbnormalSpO2,
  isCriticalHeartRate,
  isCriticalSpO2,
  type DailyMeasurementsResponse
} from '@/lib/types/measurement'
import { useMemo } from 'react'

interface ThresholdAlertsProps {
  measurements?: DailyMeasurementsResponse
  className?: string
}

interface AlertData {
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  count: number
}

export function ThresholdAlerts({ measurements, className }: ThresholdAlertsProps) {
  const alerts = useMemo(() => {
    if (!measurements || measurements.measurements.length === 0) {
      return []
    }

    const alertData: AlertData[] = []
    let criticalHR = 0
    let abnormalHR = 0
    let criticalSpO2 = 0
    let abnormalSpO2 = 0

    // Analyze all measurements
    measurements.measurements.forEach((m) => {
      if (isCriticalHeartRate(m.heartRate)) {
        criticalHR++
      } else if (isAbnormalHeartRate(m.heartRate)) {
        abnormalHR++
      }

      if (isCriticalSpO2(m.spO2)) {
        criticalSpO2++
      } else if (isAbnormalSpO2(m.spO2)) {
        abnormalSpO2++
      }
    })

    // Critical heart rate alert
    if (criticalHR > 0) {
      alertData.push({
        type: 'critical',
        title: 'Critical Heart Rate Detected',
        description: `${criticalHR} measurement${criticalHR > 1 ? 's' : ''} outside safe range (${HEART_RATE_THRESHOLDS.warning.min}-${HEART_RATE_THRESHOLDS.warning.max} bpm). Please consult a physician.`,
        count: criticalHR
      })
    }

    // Abnormal heart rate alert
    if (abnormalHR > 0) {
      alertData.push({
        type: 'warning',
        title: 'Heart Rate Outside Normal Range',
        description: `${abnormalHR} measurement${abnormalHR > 1 ? 's' : ''} outside normal range (${HEART_RATE_THRESHOLDS.normal.min}-${HEART_RATE_THRESHOLDS.normal.max} bpm).`,
        count: abnormalHR
      })
    }

    // Critical SpO2 alert
    if (criticalSpO2 > 0) {
      alertData.push({
        type: 'critical',
        title: 'Critical SpO2 Level',
        description: `${criticalSpO2} measurement${criticalSpO2 > 1 ? 's' : ''} with dangerously low oxygen saturation (<${SPO2_THRESHOLDS.warning.min}%). Seek immediate medical attention.`,
        count: criticalSpO2
      })
    }

    // Low SpO2 alert
    if (abnormalSpO2 > 0) {
      alertData.push({
        type: 'warning',
        title: 'Low Oxygen Saturation',
        description: `${abnormalSpO2} measurement${abnormalSpO2 > 1 ? 's' : ''} with SpO2 below ${SPO2_THRESHOLDS.normal.min}%.`,
        count: abnormalSpO2
      })
    }

    return alertData
  }, [measurements])

  if (alerts.length === 0) {
    return (
      <Alert className={className}>
        <Info className="h-4 w-4" />
        <AlertTitle>All measurements within normal range</AlertTitle>
        <AlertDescription>
          Your vital signs are looking good. Keep up the healthy habits!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === 'critical' ? 'destructive' : 'default'}
          className={
            alert.type === 'warning'
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
              : ''
          }
        >
          {alert.type === 'critical' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle className="flex items-center gap-2">
            {alert.title}
            <Badge
              variant={alert.type === 'critical' ? 'destructive' : 'outline'}
              className="ml-auto"
            >
              {alert.count} {alert.count === 1 ? 'occurrence' : 'occurrences'}
            </Badge>
          </AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

/**
 * Threshold reference info component
 * Shows what the normal ranges are
 */
export function ThresholdInfo() {
  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p className="font-medium">Normal Ranges:</p>
      <ul className="space-y-0.5 ml-4">
        <li>
          • Heart Rate: {HEART_RATE_THRESHOLDS.normal.min}-
          {HEART_RATE_THRESHOLDS.normal.max} bpm
        </li>
        <li>
          • SpO2: {SPO2_THRESHOLDS.normal.min}-{SPO2_THRESHOLDS.normal.max}%
        </li>
      </ul>
    </div>
  )
}
