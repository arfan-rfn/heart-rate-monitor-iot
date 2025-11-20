/**
 * Examples of using the enhanced API client with Next.js features
 * This file is for documentation purposes - showing different use cases
 */

import { apiClient } from './client'

// ============================================
// CLIENT-SIDE USAGE (with TanStack Query)
// ============================================

// In React hooks - TanStack Query handles caching
export const clientExample = {
  // Simple fetch - no Next.js options needed
  fetchSessions: () => apiClient.get('/user/session'),
  
  // With custom headers
  fetchWithAuth: () => apiClient.get('/protected', {
    headers: {
      'Authorization': 'Bearer token'
    }
  })
}

// ============================================
// SERVER COMPONENT USAGE (with Next.js caching)
// ============================================

// In Server Components - use Next.js cache options
export const serverComponentExamples = {
  // Static data - cache forever
  fetchStaticData: () => apiClient.get('/api/static-content', {
    cache: 'force-cache'
  }),

  // ISR - revalidate every hour
  fetchWithISR: () => apiClient.get('/api/posts', {
    next: { revalidate: 3600 } // 1 hour
  }),

  // Dynamic data - always fresh
  fetchRealtime: () => apiClient.get('/api/live-data', {
    cache: 'no-store'
  }),

  // With cache tags for on-demand revalidation
  fetchWithTags: () => apiClient.get('/api/product/123', {
    next: { 
      revalidate: 3600,
      tags: ['product', 'product-123']
    }
  })
}

// ============================================
// SERVER ACTIONS USAGE
// ============================================

// In Server Actions - can use any fetch options
export async function serverActionExample() {
  'use server'
  
  // Fetch with no cache (fresh data for mutations)
  const data = await apiClient.post('/api/action', 
    { data: 'value' },
    { cache: 'no-store' }
  )
  
  return data
}

// ============================================
// STATIC GENERATION (generateStaticParams)
// ============================================

// For static page generation
export async function generateStaticExample() {
  // Cache indefinitely for build-time data
  const pages = await apiClient.get('/api/all-pages', {
    cache: 'force-cache'
  })
  
  return pages
}