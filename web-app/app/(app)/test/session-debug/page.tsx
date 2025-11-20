"use client"

import { useAuthContext } from "@/components/providers/auth-provider"
import { authClient } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SessionDebugPage() {
  const { user, session, isLoading, isAuthenticated, refresh } = useAuthContext()
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkSession = async () => {
    try {
      const sessionData = await authClient.getSession()
      setDebugInfo({ sessionData, timestamp: new Date().toISOString() })
    } catch (error: any) {
      setDebugInfo({ error: error.message, timestamp: new Date().toISOString() })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Session Debug Page</h1>

      <div className="space-y-6">
        {/* Auth Context State */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Auth Context State</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Is Loading:</strong> {isLoading ? "Yes" : "No"}
            </div>
            <div>
              <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
            </div>
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Session:</strong>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Manual Session Check */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Manual Session Check</h2>
          <div className="flex gap-3 mb-3">
            <Button onClick={checkSession}>Check Session</Button>
            <Button onClick={() => refresh()} variant="outline">
              Refresh Context
            </Button>
          </div>
          {debugInfo && (
            <div>
              <strong>Debug Info:</strong>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Cookie Info */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Cookies</h2>
          <pre className="p-2 bg-muted rounded text-xs overflow-auto">
            {document.cookie || "No cookies found"}
          </pre>
        </div>
      </div>
    </div>
  )
}
