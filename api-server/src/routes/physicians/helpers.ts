import { AppError } from '../../middleware/error/index.js';
import { getMongoDbInstance } from '../../config/database.js';

/**
 * Verify that a patient belongs to a specific physician
 *
 * This function ensures three-layer security:
 * 1. Patient exists in the system
 * 2. Patient is associated with THIS physician
 * 3. User is actually a patient (not another physician)
 *
 * @param physicianId - The physician's user ID
 * @param patientId - The patient's user ID
 * @throws AppError if patient not found (404) or not associated (403)
 */
export async function verifyPhysicianPatientRelationship(
  physicianId: string,
  patientId: string
): Promise<void> {
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Single query with all validation criteria
  const patient = await userCollection.findOne({
    id: patientId,
    physicianId,
    role: { $ne: 'physician' },
  });

  // Patient not found or not associated with this physician
  if (!patient) {
    // Check if patient exists at all (for better error messaging)
    const userExists = await userCollection.findOne({ id: patientId });

    if (!userExists) {
      throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
    }

    // Patient exists but not associated with this physician
    throw new AppError(
      'Access denied: Patient is not associated with this physician',
      403,
      'FORBIDDEN'
    );
  }
}

/**
 * Get all patients associated with a specific physician
 *
 * Retrieves patients who have:
 * - physicianId matching the given physician
 * - role that is NOT 'physician' (regular users only)
 *
 * Results are sorted by name for consistent ordering
 *
 * @param physicianId - The physician's user ID
 * @returns Array of patient user objects
 */
export async function getPatientsForPhysician(physicianId: string) {
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Query with clean filtering and sorting
  const patients = await userCollection
    .find({
      physicianId,
      role: { $ne: 'physician' },
    })
    .sort({ name: 1 })
    .toArray();

  return patients;
}
