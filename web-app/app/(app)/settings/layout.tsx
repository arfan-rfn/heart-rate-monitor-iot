"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

const settingsNav = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: Icons.User,
    description: "Update your name and view account statistics"
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: Icons.Key,
    description: "View account information and manage sessions"
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Icons.Lock,
    description: "Change password and security settings"
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Icons.Sun,
    description: "Customize theme and visual preferences"
  }
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        {/* Mobile Navigation - Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:hidden">
          {settingsNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => router.push(item.href)}
                className={cn(
                  "shrink-0 rounded-full gap-x-1.5",
                  isActive && "shadow-lg"
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Button>
            )
          })}
        </div>

        {/* Desktop Layout */}
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg p-3 transition-all",
                      isActive
                        ? "bg-primary/5 text-primary border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 rounded-md p-1.5 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted group-hover:bg-muted/80"
                    )}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className={cn(
                        "font-medium text-sm",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {item.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}