import { AppError } from '../../middleware/error/index.js';
import { getMongoDbInstance } from '../../config/database.js';
import { ObjectId } from 'mongodb';

/**
 * Verify that a patient exists and is not a physician
 *
 * This function ensures:
 * 1. Patient exists in the system
 * 2. User is actually a patient (not another physician)
 *
 * Note: Per requirements, physicians can access ALL patients, not just associated ones
 *
 * @param physicianId - The physician's user ID (for future use)
 * @param patientId - The patient's user ID (MongoDB ObjectId as string)
 * @throws AppError if patient not found (404)
 */
export async function verifyPhysicianPatientRelationship(
  physicianId: string,
  patientId: string
): Promise<void> {
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Try to find patient by both 'id' field and '_id' field
  const patient = await userCollection.findOne({
    $or: [
      { id: patientId },
      { _id: new ObjectId(patientId) }
    ],
    role: { $ne: 'physician' }
  });

  if (!patient) {
    throw new AppError('Patient not found', 404, 'PATIENT_NOT_FOUND');
  }
}

/**
 * Get all patients (users with role='user')
 *
 * Returns ALL users in the system who have role='user' or no role set (defaults to 'user').
 * This allows physicians to see all available patients in the system.
 *
 * Results are sorted by name for consistent ordering
 *
 * @param physicianId - The physician's user ID (not used in filtering, kept for future use)
 * @returns Array of all patient user objects
 */
export async function getPatientsForPhysician(physicianId: string) {
  const db = getMongoDbInstance();
  const userCollection = db.collection('user');

  // Get all users who are NOT physicians
  // This includes users with role='user' or users with no role field (default is 'user')
  const patients = await userCollection
    .find({
      $or: [
        { role: 'user' },
        { role: { $exists: false } },  // Users without role field (default to 'user')
        { role: null }                 // Users with null role
      ]
    })
    .sort({ name: 1 })
    .toArray();

  return patients;
}
