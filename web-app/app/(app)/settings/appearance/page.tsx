"use client"

import { useTheme } from "next-themes"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    {
      name: "light",
      label: "Light",
      icon: Icons.Sun
    },
    {
      name: "dark", 
      label: "Dark",
      icon: Icons.Moon
    },
    {
      name: "system",
      label: "System",
      icon: Icons.System
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize the look and feel of the application
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Choose how the interface looks
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.name
              
              return (
                <Button
                  key={themeOption.name}
                  variant={isActive ? "outline" : "ghost"}
                  onClick={() => setTheme(themeOption.name)}
                  className={cn(
                    "relative h-auto flex-col gap-3 p-4",
                    isActive 
                      ? "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary" 
                      : "hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
                  )}
                  <div className={cn(
                    "flex size-12 items-center justify-center rounded-full transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    <Icon className="size-5" />
                  </div>
                  <span className="font-medium">{themeOption.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}