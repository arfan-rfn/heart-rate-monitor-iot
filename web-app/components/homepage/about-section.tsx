import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"

export function AboutSection() {
  const benefits = [
    {
      icon: "Heart",
      title: "Clinical-Grade Accuracy",
      description: "MAX30102 sensor provides medical-grade measurements for heart rate and blood oxygen saturation levels.",
    },
    {
      icon: "Clock",
      title: "Automated Reminders",
      description: "Smart LED notifications ensure you never miss a scheduled measurement throughout your day.",
    },
    {
      icon: "BarChart3",
      title: "Visual Analytics",
      description: "Interactive charts and graphs help you understand patterns and trends in your health data over time.",
    },
    {
      icon: "Database",
      title: "Offline Capability",
      description: "Device stores up to 24 hours of data locally, automatically syncing when connection is restored.",
    },
    {
      icon: "Lock",
      title: "Enterprise Security",
      description: "Your health data is encrypted and protected with industry-standard security protocols.",
    },
    {
      icon: "Smartphone",
      title: "Cross-Platform Access",
      description: "Monitor your health from any device - desktop, tablet, or smartphone with responsive design.",
    },
  ]

  return (
    <section className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">About the Project</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              About PulseConnect
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              A comprehensive IoT solution for continuous cardiovascular health monitoring
            </p>
          </div>

          {/* Main Description */}
          <div className="mb-16 rounded-lg border bg-card p-8 md:p-10">
            <p className="mb-8 text-center leading-relaxed text-muted-foreground">
              {siteConfig.project.description}
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Icons.Heart className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">Heart Rate</p>
                <p className="text-xs text-muted-foreground">Continuous monitoring</p>
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Icons.Activity className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">SpO2 Level</p>
                <p className="text-xs text-muted-foreground">Real-time tracking</p>
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Icons.Cloud className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">Data Sync</p>
                <p className="text-xs text-muted-foreground">Automatic updates</p>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = Icons[benefit.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

              return (
                <div key={index} className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-accent">
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-8 border-t pt-16 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">24/7</div>
              <p className="text-sm text-muted-foreground">Continuous Monitoring</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">&lt;1s</div>
              <p className="text-sm text-muted-foreground">Data Sync Time</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold">100%</div>
              <p className="text-sm text-muted-foreground">HIPAA Compliant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
