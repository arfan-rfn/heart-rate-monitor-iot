import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecording extends Document {
  zip: number;
  airQuality: number;
}

const recordingSchema = new Schema<IRecording>({
  zip: { type: Number },
  airQuality: { type: Number },
});

// Index for faster queries by zip
recordingSchema.index({ zip: 1 });

export const Recording: Model<IRecording> =
  mongoose.models.Recording || mongoose.model<IRecording>('Recording', recordingSchema);
