import { Router } from 'express';
import {
  getAllPatients,
  getPatientSummary,
  getPatientDailyMeasurements,
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
 * Update patient's device configuration
 * Required by ECE 513 spec: "allow the physician to adjust the frequency of measurement"
 */
router.put('/patients/:patientId/devices/:deviceId/config', updatePatientDeviceConfig);

export default router;
