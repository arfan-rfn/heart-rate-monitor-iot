/**
 * Physician Routes Module
 * ECE 513 Graduate Requirement
 *
 * Provides endpoints for physicians to:
 * - View all patients with 7-day summaries
 * - View individual patient weekly summaries
 * - View individual patient daily measurements
 * - Adjust patient device configuration
 */

export { default as physicianRoutes } from './routes.js';
export * from './controller.js';
export * from './helpers.js';
