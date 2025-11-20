"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ProfileEditDialog } from "@/components/profile-edit-dialog"

export default function ProfileModalPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      router.back()
    }
  }

  return (
    <ProfileEditDialog 
      open={open} 
      onOpenChange={handleOpenChange}
    />
  )
}