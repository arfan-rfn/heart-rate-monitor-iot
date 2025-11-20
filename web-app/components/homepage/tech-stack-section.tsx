import { siteConfig } from "@/config/site"
import Link from "next/link"
import { Icons } from "@/components/icons"

export function TechStackSection() {
  const categories = [
    {
      title: "Frontend",
      items: siteConfig.techStack.frontend,
    },
    {
      title: "Backend",
      items: siteConfig.techStack.backend,
    },
    {
      title: "IoT Device",
      items: siteConfig.techStack.iot,
    },
    {
      title: "Deployment",
      items: siteConfig.techStack.deployment,
    },
  ]

  return (
    <section className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Technology Stack</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Built with Modern Technologies
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              Industry-leading tools and frameworks for reliability and performance
            </p>
          </div>

          {/* Tech Stack Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="space-y-4">
                <h3 className="font-semibold">{category.title}</h3>
                <div className="space-y-2">
                  {category.items.map((tech, techIndex) => (
                    <Link
                      key={techIndex}
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{tech.name}</p>
                        <p className="text-sm text-muted-foreground">{tech.description}</p>
                      </div>
                      <Icons.ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="mt-16 rounded-lg border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              All technologies are open-source or industry-standard platforms.{" "}
              <span className="font-medium">Click any item to learn more.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
