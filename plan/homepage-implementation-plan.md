# Homepage Implementation Plan

**Date**: November 20, 2025
**Project**: Heart Track - IoT Heart Rate Monitoring System
**Component**: Web Application Homepage (index.html equivalent)

---

## Overview

Based on the ECE 413/513 project requirements (Grading Rubric Items #2, #3, #4), the homepage must:

1. **Introduce the team and project** (Item #3 - 1 point)
2. **Display team information** (Item #4 - 1 point) - Picture, email, other info
3. **Serve as the main page** (Item #2 - 1 point)
4. **Use responsive design** (Item #14 - 1 point)

---

## Requirements Analysis

### From Project PDF:
> "The web application should have an index.html page to introduce your team and project."
> - You may use each student's name, email, and a photo
> - You may present your project based on text, images, videos, or others
> - You should use a responsive design

---

## Design Strategy

### 1. Homepage Sections

The homepage will include the following customizable sections:

#### A. Hero Section
- **Purpose**: First impression, project tagline
- **Content**:
  - Project name: "Heart Track"
  - Tagline: "Monitor Your Heart Health with IoT Technology"
  - Brief description
  - Call-to-action buttons (Dashboard, Sign Up)
  - Visual element (illustration/animation)

#### B. About the Project Section
- **Purpose**: Fulfill "Information about the project" requirement
- **Content**:
  - What is Heart Track?
  - Key features overview
  - Technology stack highlights
  - Project overview with engaging visuals

#### C. Features Section
- **Purpose**: Showcase core functionality
- **Content**:
  - Real-time monitoring
  - IoT device integration
  - Data visualization
  - Physician portal (ECE 513)
  - Responsive design
  - Secure authentication
- **Design**: Card-based layout with icons

#### D. How It Works Section
- **Purpose**: Explain the system workflow
- **Content**:
  - Step 1: Wear the device
  - Step 2: Measure heart rate & SpO2
  - Step 3: Data syncs to cloud
  - Step 4: View insights on dashboard
- **Design**: Timeline or step-by-step visual

#### E. Team Section
- **Purpose**: Fulfill "Team information" requirement (Item #4)
- **Content** (per team member):
  - Photo
  - Name
  - Email address
  - Role/responsibility
  - Optional: GitHub/LinkedIn links
- **Design**: Card-based grid layout
- **Customizable**: All team data stored in site config

#### F. Technology Stack Section
- **Purpose**: Highlight technical implementation
- **Content**:
  - Frontend: Next.js, React, Tailwind CSS
  - Backend: Node.js, Express, MongoDB
  - IoT: Particle Photon, MAX30102 sensor
  - Deployment: AWS, Cloudflare Workers
- **Design**: Logo grid or card layout

#### G. Call-to-Action Section
- **Purpose**: Encourage user action
- **Content**:
  - "Start Monitoring Your Health Today"
  - Sign up button
  - Link to demo/dashboard

#### H. Footer
- **Purpose**: Navigation and legal links
- **Content**:
  - Quick links (Dashboard, Devices, Settings)
  - Resources (FAQ, Privacy Policy, Terms)
  - References page link
  - Social media links
  - Copyright notice

---

## Implementation Plan

### Phase 1: Configuration Updates

**File**: `config/site.ts`

Add team member data structure:
```typescript
teamMembers: [
  {
    name: "Team Member 1",
    email: "member1@example.edu",
    role: "IoT Device & Firmware",
    photo: "/team/member1.jpg",
    bio: "Responsible for Particle Photon firmware...",
    github: "https://github.com/...",
    linkedin: "https://linkedin.com/in/..."
  },
  // ... more members
]
```

Add project information:
```typescript
project: {
  tagline: "Monitor Your Heart Health with IoT Technology",
  description: "Heart Track is a low-cost IoT-enabled web application...",
  features: [...],
  techStack: {...}
}
```

### Phase 2: Component Creation

**Directory**: `components/homepage/`

Create reusable, customizable components:
1. `hero-section.tsx` - Hero with CTA
2. `about-section.tsx` - Project overview
3. `features-section.tsx` - Feature cards
4. `how-it-works-section.tsx` - Process steps
5. `team-section.tsx` - Team member cards
6. `tech-stack-section.tsx` - Technology logos
7. `cta-section.tsx` - Final call-to-action

Each component should:
- Accept props from site config
- Be fully responsive (mobile-first)
- Use Tailwind CSS for styling
- Include proper semantic HTML
- Be accessible (ARIA labels, etc.)

### Phase 3: Homepage Update

**File**: `app/(app)/page.tsx`

Replace current template content with:
```tsx
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TeamSection />
      <TechStackSection />
      <CTASection />
    </>
  )
}
```

### Phase 4: Asset Management

**Directory**: `public/`

Add required assets:
- `/team/` - Team member photos (placeholder if needed)
- `/icons/` - Feature icons
- `/tech-logos/` - Technology stack logos
- `/illustrations/` - Hero illustrations

### Phase 5: Responsive Design Testing

Test on:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

---

## Customization Strategy

### Easy Updates via Site Config

All content should be editable in `config/site.ts`:

```typescript
export const siteConfig = {
  name: "Heart Track",

  project: {
    tagline: "...",
    description: "...",
    features: [
      { title: "...", description: "...", icon: "..." },
      // Add/remove features easily
    ],
    howItWorks: [
      { step: 1, title: "...", description: "..." },
      // Customize steps
    ]
  },

  teamMembers: [
    { name: "...", email: "...", photo: "...", role: "..." },
    // Add/remove team members easily
  ],

  techStack: {
    frontend: ["Next.js", "React", "Tailwind CSS"],
    backend: ["Node.js", "Express", "MongoDB"],
    iot: ["Particle Photon", "MAX30102"],
    deployment: ["AWS", "Cloudflare Workers"]
  }
}
```

**Benefits**:
- No need to edit component code
- Easy to update team members
- Simple to modify project description
- Quick feature additions
- Centralized content management

---

## Design Principles

### 1. Modern & Professional
- Clean layout with proper spacing
- Consistent color scheme (brand colors)
- Professional typography
- Smooth animations/transitions

### 2. Responsive First
- Mobile-first approach
- Fluid layouts (grid/flexbox)
- Touch-friendly interactions
- Optimized images for all screen sizes

### 3. Accessible
- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- High contrast ratios
- Alt text for images

### 4. Performance
- Optimized images (Next.js Image component)
- Lazy loading for below-the-fold content
- Minimal JavaScript
- Fast page load times

---

## Content Guidelines

### Hero Section
- **Headline**: Clear, concise (5-10 words)
- **Subheadline**: Explain value proposition (1-2 sentences)
- **CTA**: Action-oriented ("Get Started", "View Dashboard")

### About Section
- **Length**: 2-3 paragraphs
- **Focus**: Problem → Solution → Benefits
- **Tone**: Professional yet approachable

### Features Section
- **Number**: 6-8 key features
- **Format**: Icon + Title + Brief description (1-2 sentences)
- **Highlight**: Unique selling points

### Team Section
- **Photos**: Professional headshots (square format)
- **Bios**: 2-3 sentences per member
- **Roles**: Clear responsibility areas
- **Contact**: University email addresses

---

## Technical Specifications

### Color Scheme
- Primary: Heart-health red (#EF4444)
- Secondary: Trust blue (#3B82F6)
- Success: Healthy green (#10B981)
- Neutral: Gray scale for text/backgrounds

### Typography
- Headings: System font stack (Inter, SF Pro, Helvetica)
- Body: Same as headings for consistency
- Sizes: Responsive (clamp for fluid typography)

### Spacing
- Sections: Large padding (py-16 md:py-24)
- Cards: Consistent gaps (gap-6 md:gap-8)
- Container: Max width (max-w-7xl)

### Components
- Cards: Rounded corners (rounded-lg), subtle shadows
- Buttons: Clear hierarchy (primary, secondary, outline)
- Icons: Lucide React or Heroicons
- Images: Next.js Image with proper optimization

---

## Success Criteria

### Functionality
- ✅ Displays all required information
- ✅ Team members shown with photos and emails
- ✅ Project description is clear and comprehensive
- ✅ All sections are fully responsive
- ✅ Navigation works seamlessly
- ✅ CTAs link to appropriate pages

### Design Quality
- ✅ Professional appearance
- ✅ Consistent branding throughout
- ✅ Proper visual hierarchy
- ✅ Good use of whitespace
- ✅ Engaging visuals and icons

### Technical Quality
- ✅ Fast load times (<3 seconds)
- ✅ No accessibility issues
- ✅ Cross-browser compatible
- ✅ Mobile-friendly (passes Google Mobile-Friendly Test)
- ✅ SEO optimized (meta tags, semantic HTML)

### Grading Requirements
- ✅ Item #2: Index.html (Main page) - 1 point
- ✅ Item #3: Information about the project - 1 point
- ✅ Item #4: Team information (Picture, email, other info) - 1 point
- ✅ Item #14: Responsive pages - 1 point

---

## Timeline

### Immediate (Current Session)
1. Create plan document ✅
2. Update site config with project/team data
3. Create all homepage section components
4. Update main page.tsx with new sections
5. Test responsive design

### Future Enhancements
- Add team member photos (placeholder → real)
- Create video/demo section
- Add testimonials section (if applicable)
- Integrate with analytics
- A/B test different hero messages

---

## Maintenance

### Updating Team Information
```typescript
// config/site.ts
teamMembers: [
  {
    name: "New Member",
    email: "newmember@example.edu",
    role: "Full Stack Developer",
    photo: "/team/new-member.jpg",
    bio: "Working on integration...",
    github: "https://github.com/...",
    linkedin: "https://linkedin.com/in/..."
  }
]
```

### Adding New Features
```typescript
// config/site.ts
features: [
  {
    title: "New Feature",
    description: "Description of the new feature",
    icon: "IconName" // From Lucide React
  }
]
```

### Updating Project Description
```typescript
// config/site.ts
project: {
  tagline: "New tagline here",
  description: "Updated description..."
}
```

---

## References

- ECE 413/513 Project Description PDF
- Project README.md
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui Components: https://ui.shadcn.com
- Lucide React Icons: https://lucide.dev

---

**Status**: Plan Complete - Ready for Implementation
**Next Steps**: Update site config → Create components → Update homepage
