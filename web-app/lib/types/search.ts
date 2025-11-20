// ============================================
// GENERIC TYPES (Reusable for all categories)
// ============================================

// Search categories (add new ones here)
export type SearchCategory = "users" | "feedback" | "files" | "audit";

// Search request parameters (works for any category)
export interface SearchParams {
  q: string;
  category: SearchCategory | "all";
  page?: number;
  limit?: number;
}

// Generic paginated results (works for any item type)
export interface CategoryResults<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// CATEGORY-SPECIFIC RESULT TYPES
// ============================================

// Users category
export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  createdAt: string;
  url?: string; // Added by post-processing pipeline
}

// Feedback category (not implemented yet)
export interface FeedbackSearchResult {
  id: string;
  title: string;
  content: string;
  status: string;
  userId: string;
  userName: string;
  createdAt: string;
  url?: string; // Added by post-processing pipeline
}

// Files category (not implemented yet)
export interface FileSearchResult {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // From API (external file URL)
  uploadedBy: string;
  createdAt: string;
  navigationUrl?: string; // Added by post-processing (for internal navigation)
}

// Audit category (not implemented yet)
export interface AuditSearchResult {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
  url?: string; // Added by post-processing pipeline
}

// ============================================
// API RESPONSE STRUCTURE
// ============================================

// Generic search response (supports all categories)
export interface SearchResponse {
  query: string;
  category: SearchCategory | "all";
  results: {
    users?: CategoryResults<UserSearchResult>;
    feedback?: CategoryResults<FeedbackSearchResult>;
    files?: CategoryResults<FileSearchResult>;
    audit?: CategoryResults<AuditSearchResult>;
  };
  totalResults: number;
  searchTime: number;
}

// Type-safe result extraction helpers
export type SearchResultsMap = {
  users: UserSearchResult;
  feedback: FeedbackSearchResult;
  files: FileSearchResult;
  audit: AuditSearchResult;
};

// Helper to get results for a specific category
export type CategoryResultType<T extends SearchCategory> = CategoryResults<
  SearchResultsMap[T]
>;
