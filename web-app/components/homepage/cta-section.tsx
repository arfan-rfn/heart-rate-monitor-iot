import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CTASection() {
  return (
    <section className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start Monitoring Your Health Today
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join PulseConnect and take control of your cardiovascular health with real-time
            monitoring and actionable insights.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "lg" }), "font-medium")}>
              Create Free Account
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-medium")}
            >
              View Demo
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>Free for students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span>24/7 data access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
