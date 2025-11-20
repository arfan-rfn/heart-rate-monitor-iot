/**
 * Export Utilities
 * Functions for exporting measurement data to CSV and PDF
 */

import Papa from 'papaparse'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import type { Measurement } from '@/lib/types/measurement'

/**
 * Export measurements to CSV
 * @param measurements - Array of measurements to export
 * @param filename - Optional filename (default: measurements-[date].csv)
 */
export function exportToCSV(measurements: Measurement[], filename?: string): void {
  if (measurements.length === 0) {
    throw new Error('No measurements to export')
  }

  // Transform data for CSV
  const csvData = measurements.map((m) => ({
    Date: format(new Date(m.timestamp), 'yyyy-MM-dd'),
    Time: format(new Date(m.timestamp), 'HH:mm:ss'),
    'Heart Rate (bpm)': m.heartRate,
    'SpO2 (%)': m.spO2,
    Quality: m.quality,
    'Confidence (%)': Math.round(m.confidence * 100),
    'Device ID': m.deviceId
  }))

  // Convert to CSV
  const csv = Papa.unparse(csvData, {
    header: true,
    quotes: true
  })

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename || `measurements-${format(new Date(), 'yyyy-MM-dd')}.csv`
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export charts to PDF
 * @param chartIds - Array of chart element IDs to capture
 * @param filename - Optional filename (default: health-report-[date].pdf)
 */
export async function exportToPDF(
  chartIds: string[],
  summaryData?: {
    title: string
    stats: Array<{ label: string; value: string }>
  },
  filename?: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15

  // Add title
  pdf.setFontSize(20)
  pdf.text(summaryData?.title || 'Health Monitoring Report', margin, margin + 10)

  // Add date
  pdf.setFontSize(10)
  pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, margin, margin + 18)

  let yPosition = margin + 30

  // Add summary stats if provided
  if (summaryData?.stats) {
    pdf.setFontSize(12)
    pdf.text('Summary Statistics', margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    summaryData.stats.forEach((stat) => {
      pdf.text(`${stat.label}: ${stat.value}`, margin + 5, yPosition)
      yPosition += 6
    })

    yPosition += 10
  }

  // Capture and add charts
  for (let i = 0; i < chartIds.length; i++) {
    const element = document.getElementById(chartIds[i])
    if (!element) continue

    // Check if we need a new page
    if (yPosition + 100 > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth - 2 * margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10
    } catch (error) {
      console.error(`Failed to capture chart ${chartIds[i]}:`, error)
    }
  }

  // Add footer
  const totalPages = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Download PDF
  pdf.save(filename || `health-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

/**
 * Get file size estimate for measurements
 * @param count - Number of measurements
 * @returns Estimated file size in KB
 */
export function getEstimatedFileSize(count: number): number {
  // Each measurement row is approximately 100 bytes in CSV
  return Math.ceil((count * 100) / 1024)
}
