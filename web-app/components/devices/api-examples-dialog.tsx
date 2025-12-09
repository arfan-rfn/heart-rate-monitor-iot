"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { env } from "@/env"

interface ApiExamplesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deviceId: string
  deviceName: string
}

export function ApiExamplesDialog({
  open,
  onOpenChange,
  deviceId,
  deviceName,
}: ApiExamplesDialogProps) {
  const apiUrl = env.NEXT_PUBLIC_API_URL

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const postMeasurementExample = `curl -X POST ${apiUrl}/api/measurements \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "${deviceId}",
    "heartRate": 72,
    "spO2": 98,
    "timestamp": "${new Date().toISOString()}"
  }'`

  const getConfigExample = `curl -H "X-API-Key: YOUR_API_KEY" \\
  "${apiUrl}/api/devices/${deviceId}/config"`

  const postMeasurementResponse = `{
  "success": true,
  "data": {
    "measurement": {
      "id": "69376b643d9c6a5f40fce6a2",
      "heartRate": 72,
      "spO2": 98,
      "timestamp": "${new Date().toISOString()}",
      "quality": "good",
      "confidence": 1
    }
  }
}`

  const getConfigResponse = `{
  "success": true,
  "data": {
    "config": {
      "measurementFrequency": 1800,
      "activeStartTime": "06:00",
      "activeEndTime": "22:00",
      "timezone": "America/New_York"
    }
  }
}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.Terminal className="size-5" />
            API Examples for {deviceName}
          </DialogTitle>
          <DialogDescription>
            Use these curl commands to interact with the API from your IoT device.
            Replace <code className="bg-muted px-1 py-0.5 rounded text-xs">YOUR_API_KEY</code> with
            the API key you received when registering the device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* POST Measurement Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-mono">POST</span>
                Send Measurement Data
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(postMeasurementExample, "POST command")}
              >
                <Icons.Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Send heart rate and SpO2 measurements from your IoT device to the server.
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-900 text-slate-200">
                {postMeasurementExample}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Parameters:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li><code className="bg-muted px-1 rounded">deviceId</code> - Your device ID (pre-filled: <code className="bg-muted px-1 rounded">{deviceId}</code>)</li>
                <li><code className="bg-muted px-1 rounded">heartRate</code> - Heart rate in BPM (integer, 30-250)</li>
                <li><code className="bg-muted px-1 rounded">spO2</code> - Blood oxygen saturation percentage (integer, 50-100)</li>
                <li><code className="bg-muted px-1 rounded">timestamp</code> - ISO 8601 timestamp with timezone</li>
              </ul>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sample Response:</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-800 text-green-400">
                  {postMeasurementResponse}
                </pre>
              </div>
            </div>
          </div>

          {/* GET Config Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-mono">GET</span>
                Get Device Configuration
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(getConfigExample, "GET command")}
              >
                <Icons.Copy className="size-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Retrieve the current configuration settings for your device (measurement frequency, active hours, timezone).
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-900 text-slate-200">
                {getConfigExample}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Response fields:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li><code className="bg-muted px-1 rounded">measurementFrequency</code> - How often to take measurements (in seconds)</li>
                <li><code className="bg-muted px-1 rounded">activeStartTime</code> - Start of active measurement window (HH:MM)</li>
                <li><code className="bg-muted px-1 rounded">activeEndTime</code> - End of active measurement window (HH:MM)</li>
                <li><code className="bg-muted px-1 rounded">timezone</code> - IANA timezone for the device</li>
              </ul>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sample Response:</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-800 text-green-400">
                  {getConfigResponse}
                </pre>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex gap-3">
              <Icons.Info className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium">Integration Tips</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>Store the API key securely on your IoT device (e.g., in flash memory or secure element).</li>
                  <li>Poll the config endpoint periodically to get updated measurement settings.</li>
                  <li>Include the device ID in measurement requests for proper data association.</li>
                  <li>Use HTTPS in production for secure communication.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
