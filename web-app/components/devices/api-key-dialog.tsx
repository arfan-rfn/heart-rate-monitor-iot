"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  deviceName?: string
}

export function ApiKeyDialog({ open, onOpenChange, apiKey, deviceName }: ApiKeyDialogProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Device API Key Generated</DialogTitle>
          <DialogDescription>
            {deviceName ? `API key for device "${deviceName}"` : "Your device API key"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert variant="destructive">
            <Icons.AlertTriangle className="size-4" />
            <AlertTitle>Important - Save This Key Now</AlertTitle>
            <AlertDescription>
              This API key will only be shown once. Make sure to copy and save it securely
              before closing this dialog. You will not be able to view the full key again.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey)}
                className="shrink-0"
              >
                <Icons.Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b border-border">
              <p className="text-sm font-medium">Usage Example (curl):</p>
            </div>
            <pre className="text-xs p-4 overflow-x-auto whitespace-pre-wrap break-all bg-slate-900 text-slate-200">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/measurements \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "heartRate": 72,
    "spO2": 98,
    "timestamp": "${new Date().toISOString()}"
  }'`}
            </pre>
          </div>

          <Alert>
            <Icons.Info className="size-4" />
            <AlertTitle>How to Use This Key</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>
                Configure your IoT device with this API key. Include it in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">X-API-Key</code>{" "}
                header when making requests to submit measurements.
              </p>
              <p className="font-medium">
                The API will automatically associate measurements with this device.
              </p>
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            I&apos;ve Saved My Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
