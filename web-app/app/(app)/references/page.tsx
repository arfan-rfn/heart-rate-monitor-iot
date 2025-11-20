import { getSEOTags } from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Icons } from "@/components/icons"

export const metadata = getSEOTags({
  title: "References - Third-Party APIs, Libraries, and Code",
  description: "List of third-party APIs, libraries, and code used in the Heart Track project.",
  relativeUrl: "/references",
})

export default function ReferencesPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            References
          </h1>
          <p className="text-lg text-muted-foreground">
            Third-party APIs, libraries, and code used in the Heart Track project
          </p>
        </div>

        {/* Frontend Libraries */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Frontend Libraries & Frameworks
            </CardTitle>
            <CardDescription>
              UI components, styling, and client-side functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="Next.js"
                version="15.2.4"
                url="https://nextjs.org/"
                license="MIT"
                description="React framework for production-grade applications"
              />
              <ReferenceItem
                name="React"
                version="19.x"
                url="https://react.dev/"
                license="MIT"
                description="JavaScript library for building user interfaces"
              />
              <ReferenceItem
                name="Tailwind CSS"
                version="4.x"
                url="https://tailwindcss.com/"
                license="MIT"
                description="Utility-first CSS framework"
              />
              <ReferenceItem
                name="shadcn/ui"
                version="Latest"
                url="https://ui.shadcn.com/"
                license="MIT"
                description="Re-usable components built with Radix UI and Tailwind CSS"
              />
              <ReferenceItem
                name="Radix UI"
                version="Latest"
                url="https://www.radix-ui.com/"
                license="MIT"
                description="Unstyled, accessible UI component primitives"
              />
              <ReferenceItem
                name="Recharts"
                version="2.15.4"
                url="https://recharts.org/"
                license="MIT"
                description="Composable charting library built on React components"
              />
              <ReferenceItem
                name="Lucide React"
                version="Latest"
                url="https://lucide.dev/"
                license="ISC"
                description="Beautiful & consistent icon toolkit"
              />
              <ReferenceItem
                name="TanStack Query"
                version="5.x"
                url="https://tanstack.com/query/"
                license="MIT"
                description="Powerful data synchronization for React"
              />
              <ReferenceItem
                name="date-fns"
                version="4.1.0"
                url="https://date-fns.org/"
                license="MIT"
                description="Modern JavaScript date utility library"
              />
              <ReferenceItem
                name="Zod"
                version="Latest"
                url="https://zod.dev/"
                license="MIT"
                description="TypeScript-first schema validation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Backend Libraries */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Backend Libraries & APIs
            </CardTitle>
            <CardDescription>
              Server-side functionality, database, and authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="Node.js"
                version="18.x+"
                url="https://nodejs.org/"
                license="MIT"
                description="JavaScript runtime built on Chrome's V8 engine"
              />
              <ReferenceItem
                name="Express.js"
                version="4.x"
                url="https://expressjs.com/"
                license="MIT"
                description="Fast, unopinionated web framework for Node.js"
              />
              <ReferenceItem
                name="MongoDB"
                version="7.x"
                url="https://www.mongodb.com/"
                license="SSPL"
                description="NoSQL database for modern applications"
              />
              <ReferenceItem
                name="Mongoose"
                version="Latest"
                url="https://mongoosejs.com/"
                license="MIT"
                description="MongoDB object modeling for Node.js"
              />
              <ReferenceItem
                name="Better Auth"
                version="Latest"
                url="https://www.better-auth.com/"
                license="MIT"
                description="Authentication library for modern web apps"
              />
              <ReferenceItem
                name="bcrypt"
                version="Latest"
                url="https://github.com/kelektiv/node.bcrypt.js"
                license="MIT"
                description="Password hashing library"
              />
            </div>
          </CardContent>
        </Card>

        {/* IoT & Hardware */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔌</span>
              IoT Hardware & Firmware
            </CardTitle>
            <CardDescription>
              Embedded device, sensors, and firmware libraries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="Particle Photon"
                version="Hardware"
                url="https://docs.particle.io/photon/"
                license="Open Hardware"
                description="Wi-Fi enabled IoT development board"
              />
              <ReferenceItem
                name="MAX30102"
                version="Hardware"
                url="https://www.maximintegrated.com/en/products/interface/sensor-interface/MAX30102.html"
                license="Commercial"
                description="Pulse oximetry and heart-rate sensor module"
              />
              <ReferenceItem
                name="SparkFun MAX3010x Library"
                version="Latest"
                url="https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library"
                license="MIT"
                description="Arduino library for MAX30102 sensor"
              />
            </div>
          </CardContent>
        </Card>

        {/* Development Tools */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🛠️</span>
              Development Tools
            </CardTitle>
            <CardDescription>
              Build tools, testing, and developer utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="TypeScript"
                version="5.9.3"
                url="https://www.typescriptlang.org/"
                license="Apache-2.0"
                description="Typed superset of JavaScript"
              />
              <ReferenceItem
                name="ESLint"
                version="9.x"
                url="https://eslint.org/"
                license="MIT"
                description="Pluggable JavaScript linter"
              />
              <ReferenceItem
                name="Prettier"
                version="Latest"
                url="https://prettier.io/"
                license="MIT"
                description="Opinionated code formatter"
              />
              <ReferenceItem
                name="Turbopack"
                version="Next.js Built-in"
                url="https://turbo.build/pack"
                license="MPL-2.0"
                description="Incremental bundler optimized for JavaScript and TypeScript"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deployment & Infrastructure */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">☁️</span>
              Deployment & Infrastructure
            </CardTitle>
            <CardDescription>
              Hosting platforms and cloud services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="Vercel"
                version="Platform"
                url="https://vercel.com/"
                license="Commercial"
                description="Frontend hosting platform for Next.js applications"
              />
              <ReferenceItem
                name="AWS (Amazon Web Services)"
                version="Platform"
                url="https://aws.amazon.com/"
                license="Commercial"
                description="Cloud platform for backend server hosting"
              />
              <ReferenceItem
                name="MongoDB Atlas"
                version="Platform"
                url="https://www.mongodb.com/atlas"
                license="Commercial"
                description="Cloud-hosted MongoDB database service"
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Materials & Documentation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Course Materials & Documentation
            </CardTitle>
            <CardDescription>
              Academic resources and project guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReferenceItem
                name="ECE 413/513 Course Materials"
                version="Fall 2025"
                url="#"
                license="Academic"
                description="Course lectures, examples, and project specifications"
              />
              <ReferenceItem
                name="MDN Web Docs"
                version="Online"
                url="https://developer.mozilla.org/"
                license="CC-BY-SA-2.5"
                description="Web development documentation and tutorials"
              />
              <ReferenceItem
                name="Node.js Documentation"
                version="Latest"
                url="https://nodejs.org/docs/"
                license="MIT"
                description="Official Node.js API documentation"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🙏</span>
              Additional Credits
            </CardTitle>
            <CardDescription>
              Other resources and inspirations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We would like to acknowledge the following resources that helped in the
                development of this project:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm text-muted-foreground">
                <li>Stack Overflow community for troubleshooting and solutions</li>
                <li>GitHub open-source community for code examples and inspiration</li>
                <li>Course teaching assistants and instructor for guidance and support</li>
                <li>Various blog posts and tutorials from the web development community</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 rounded-lg border bg-muted p-4 text-center text-sm text-muted-foreground">
          <p>
            All third-party libraries and APIs are used in accordance with their respective
            licenses. This project is for educational purposes as part of the ECE 413/513
            course at the University of Arizona.
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper Component for Reference Items
function ReferenceItem({
  name,
  version,
  url,
  license,
  description,
}: {
  name: string
  version: string
  url: string
  license: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{name}</h3>
        <Badge variant="secondary">{version}</Badge>
        <Badge variant="outline">{license}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-fit items-center gap-1 text-sm text-primary hover:underline"
      >
        <Icons.ArrowRight className="h-3 w-3" />
        {url}
      </Link>
    </div>
  )
}
