import { Router } from 'express';
import {
  submitMeasurement,
  getUserMeasurements,
  getDailyMeasurements,
  getWeeklySummary,
  getDailyAggregates,
  getDeviceMeasurements,
} from '../controllers/measurement.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authenticateApiKey } from '../middleware/apiKey.middleware.js';

const router = Router();

/**
 * Measurement Routes
 */

// Submit measurement from IoT device (requires API key)
router.post('/', authenticateApiKey, submitMeasurement);

// Get user's measurements with filtering (requires JWT auth)
router.get('/', authenticate, getUserMeasurements);

// Get weekly summary (requires JWT auth)
router.get('/weekly/summary', authenticate, getWeeklySummary);

// Get daily aggregates (requires JWT auth)
router.get('/daily-aggregates', authenticate, getDailyAggregates);

// Get daily measurements for specific date (requires JWT auth)
router.get('/daily/:date', authenticate, getDailyMeasurements);

// Get measurements for specific device (requires JWT auth)
router.get('/device/:deviceId', authenticate, getDeviceMeasurements);

export default router;
