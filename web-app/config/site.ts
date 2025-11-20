export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "PulseConnect",
  description:
    "PulseConnect is a platform that helps you track your heart rate and SpO2.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Devices",
      href: "/devices",
    },
    {
      title: "Blog",
      href: "/blog",
    }
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/arfan-rfn/next-template",
  },
  // Icon must be exist in the component/icons.tsx file
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/arfan-rfn/next-template",
      icon: "GitHub",
    },
  ],
  footer: {
    links: {
      Features: [
        {
          name: "Home",
          url: "/",
        },
      ],
      Resources: [
        {
          name: "FAQ",
          url: "/",
        },
        {
          name: "Terms and Conditions",
          url: "/legal/terms",
        },
        {
          name: "Privacy Policy",
          url: "/legal/privacy",
        }
      ],
      "Links": [
        {
          name: "Build by Arfan",
          url: "https://arfanu.com",
        },
        {
          name: "Connecto",
          url: "https://getconnecto.app",
        },
        {
          name: "NextJS Template",
          url: "https://nextjs.arfanu.com",
        }
      ],
    },
  }
}
