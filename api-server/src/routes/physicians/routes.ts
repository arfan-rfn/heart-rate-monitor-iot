import { Router } from 'express';
import {
  getAllPatients,
  getPatientSummary,
  getPatientDailyMeasurements,
  getPatientDailyAggregates,
  getPatientHistory,
  getPatientAllTimeStats,
  updatePatientDeviceConfig,
} from './controller.js';
import { authenticate } from '../../middleware/auth/index.js';
import { requirePhysician } from '../../middleware/role/index.js';

const router = Router();

/**
 * All physician routes require:
 * 1. User authentication (JWT)
 * 2. Physician role verification
 */
router.use(authenticate, requirePhysician);

/**
 * Physician Portal Routes
 * ECE 513 Graduate Requirement
 */

/**
 * Get all patients with 7-day summaries
 * Required by ECE 513 spec: "list all patients by name with their 7-day average, maximum, and minimum heart rate"
 */
router.get('/patients', getAllPatients);

/**
 * Get specific patient's weekly summary
 * Required by ECE 513 spec: "patient's summary view similar to weekly summary view"
 */
router.get('/patients/:patientId/summary', getPatientSummary);

/**
 * Get specific patient's daily measurements
 * Required by ECE 513 spec: "patient's detailed day view"
 */
router.get('/patients/:patientId/daily/:date', getPatientDailyMeasurements);

/**
 * Analytics Routes - Extended functionality for comprehensive patient monitoring
 */

/**
 * Get patient's daily aggregates for trend charts
 * Query params: days (default: 30)
 */
router.get('/patients/:patientId/analytics/daily-aggregates', getPatientDailyAggregates);

/**
 * Get patient's full measurement history with optional date range filtering
 * Query params: startDate, endDate, limit, page
 */
router.get('/patients/:patientId/analytics/history', getPatientHistory);

/**
 * Get patient's all-time statistics
 * Provides comprehensive lifetime health metrics
 */
router.get('/patients/:patientId/analytics/all-time', getPatientAllTimeStats);

/**
 * Update patient's device configuration
 * Required by ECE 513 spec: "allow the physician to adjust the frequency of measurement"
 */
router.put('/patients/:patientId/devices/:deviceId/config', updatePatientDeviceConfig);

export default router;
