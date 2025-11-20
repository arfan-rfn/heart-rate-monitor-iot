"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { WelcomeModal } from "@/components/welcome-modal"

export default function WelcomeModalPage() {
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
    <WelcomeModal 
      open={open} 
      onOpenChange={handleOpenChange}
    />
  )
}