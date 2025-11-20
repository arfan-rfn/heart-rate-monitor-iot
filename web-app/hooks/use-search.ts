"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { apiClient } from "@/lib/api";
import type {
  AuditSearchResult,
  CategoryResults,
  FeedbackSearchResult,
  FileSearchResult,
  SearchCategory,
  SearchResponse,
  UserSearchResult,
} from "@/lib/types/search";

// Navigation URL mapper for each category
const CATEGORY_URL_MAPPERS = {
  users: (item: UserSearchResult) => `/users/${item.id}`,
} as const;

// Process search results - add URL field to each item
function processSearchResults(response: SearchResponse): SearchResponse {
  return {
    ...response,
    results: {
      users: response.results.users
        ? {
            ...response.results.users,
            items: response.results.users.items.map((item) => ({
              ...item,
              url: CATEGORY_URL_MAPPERS.users(item),
            })),
          }
        : undefined,
    },
  };
}

// Single search hook - API returns all categories (or filtered by category)
export function useSearch(
  query: string,
  options?: {
    enabled?: boolean;
    category?: SearchCategory | "all";
    limit?: number;
  }
) {
  const [debouncedQuery] = useDebounce(query, 400);
  const category = options?.category || "all";
  const limit = options?.limit || 5;

  return useQuery({
    queryKey: ["search", debouncedQuery, category, limit],
    queryFn: async () => {
      // API returns all categories by default, or filtered by category
      const response = await apiClient.get<SearchResponse>(
        `/search?q=${encodeURIComponent(debouncedQuery)}&category=${category}&limit=${limit}`
      );

      // Post-process: Add navigation URLs to each result
      return processSearchResults(response);
    },
    enabled: debouncedQuery.length >= 2 && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Load more for specific category
export function useLoadMore(
  query: string,
  category: SearchCategory,
  page: number
) {
  return useQuery({
    queryKey: ["search", category, query, "page", page],
    queryFn: async () => {
      const response = await apiClient.get<SearchResponse>(
        `/search?q=${encodeURIComponent(query)}&category=${category}&page=${page}&limit=10`
      );
      // Post-process pagination results
      return processSearchResults(response);
    },
    enabled: false, // Manual trigger only
    staleTime: 5 * 60 * 1000,
  });
}

// Type for category state management
export interface CategoryState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

// Helper to get category results safely
export function getCategoryResults<T extends SearchCategory>(
  response: SearchResponse | undefined,
  category: T
): CategoryResults<any> | undefined {
  if (!response) return undefined;
  return response.results[category];
}
