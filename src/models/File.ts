import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
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
  createdAt: Date;
}

const FileSchema: Schema = new Schema({
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
  approved: { type: Boolean, default: true },
  uploadedBy: { type: String, enum: ['admin', 'user'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema, 'files');
