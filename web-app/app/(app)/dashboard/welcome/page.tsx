"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { WelcomeModal } from "@/components/welcome-modal"

export default function WelcomePage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-md mx-auto pt-20">
        <h1 className="text-2xl font-semibold text-center mb-8">Welcome!</h1>
        <WelcomeModal 
          open={open} 
          onOpenChange={handleOpenChange}
        />
      </div>
    </div>
  )
}