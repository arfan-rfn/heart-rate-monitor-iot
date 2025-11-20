# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production (includes sitemap generation)
npm start            # Start production server
npm run preview      # Build and preview production locally
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript type checking (no emit)
npm run format:write # Format code with Prettier
npm run format:check # Check code formatting
```

### Maintenance
```bash
npm run update       # Update all dependencies interactively (using pnpm)
```

## Project Context

This is the **web frontend** for a Heart Rate Monitor IoT system (ECE 513 course project). The application displays real-time health metrics (heart rate and SpO2) from IoT devices, provides data visualization with charts, device management, and includes physician portal features.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router and React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (PostCSS-based config in `app/globals.css`)
- **UI Components**: Radix UI primitives with shadcn/ui patterns in `components/ui/`
- **State Management**: Zustand stores in `stores/`
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Authentication**: Better Auth library (email/password + Google OAuth + Magic Link)
- **Charts**: Chart.js or Recharts for health data visualization
- **Validation**: Zod schemas throughout
- **Backend**: External Hono API server (Cloudflare Workers)
- **Analytics**: PostHog for product analytics

### Project Structure
```
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main app routes
│   │   ├── auth/                # Authentication pages (sign-in, sign-up, magic-link)
│   │   ├── dashboard/           # User dashboard with health metrics
│   │   ├── admin/               # Admin panel (users, sessions)
│   │   ├── settings/            # User settings (account, appearance)
│   │   ├── blog/                # Blog section
│   │   └── test/                # Test utilities
│   ├── api/                     # Next.js API routes (minimal - most API calls go to external backend)
│   ├── layout.tsx               # Root layout with providers
│   └── not-found.tsx           # 404 page
├── components/                  # React components
│   ├── ui/                     # shadcn UI components (buttons, cards, dialogs, etc.)
│   ├── providers/              # Context providers (query, theme, auth)
│   └── [feature]/              # Feature-specific components
├── hooks/                       # Custom React hooks
│   └── use-*.ts                # React Query hooks, custom hooks
├── lib/                        # Utilities and integrations
│   ├── api/                    # API client for external Hono backend
│   │   ├── client.ts          # Base API client with fetch wrapper
│   │   └── examples.ts        # API usage examples
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # Constants (permissions, roles)
│   ├── auth.ts                 # Better Auth client configuration
│   └── utils.ts                # Helper utilities
├── stores/                     # Zustand state management
├── config/                     # App configuration
│   ├── site.ts                # Site metadata, navigation, footer
│   ├── auth.ts                # Auth configuration
│   └── query-keys.ts          # React Query key factory
├── styles/                     # Global styles
├── public/                     # Static assets
└── env.ts                      # Environment variable validation with T3 Env
```

### Key Architectural Decisions

1. **External API Backend**: All business logic resides in an external Hono API server. The Next.js app primarily handles UI rendering and client-side state.

2. **Server Components First**: Use React Server Components (RSC) by default. Only add `'use client'` when:
   - Using React hooks (useState, useEffect, etc.)
   - Event handlers needed
   - Browser APIs required
   - Using context providers

3. **API Client Pattern**: All backend requests go through `lib/api/client.ts` which:
   - Automatically includes credentials (cookies)
   - Handles error responses
   - Extracts data from API response wrapper
   - Supports Next.js fetch extensions (revalidate, tags)

4. **Authentication Flow**:
   - Better Auth handles session management
   - Sessions stored in HTTP-only cookies (secure)
   - `useSession()` hook provides client-side auth state
   - Protected routes check session server-side

5. **Data Fetching Strategy**:
   - Use TanStack Query for client-side data fetching
   - Server components can fetch directly using `apiClient`
   - Cache responses where appropriate with `next.revalidate`
   - Query keys defined in `config/query-keys.ts`

6. **Environment Variables**:
   - Validated with T3 Env in `env.ts`
   - Client vars prefixed with `NEXT_PUBLIC_`
   - Required: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`

## Development Guidelines

### Code Style
- Write functional, declarative TypeScript code
- No classes - use functions and hooks
- Avoid `any` types - use proper TypeScript types
- Use early returns and guard clauses for error handling
- Prefer `async/await` over promises
- Use descriptive variable names (e.g., `isLoading`, `hasError`)

### Component Patterns
```typescript
// Server Component (default)
export default async function Page() {
  const data = await apiClient.get('/endpoint')
  return <div>{data}</div>
}

// Client Component (when hooks needed)
'use client'
export function ClientComponent() {
  const [state, setState] = useState()
  return <div>{state}</div>
}

// With React Query
'use client'
export function DataComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: () => apiClient.get('/endpoint')
  })
  if (isLoading) return <Spinner />
  return <div>{data}</div>
}
```

### API Client Usage
```typescript
import { apiClient } from '@/lib/api/client'

// GET request
const data = await apiClient.get<ResponseType>('/api/endpoint')

// POST request
const result = await apiClient.post('/api/endpoint', { key: 'value' })

// With Next.js caching
const data = await apiClient.get('/api/endpoint', {
  next: { revalidate: 60 } // Revalidate every 60 seconds
})

// With cache tags
const data = await apiClient.get('/api/endpoint', {
  next: { tags: ['user-data'] }
})
```

### Better Auth Integration
```typescript
import { auth, useSession } from '@/lib/auth'

// Client-side session
function Component() {
  const { data: session } = useSession()
  if (!session) return <SignIn />
  return <div>Welcome {session.user.name}</div>
}

// Server-side auth check
async function ServerComponent() {
  const user = await auth.getUser()
  if (!user) redirect('/auth/sign-in')
  // ...
}
```

### Error Handling
```typescript
// API errors are thrown as APIError instances
try {
  const data = await apiClient.get('/endpoint')
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}:`, error.message)
  }
}

// In React Query
const { data, error } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiClient.get('/endpoint'),
  onError: (error) => {
    toast.error(error.message)
  }
})
```

### Styling with Tailwind
- Mobile-first approach: base styles are for mobile, use `md:`, `lg:` for larger screens
- Use shadcn/ui components from `components/ui/`
- Custom styles in `app/globals.css` using `@layer` directive
- Prefer composition over custom CSS

### Form Handling
- Use React Hook Form for complex forms
- Validate with Zod schemas
- Use shadcn Form components for consistent UI

## Health Data Visualization

This project requires displaying heart rate and SpO2 measurements in charts:

### Chart Setup
- Use Chart.js or Recharts library
- Charts should be responsive (mobile-first)
- Display time-series data for daily and weekly views
- Support dual-axis charts (heart rate + SpO2)

### Data Flow for Health Metrics
1. IoT devices send measurements to backend API
2. Frontend fetches measurements via `apiClient.get('/api/measurements')`
3. React Query caches and manages data
4. Chart components render visualizations
5. Real-time updates via polling or WebSocket (if implemented)

## Common Patterns

### Protected Routes
```typescript
// middleware.ts or route-level check
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth.getSession()
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
}
```

### Loading States
```typescript
// Use Suspense boundaries for server components
<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>

// Use loading.tsx files for automatic loading UI
// app/dashboard/loading.tsx
export default function Loading() {
  return <Spinner />
}
```

### Environment Variables
```typescript
import { env } from '@/env'

// Validated and type-safe
const apiUrl = env.NEXT_PUBLIC_API_URL
```

## Backend Integration

### API Endpoints (External Hono API)
The backend should provide:
- `/auth/*` - Authentication endpoints (handled by Better Auth)
- `/api/devices` - Device management
- `/api/measurements` - Health measurements (daily, weekly)
- `/api/users` - User management
- `/api/physician/*` - Physician portal features

### Response Format
Backend should return responses in this format:
```typescript
{
  "data": { /* actual data */ },
  "status": 200,
  "success": true
}
```
The API client automatically extracts the `data` field.

## Testing

Currently no test framework is configured. When adding tests:
- Use Jest + React Testing Library for component tests
- Use Playwright or Cypress for E2E tests
- Test API integration with MSW (Mock Service Worker)
- Update this section with test commands

## Deployment

### Recommended: Vercel
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Automatic deployments on push to main

### Environment Variables to Set
```
NEXT_PUBLIC_API_URL=https://your-api.workers.dev
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx (optional)
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com (optional)
```

## Troubleshooting

### Hydration Errors
- Ensure server and client render the same content
- Use `useEffect` for client-only code
- Check for browser APIs in server components

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible
- Check network tab in browser DevTools

### Authentication Issues
- Clear cookies and try again
- Check Better Auth is properly configured on backend
- Verify `baseURL` in `lib/auth.ts` points to correct backend
- Session cookies must have correct domain and secure flags

### Build Errors
- Run `npm run typecheck` to find TypeScript errors
- Check all imports use correct paths
- Ensure environment variables are set in `.env.local`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
