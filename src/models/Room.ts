import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  description?: string;
  author?: string;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema, 'rooms');
