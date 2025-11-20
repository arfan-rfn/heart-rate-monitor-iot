# Homepage Customization Guide

This guide explains how to customize the Heart Track homepage to match your team and project needs.

## Overview

The homepage has been implemented with **fully customizable sections** that can be easily updated by editing the `config/site.ts` file. No component code changes needed!

## Customizable Sections

### 1. Hero Section
The main landing section with project tagline and call-to-action buttons.

**Location in config**: `siteConfig.project.tagline` and `siteConfig.project.description`

```typescript
project: {
  tagline: "Monitor Your Heart Health with IoT Technology",
  description: "Heart Track is a comprehensive IoT-enabled health monitoring system..."
}
```

### 2. About Section
Detailed project description with key benefits.

**Location in config**: `siteConfig.project.description`

### 3. Features Section
Showcases 8 key features of the application.

**Location in config**: `siteConfig.project.features`

**To add/edit features**:
```typescript
features: [
  {
    title: "Your Feature Title",
    description: "Brief description of the feature",
    icon: "IconName" // Must exist in components/icons.tsx
  },
  // Add more features...
]
```

**Available Icons**: Activity, Wifi, BarChart3, Clock, Database, Lock, Smartphone, Stethoscope, Heart, Cloud, TrendingUp, UserPlus, etc.

### 4. How It Works Section
Step-by-step guide (4 steps by default).

**Location in config**: `siteConfig.project.howItWorks`

**To customize steps**:
```typescript
howItWorks: [
  {
    step: 1,
    title: "Step Title",
    description: "What happens in this step",
    icon: "IconName"
  },
  // Add more steps...
]
```

### 5. Team Section
Display team members with photos, roles, and contact info.

**Location in config**: `siteConfig.teamMembers`

**To update team members**:
```typescript
teamMembers: [
  {
    name: "Your Name",
    email: "your.email@example.edu",
    role: "Your Role (e.g., Frontend Developer)",
    photo: "/team/your-photo.jpg",
    bio: "Brief bio about your responsibilities",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername"
  },
  // Add more team members...
]
```

**Adding Team Photos**:
1. Place photos in `public/team/` directory
2. Recommended size: 400x400px (square)
3. Update the `photo` path in config
4. If no photo is provided, initials will be shown

### 6. Technology Stack Section
Shows all technologies used in the project.

**Location in config**: `siteConfig.techStack`

**To update technologies**:
```typescript
techStack: {
  frontend: [
    { name: "Library Name", description: "Short description" },
    // Add more...
  ],
  backend: [
    { name: "Library Name", description: "Short description" },
    // Add more...
  ],
  iot: [
    { name: "Hardware/Software", description: "Short description" },
    // Add more...
  ],
  deployment: [
    { name: "Platform Name", description: "Short description" },
    // Add more...
  ]
}
```

### 7. Call-to-Action (CTA) Section
Final section encouraging users to sign up or try the demo.

**No customization needed** - uses existing routes and button styles.

## Quick Customization Checklist

- [ ] Update project name: `siteConfig.name`
- [ ] Update project description: `siteConfig.description`
- [ ] Customize tagline: `siteConfig.project.tagline`
- [ ] Add/edit features (8 total recommended)
- [ ] Customize "How It Works" steps (4 steps recommended)
- [ ] Add all team members with correct info
- [ ] Upload team member photos to `public/team/`
- [ ] Update technology stack lists
- [ ] Update GitHub repository URL: `siteConfig.links.github`
- [ ] Update social links: `siteConfig.socials`
- [ ] Update footer links: `siteConfig.footer.links`

## Adding New Icons

If you need an icon that doesn't exist:

1. Open `components/icons.tsx`
2. Import the icon from `lucide-react`:
   ```typescript
   import { YourIcon } from "lucide-react"
   ```
3. Add it to the `Icons` object:
   ```typescript
   export const Icons = {
     // ... existing icons
     YourIcon: YourIcon,
   }
   ```
4. Use it in config:
   ```typescript
   icon: "YourIcon"
   ```

## Section Order

Current order (can be changed in `app/(app)/page.tsx`):
1. HeroSection
2. AboutSection
3. FeaturesSection
4. HowItWorksSection
5. TeamSection
6. TechStackSection
7. CTASection

To reorder, simply change the order of components in the page file.

## Responsive Design

All sections are **fully responsive** and tested on:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

**No additional configuration needed** - responsive breakpoints are built into each component.

## Color Customization

Colors are controlled by Tailwind CSS theme:
- Primary color: Red (heart health theme)
- Secondary color: Blue (trust)
- Success color: Green (healthy)

To change colors, modify `app/globals.css` theme variables.

## References Page

A separate `/references` page has been created listing all third-party libraries and credits.

**To update references**:
Edit `app/(app)/references/page.tsx` and add/remove `<ReferenceItem />` components.

## Project Requirements Met

✅ **Index.html** - Serves as main page (Grading Item #2)
✅ **Project Information** - About and features sections (Grading Item #3)
✅ **Team Information** - Team section with photos and emails (Grading Item #4)
✅ **Responsive Design** - All sections mobile-friendly (Grading Item #14)
✅ **References Page** - Lists all third-party resources

## Example: Complete Customization

Here's a complete example of customizing for your team:

```typescript
// config/site.ts
export const siteConfig = {
  name: "Heart Track",
  description: "Your custom description here...",

  project: {
    tagline: "Your Custom Tagline",
    description: "Detailed description of your project...",

    features: [
      {
        title: "Custom Feature 1",
        description: "What this feature does",
        icon: "Heart"
      },
      // 7 more features...
    ],

    howItWorks: [
      {
        step: 1,
        title: "Your Step 1",
        description: "What happens first",
        icon: "UserPlus"
      },
      // 3 more steps...
    ]
  },

  teamMembers: [
    {
      name: "Alice Johnson",
      email: "alice@email.edu",
      role: "IoT Developer",
      photo: "/team/alice.jpg",
      bio: "Worked on firmware and sensors",
      github: "https://github.com/alice",
      linkedin: "https://linkedin.com/in/alice"
    },
    // 2 more team members...
  ],

  techStack: {
    // Your tech stack...
  }
}
```

## Need Help?

- Check `/plan/homepage-implementation-plan.md` for detailed architecture
- Review component files in `/components/homepage/` for structure
- All components are well-documented with TypeScript types

## Future Enhancements

Potential improvements you can make:
- Add video demo section
- Add testimonials section
- Add FAQ section
- Add statistics/metrics section
- Add project timeline section
- Integrate animations with Framer Motion

---

**Last Updated**: November 20, 2025
**File Structure**: All homepage components in `/components/homepage/`
**Config File**: `/config/site.ts`
