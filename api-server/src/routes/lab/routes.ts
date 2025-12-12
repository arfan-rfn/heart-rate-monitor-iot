import { Router, Request, Response } from 'express';
import { Recording } from '../../models/recording/index.js';

const router = Router();

// Permissive CORS middleware for zyBooks testing
router.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

/**
 * GET /lab/status
 * Returns the average airQuality for a specific zip code
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { zip } = req.query;

    // Validate zip parameter
    if (!zip || isNaN(Number(zip))) {
      return res.status(400).json({ error: 'a zip code is required.' });
    }

    // Find all recordings for this zip code
    const recordings = await Recording.find({ zip: Number(zip) });

    // Check if any data exists for this zip
    if (recordings.length === 0) {
      return res.status(400).json({ error: 'Zip does not exist in the database.' });
    }

    // Calculate average
    const sum = recordings.reduce((acc, r) => acc + r.airQuality, 0);
    const average = (sum / recordings.length).toFixed(2);

    return res.status(200).json(average);
  } catch (error) {
    console.error('Error in /lab/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /lab/register
 * Registers a new air quality entry
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { zip, airQuality } = req.body;

    // Validate required fields
    if (zip === undefined || airQuality === undefined) {
      return res.status(400).json({ error: 'zip and airQuality are required.' });
    }

    // Store the recording in MongoDB
    await Recording.create({
      zip: Number(zip),
      airQuality: Number(airQuality),
    });

    return res.status(201).json({ response: 'Data recorded.' });
  } catch (error) {
    console.error('Error in /lab/register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
