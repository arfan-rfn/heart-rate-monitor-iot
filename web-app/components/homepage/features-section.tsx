import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export function FeaturesSection() {
  return (
    <section className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Core Features</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              Comprehensive tools for tracking and managing your cardiovascular health
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.project.features.map((feature, index) => {
              const Icon = Icons[feature.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

              return (
                <div key={index} className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-accent">
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
