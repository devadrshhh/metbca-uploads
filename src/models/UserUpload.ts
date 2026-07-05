import mongoose, { Schema, Document } from 'mongoose';

export interface IUserUpload extends Document {
  title: string;
  description?: string;
  department: string;
  semester: string;
  subject: string;
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  downloads: number;
  approved: boolean;
  uploadedBy: 'admin' | 'user';
  roomId?: string;
  createdAt: Date;
}

const UserUploadSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  downloads: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  uploadedBy: { type: String, enum: ['admin', 'user'], default: 'user' },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserUpload || mongoose.model<IUserUpload>('UserUpload', UserUploadSchema, 'user_uploads');
