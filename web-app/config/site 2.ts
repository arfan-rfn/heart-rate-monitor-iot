export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Heart Track",
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
    description: "Heart Track is a comprehensive IoT-enabled health monitoring system that allows users to track their heart rate and blood oxygen saturation levels throughout the day. Using a Particle Photon device with a MAX30102 sensor, users receive periodic reminders to take measurements, which are automatically synced to a secure cloud platform for real-time visualization and analysis.",
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
      name: "Team Member 1",
      email: "member1@example.edu",
      role: "IoT Device & Firmware Developer",
      photo: "/team/member1.jpg",
      bio: "Responsible for Particle Photon firmware development, state machine implementation, and MAX30102 sensor integration.",
      github: "https://github.com/member1",
      linkedin: "https://linkedin.com/in/member1",
    },
    {
      name: "Team Member 2",
      email: "member2@example.edu",
      role: "Backend Developer",
      photo: "/team/member2.jpg",
      bio: "Developed the Node.js/Express backend API, MongoDB database schema, and authentication system.",
      github: "https://github.com/member2",
      linkedin: "https://linkedin.com/in/member2",
    },
    {
      name: "Team Member 3",
      email: "member3@example.edu",
      role: "Frontend Developer",
      photo: "/team/member3.jpg",
      bio: "Built the responsive Next.js web application, dashboard visualizations, and user interface components.",
      github: "https://github.com/member3",
      linkedin: "https://linkedin.com/in/member3",
    },
  ],

  // Technology Stack
  techStack: {
    frontend: [
      { name: "Next.js 15", description: "React framework with App Router" },
      { name: "React 19", description: "UI component library" },
      { name: "TypeScript", description: "Type-safe JavaScript" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework" },
      { name: "shadcn/ui", description: "Re-usable component library" },
      { name: "Recharts", description: "Data visualization library" },
    ],
    backend: [
      { name: "Node.js", description: "JavaScript runtime" },
      { name: "Hono", description: "Fast web framework" },
      { name: "MongoDB", description: "NoSQL database" },
      { name: "Mongoose", description: "MongoDB object modeling" },
      { name: "Better Auth", description: "Authentication library" },
      { name: "JWT", description: "Token-based authentication" },
    ],
    iot: [
      { name: "Particle Photon", description: "IoT development board" },
      { name: "MAX30102", description: "Heart rate & SpO2 sensor" },
      { name: "C++", description: "Firmware programming language" },
      { name: "State Machines", description: "Synchronous control logic" },
    ],
    deployment: [
      { name: "Vercel", description: "Next.js hosting platform" },
      { name: "Cloudflare Workers", description: "Backend API hosting" },
      { name: "MongoDB Atlas", description: "Cloud database hosting" },
      { name: "AWS", description: "Cloud infrastructure" },
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
