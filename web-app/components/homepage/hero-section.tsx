import { siteConfig } from "@/config/site"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 lg:py-40">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Content */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Badge */}
              <div className="flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                  ECE 513 Final Project
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  {siteConfig.name}
                </h1>
                <p className="text-xl text-muted-foreground sm:text-2xl md:text-3xl">
                  {siteConfig.project.tagline}
                </p>
              </div>

              {/* Description */}
              <p className="mx-auto max-w-2xl text-center text-muted-foreground lg:mx-0 lg:text-left">
                {siteConfig.project.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "lg" }), "font-medium")}
                >
                  View Dashboard
                </Link>
                <Link
                  href="/auth/sign-up"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-medium")}
                >
                  Get Started
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground lg:justify-start">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>Real-time Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>24/7 Monitoring</span>
                </div>
              </div>
            </div>

            {/* Right Column - Colorful Visual */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Main Dashboard Card */}
                <div className="relative rounded-2xl border-2 bg-gradient-to-br from-red-50 to-blue-50 p-6 shadow-xl dark:from-red-950/20 dark:to-blue-950/20">
                  <div className="space-y-4">
                    {/* Heart Rate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                          <Icons.Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Heart Rate</p>
                          <p className="text-2xl font-bold">72 BPM</p>
                        </div>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <Icons.TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>

                    {/* SpO2 */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <Icons.Activity className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">SpO2 Level</p>
                            <p className="text-2xl font-bold">98%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </div>
                      <span>Live • Updated just now</span>
                    </div>
                  </div>
                </div>

                {/* Floating Status Cards */}
                <div className="absolute -right-4 -top-4 rounded-xl border-2 bg-gradient-to-br from-green-50 to-emerald-50 p-3 shadow-lg dark:from-green-950/30 dark:to-emerald-950/30">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                      <Icons.Wifi className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold">Connected</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 rounded-xl border-2 bg-gradient-to-br from-purple-50 to-violet-50 p-3 shadow-lg dark:from-purple-950/30 dark:to-violet-950/30">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                      <Icons.Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold">Secure Data</span>
                  </div>
                </div>

                {/* Mini Chart Indicator */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-lg border-2 bg-gradient-to-br from-yellow-50 to-orange-50 p-2 shadow-lg dark:from-yellow-950/30 dark:to-orange-950/30">
                  <div className="flex items-center gap-1.5">
                    <Icons.BarChart3 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-semibold">Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
