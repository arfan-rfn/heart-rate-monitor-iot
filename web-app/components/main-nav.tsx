'use client'

import * as React from "react"
import Link from "next/link"

import { NavItem } from "@/lib/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { useSession } from "@/lib/auth"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const { data: session } = useSession()

  // Add "My Patients" link for physician users
  const navigationItems = React.useMemo(() => {
    const baseItems = items || []

    // If user is a physician, add "My Patients" link
    if (session?.user?.role === 'physician') {
      return [
        ...baseItems,
        {
          title: "My Patients",
          href: "/physician",
        },
      ]
    }

    return baseItems
  }, [items, session?.user?.role])

  return (
    <div className="hidden gap-6 md:flex md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.Logo className="size-12" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>

      <nav className="flex gap-6">
        {navigationItems?.map(
          (item, index) =>
            item.href && (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium text-muted-foreground",
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {item.title}
              </Link>
            )
        )}
      </nav>

    </div>
  )
}
