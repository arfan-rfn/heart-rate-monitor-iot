'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, User, Calendar } from 'lucide-react'
import type { PatientInfo } from '@/lib/types/physician'

interface PatientSummaryCardProps {
  patient: PatientInfo
  totalMeasurements?: number
  dateRange?: {
    start: string
    end: string
  }
}

export function PatientSummaryCard({
  patient,
  totalMeasurements,
  dateRange,
}: PatientSummaryCardProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>Overview of patient details and activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{patient.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{patient.email}</span>
              </div>
            </div>

            {(totalMeasurements !== undefined || dateRange) && (
              <div className="flex flex-wrap gap-2">
                {totalMeasurements !== undefined && (
                  <Badge variant="secondary">
                    {totalMeasurements} measurement{totalMeasurements === 1 ? '' : 's'}
                  </Badge>
                )}
                {dateRange && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(dateRange.start).toLocaleDateString()} -{' '}
                    {new Date(dateRange.end).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
