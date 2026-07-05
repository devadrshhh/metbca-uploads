import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // Fetch files in the room from files (admin-added) and user_uploads (user-submitted) collections
    const files = await File.find({ roomId: id }).sort({ createdAt: -1 });
    const userUploads = await UserUpload.find({ roomId: id }).sort({ createdAt: -1 });

    // Combine files
    const allFiles = [
      ...files.map(f => ({ ...f.toObject(), category: 'admin' })),
      ...userUploads.map(f => ({ ...f.toObject(), category: 'user' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      room,
      files: allFiles,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch room details', error: error.message }, { status: 500 });
  }
}
