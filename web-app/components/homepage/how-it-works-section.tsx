import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">How It Works</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Four Simple Steps
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              From setup to insights in minutes
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {siteConfig.project.howItWorks.map((step, index) => {
              const Icon = Icons[step.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

              return (
                <div key={index} className="relative space-y-4">
                  {/* Step Number */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card text-sm font-semibold">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-accent">
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3">
                <Icons.Check className="h-6 w-6 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Ready to start?</p>
                  <p className="text-sm text-muted-foreground">Create your free account</p>
                </div>
              </div>
              <a
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
