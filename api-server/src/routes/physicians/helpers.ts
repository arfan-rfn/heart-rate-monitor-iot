import { AppError } from '../../middleware/error/index.js';
import { getMongoDbInstance } from '../../config/database.js';

/**
 * Verify that a patient belongs to a specific physician
 * Throws AppError if patient not found or not associated with physician
 *
 * @param physicianId - The physician's user ID
 * @param patientId - The patient's user ID
 * @throws AppError if patient not found (404) or not associated (403)
 */
export async function verifyPhysicianPatientRelationship(
  physicianId: string,
  patientId: string
): Promise<void> {
  // Query MongoDB directly for the patient user
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Find patient by id field (Better Auth format)
  const patient = await userCollection.findOne({ id: patientId });

  if (!patient) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }

  // Check if patient is associated with this physician
  if (patient.physicianId !== physicianId) {
    throw new AppError(
      'Access denied: Patient is not associated with this physician',
      403,
      'FORBIDDEN'
    );
  }

  // Additional check: ensure the user is actually a patient (not another physician)
  if (patient.role === 'physician') {
    throw new AppError(
      'Cannot access physician accounts as patients',
      403,
      'FORBIDDEN'
    );
  }
}

/**
 * Get all patients associated with a specific physician
 *
 * @param physicianId - The physician's user ID
 * @returns Array of patient user objects
 */
export async function getPatientsForPhysician(physicianId: string) {
  // Query MongoDB directly for users with matching physicianId
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Find all patients by physicianId and ensure they're not physicians themselves
  const patients = await userCollection
    .find({
      physicianId: physicianId,
      role: { $ne: 'physician' }, // Exclude physician accounts
    })
    .toArray();

  return patients;
}
