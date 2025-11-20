#!/usr/bin/env tsx

/**
 * Generate TypeScript API client wrapper for frontend
 *
 * This script creates a type-safe fetch wrapper that uses the generated OpenAPI types
 *
 * Usage:
 *   npm run generate-client
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientWrapperTemplate = `/**
 * Type-safe API client for PulseConnect API
 * Auto-generated from OpenAPI specification
 *
 * Usage:
 * import { apiClient } from '@/api/client';
 * const user = await apiClient.get('/api/users/profile');
 */

import type { paths } from './generated/api-types';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: HTTPMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = \`Bearer \${token}\`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Set API key for device authentication
   */
  setApiKey(apiKey: string) {
    this.defaultHeaders['X-API-Key'] = apiKey;
  }

  /**
   * Clear API key
   */
  clearApiKey() {
    delete this.defaultHeaders['X-API-Key'];
  }

  /**
   * Build URL with path parameters and query string
   */
  private buildURL(
    path: string,
    params?: Record<string, string | number>,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    let url = this.baseURL + path;

    // Replace path parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(\`{\${key}}\`, String(value));
      });
    }

    // Add query parameters
    if (query) {
      const queryString = new URLSearchParams(
        Object.entries(query)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString();

      if (queryString) {
        url += \`?\${queryString}\`;
      }
    }

    return url;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    path: string,
    options: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(path, options.params, options.query);

    const response = await fetch(url, {
      method: options.method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include', // Include cookies for session auth
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error?.message || 'Request failed',
        response.status,
        data.error?.code
      );
    }

    return data;
  }

  /**
   * GET request
   */
  async get<P extends keyof paths>(
    path: P,
    options?: {
      params?: Record<string, string | number>;
      query?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
    }
  ) {
    return this.request(path as string, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  async post<P extends keyof paths>(
    path: P,
    body?: unknown,
    options?: {
      params?: Record<string, string | number>;
      headers?: Record<string, string>;
    }
  ) {
    return this.request(path as string, {
      method: 'POST',
      body,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put<P extends keyof paths>(
    path: P,
    body?: unknown,
    options?: {
      params?: Record<string, string | number>;
      headers?: Record<string, string>;
    }
  ) {
    return this.request(path as string, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<P extends keyof paths>(
    path: P,
    body?: unknown,
    options?: {
      params?: Record<string, string | number>;
      headers?: Record<string, string>;
    }
  ) {
    return this.request(path as string, {
      method: 'PATCH',
      body,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<P extends keyof paths>(
    path: P,
    options?: {
      params?: Record<string, string | number>;
      body?: unknown;
      headers?: Record<string, string>;
    }
  ) {
    return this.request(path as string, {
      method: 'DELETE',
      ...options,
    });
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Default API client instance
 * Configure baseURL based on environment
 */
export const apiClient = new APIClient(
  import.meta.env?.VITE_API_URL || 'http://localhost:3000'
);

/**
 * Create a new API client instance with custom baseURL
 */
export function createAPIClient(baseURL: string): APIClient {
  return new APIClient(baseURL);
}
`;

try {
  console.log('🔄 Generating API client wrapper...');

  // Determine output path (web-app/src/api/)
  const outputDir = join(__dirname, '..', '..', 'web-app', 'src', 'api');
  const outputPath = join(outputDir, 'client.ts');

  // Create directory if it doesn't exist
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  writeFileSync(outputPath, clientWrapperTemplate, 'utf-8');

  console.log('✅ API client wrapper generated successfully!');
  console.log(`📄 File location: ${outputPath}`);
  console.log('\nUsage in frontend:');
  console.log('  import { apiClient } from "@/api/client";');
  console.log('  apiClient.setAuthToken(token);');
  console.log('  const data = await apiClient.get("/api/users/profile");');

} catch (error) {
  console.error('❌ Error generating API client wrapper:', error);
  // Don't exit with error - this is optional
  console.log('⚠️  Skipping client wrapper generation (web-app directory may not exist)');
}
