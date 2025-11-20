// /**
//  * Better Auth type extensions for custom permissions
//  * This file extends Better Auth's types to include custom permission namespaces
//  */

// import "better-auth"
// import "better-auth/client/plugins"

// // Extend Better Auth admin plugin types
// declare module "better-auth/client/plugins" {
// 	interface AdminPermissions {
// 		// Built-in user permissions
// 		user?: (
// 			| "create"
// 			| "list"
// 			| "set-role"
// 			| "ban"
// 			| "impersonate"
// 			| "delete"
// 			| "set-password"
// 			| "get"
// 			| "update"
// 		)[]

// 		// Built-in session permissions
// 		session?: ("list" | "delete" | "revoke")[]

// 		// Custom UI permissions (add your custom namespaces here)
// 		ui?: ("admin-dashboard" | "user-management" | "settings")[]

// 		// Add more custom permission namespaces as needed
// 		// Example:
// 		// reports?: ("view" | "create" | "export")[]
// 	}
// }
