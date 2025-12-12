export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "PulseConnect",
  description:
    "A low-cost IoT-enabled web application for monitoring heart rate and blood oxygen saturation levels throughout the day.",
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Devices",
      href: "/devices",
    },
    {
      title: "API Docs",
      href: "https://heart-rate-monitor-iot.vercel.app/api-docs",
    }
  ],
  links: {
    github: "https://github.com/yourusername/heart-rate-monitor-iot",
    demo: "#demo",
  },
  // Icon must be exist in the component/icons.tsx file
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/yourusername/heart-rate-monitor-iot",
      icon: "GitHub",
    },
  ],

  // Project Information
  project: {
    tagline: "Monitor Your Heart Health with IoT Technology",
    description: "PulseConnect is a comprehensive IoT-enabled health monitoring system that allows users to track their heart rate and blood oxygen saturation levels throughout the day. Using a Particle Photon device with a MAX30102 sensor, users receive periodic reminders to take measurements, which are automatically synced to a secure cloud platform for real-time visualization and analysis.",
    features: [
      {
        title: "Real-Time Monitoring",
        description: "Track your heart rate and SpO2 levels throughout the day with automatic data synchronization.",
        icon: "Activity",
      },
      {
        title: "IoT Device Integration",
        description: "Seamlessly connect your Particle Photon device with MAX30102 sensor for accurate measurements.",
        icon: "Wifi",
      },
      {
        title: "Data Visualization",
        description: "View your health metrics through interactive charts with daily detailed and weekly summary views.",
        icon: "BarChart3",
      },
      {
        title: "Configurable Schedule",
        description: "Customize measurement frequency and time-of-day ranges to fit your lifestyle.",
        icon: "Clock",
      },
      {
        title: "Offline Capability",
        description: "Device stores up to 24 hours of data locally when disconnected, syncing automatically when reconnected.",
        icon: "Database",
      },
      {
        title: "Secure Authentication",
        description: "Your health data is protected with token-based authentication and encrypted storage.",
        icon: "Lock",
      },
      {
        title: "Responsive Design",
        description: "Access your health dashboard seamlessly on desktop, tablet, and mobile devices.",
        icon: "Smartphone",
      },
      {
        title: "Physician Portal",
        description: "ECE 513 feature: Physicians can monitor multiple patients and adjust measurement frequencies.",
        icon: "Stethoscope",
      },
    ],
    howItWorks: [
      {
        step: 1,
        title: "Register & Connect",
        description: "Create your account and register your Heart Track IoT device with the platform.",
        icon: "UserPlus",
      },
      {
        step: 2,
        title: "Take Measurements",
        description: "Your device will remind you to take measurements by flashing blue. Place your finger on the sensor.",
        icon: "Heart",
      },
      {
        step: 3,
        title: "Automatic Sync",
        description: "Measurements are instantly transmitted to the cloud (green flash) or stored locally if offline (yellow flash).",
        icon: "Cloud",
      },
      {
        step: 4,
        title: "View Insights",
        description: "Access your personalized dashboard to view detailed charts, trends, and health analytics.",
        icon: "TrendingUp",
      },
    ],
  },

  // Team Members (Customizable)
  teamMembers: [
    {
      name: "Md Arfan Uddin",
      email: "arfan@arizona.edu",
      role: "Full Stack Developer",
      photo: "https://avatars.githubusercontent.com/u/28912909?v=4",
      bio: "Designed and implemented the entire PulseConnect web application including the frontend, and backend",
      github: "https://github.com/arfan.rfn",
      linkedin: "https://linkedin.com/in/rfn",
    },
    {
      name: "John Paul Martin Encinas",
      email: "martinencinas@arizona.edu",
      role: "AWS Cloud Developer",
      photo: "https://media.licdn.com/dms/image/v2/D4E03AQHz3n4uuzFDwA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1679880852245?e=1766620800&v=beta&t=FYln5qXepe1UJ55r5Gbi7dqNcebFdsR9Eutupyobm48",
      bio: "I am the AWS cloud guy.",
      github: "https://github.com/member2",
      linkedin: "https://linkedin.com/in/member2",
    },
    {
      name: "Josh Dean",
      email: "jpdean@arizona.edu",
      role: "IOT Developer",
      photo: "https://media.licdn.com/dms/image/v2/D5635AQHD8q2XlNNHcA/profile-framedphoto-shrink_800_800/profile-framedphoto-shrink_800_800/0/1703979580960?e=1765846800&v=beta&t=iG5jf9TuB6QaMi5J-y9yurOjXp9hgWjK-WI0m3bH2Fc",
      bio: "Cried (like a lot)... Also programmed the IoT Device.",
      github: "https://github.com/j-d-dev",
      linkedin: "https://linkedin.com/in/member3",
    },
  ],

  // Technology Stack
  techStack: {
    frontend: [
      { name: "Next.js 15", description: "React framework with App Router", url: "https://nextjs.org" },
      { name: "React 19", description: "UI component library", url: "https://react.dev" },
      { name: "TypeScript", description: "Type-safe JavaScript", url: "https://www.typescriptlang.org" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework", url: "https://tailwindcss.com" },
      { name: "shadcn/ui", description: "Re-usable component library", url: "https://ui.shadcn.com" },
      { name: "Recharts", description: "Data visualization library", url: "https://recharts.org" },
      { name: "TanStack Query", description: "Data synchronization", url: "https://tanstack.com/query" },
    ],
    backend: [
      { name: "Node.js", description: "JavaScript runtime", url: "https://nodejs.org" },
      { name: "Express.js", description: "Web application framework", url: "https://expressjs.com" },
      { name: "MongoDB", description: "NoSQL database", url: "https://www.mongodb.com" },
      { name: "Mongoose", description: "MongoDB object modeling", url: "https://mongoosejs.com" },
      { name: "Better Auth", description: "Authentication library", url: "https://www.better-auth.com" },
      { name: "bcrypt", description: "Password hashing", url: "https://github.com/kelektiv/node.bcrypt.js" },
    ],
    iot: [
      { name: "Particle Photon", description: "IoT development board", url: "https://docs.particle.io/photon" },
      { name: "MAX30102", description: "Heart rate & SpO2 sensor", url: "https://www.maximintegrated.com/en/products/interface/sensor-interface/MAX30102.html" },
      { name: "C++", description: "Firmware programming", url: "https://isocpp.org" },
      { name: "State Machines", description: "Control logic pattern", url: "https://en.wikipedia.org/wiki/Finite-state_machine" },
    ],
    deployment: [
      { name: "Vercel", description: "Frontend hosting platform", url: "https://vercel.com" },
      { name: "AWS EC2", description: "Backend server hosting", url: "https://aws.amazon.com/ec2" },
      { name: "MongoDB Atlas", description: "Cloud database hosting", url: "https://www.mongodb.com/atlas" },
    ],
  },

  footer: {
    links: {
      Features: [
        {
          name: "Home",
          url: "/",
        },
        {
          name: "Dashboard",
          url: "/dashboard",
        },
        {
          name: "Devices",
          url: "/devices",
        },
      ],
      Resources: [
        {
          name: "References",
          url: "/references",
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
      "Project": [
        {
          name: "GitHub Repository",
          url: "https://github.com/yourusername/heart-rate-monitor-iot",
        },
        {
          name: "Documentation",
          url: "#",
        },
        {
          name: "Demo Video",
          url: "#",
        }
      ],
    },
  }
}
