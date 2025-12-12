import { Router, Request, Response } from 'express';

const router = Router();

// In-memory storage for recordings
const recordings: { zip: number; airQuality: number }[] = [];

// Permissive CORS middleware for zyBooks testing
router.use((_req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

/**
 * GET /lab/status
 * Returns the average airQuality for a specific zip code
 */
router.get('/status', (req: Request, res: Response) => {
  const { zip } = req.query;

  // Validate zip parameter
  if (!zip || isNaN(Number(zip))) {
    return res.status(400).json({ error: 'a zip code is required.' });
  }

  // Find all recordings for this zip code
  const matches = recordings.filter((r) => r.zip === Number(zip));

  // Check if any data exists for this zip
  if (matches.length === 0) {
    return res.status(400).json({ error: 'Zip does not exist in the database.' });
  }

  // Calculate average
  const sum = matches.reduce((acc, r) => acc + r.airQuality, 0);
  const average = (sum / matches.length).toFixed(2);

  return res.status(200).json(average);
});

/**
 * POST /lab/register
 * Registers a new air quality entry
 */
router.post('/register', (req: Request, res: Response) => {
  const { zip, airQuality } = req.body;

  // Validate required fields
  if (zip === undefined || airQuality === undefined) {
    return res.status(400).json({ error: 'zip and airQuality are required.' });
  }

  // Store the recording
  recordings.push({
    zip: Number(zip),
    airQuality: Number(airQuality),
  });

  return res.status(201).json({ response: 'Data recorded.' });
});

export default router;
