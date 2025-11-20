/**
 * Auth type definitions including admin-specific fields
 */

// Extended user type with admin fields from Better Auth admin plugin
export interface User {
	id: string
	email: string
	name: string
	image?: string | null
	emailVerified: boolean
	createdAt: Date
	updatedAt: Date
	// Admin plugin fields
	role?: string
	banned?: boolean | null
	banReason?: string | null
	banExpires?: Date | null
	// Profile fields
	profileCompleted?: boolean
	profileCompletedAt?: Date | null
	firstLoginAt?: Date | null
}

// Session type with admin fields
export interface Session {
	id: string
	userId: string
	expiresAt: Date
	createdAt: Date
	token: string
	ipAddress?: string | null
	userAgent?: string | null
	// Admin plugin field - Better Auth returns undefined, not null
	impersonatedBy?: string | null
}

// Full session data with user
export interface SessionData {
	session: Session
	user: User
}

// Admin operation input types
export interface CreateUserInput {
	name: string
	email: string
	password: string
	role?: "user" | "admin"  // Better Auth API only supports user and admin for creation
}

export interface UpdateUserInput {
	userId: string
	data: {
		name?: string
		email?: string
	}
}

export interface SetRoleInput {
	userId: string
	role: "user" | "admin" | "moderator"
}

export interface SetPasswordInput {
	userId: string
	password: string
}

export interface BanUserInput {
	userId: string
	reason?: string
	expiresAt?: Date
}

export interface UnbanUserInput {
	userId: string
}

export interface RemoveUserInput {
	userId: string
}

export interface ImpersonateUserInput {
	userId: string
}

// Session management inputs
export interface RevokeSessionInput {
	sessionId: string
}

export interface RevokeUserSessionsInput {
	userId: string
}

// Query types
export interface ListUsersQuery {
	limit?: number
	offset?: number
	sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'name'
	sortDirection?: 'asc' | 'desc'
	// Simple search (will be converted to searchValue/searchField/searchOperator)
	search?: string
	// Better Auth search parameters (for advanced usage)
	searchValue?: string
	searchField?: 'email' | 'name'
	searchOperator?: 'contains' | 'starts_with' | 'ends_with'
	// Filter parameters
	filterField?: string
	filterValue?: string
	filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte'
	role?: string
	banned?: boolean
}

export interface ListUserSessionsQuery {
	userId: string
}

// Response types
export interface ListUsersResponse {
	users: User[]
	total: number
}

export interface UserSessionsResponse {
	sessions: Session[]
}
