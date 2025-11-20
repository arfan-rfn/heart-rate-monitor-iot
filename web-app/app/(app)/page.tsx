import { JsonLd } from "@/components/json-ld"
import { getSEOTags } from "@/lib/seo"
import { siteConfig } from "@/config/site"
import {
  HeroSection,
  FeaturesSection,
  TeamSection,
  CTASection,
} from "@/components/homepage"

export const metadata = getSEOTags({
  title: `${siteConfig.name} - IoT Heart Rate Monitoring`,
  description: siteConfig.description,
  relativeUrl: "/",
})

export default function IndexPage() {
  const jsonLd = {
    name: siteConfig.name,
    description: siteConfig.description,
    relativeUrl: "/",
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TeamSection />
        <CTASection />
      </main>
    </>
  )
}
