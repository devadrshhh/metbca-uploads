import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const rooms = await Room.find({}).sort({ createdAt: -1 });

    // Enrich rooms with their respective file counts
    const enrichedRooms = await Promise.all(
      rooms.map(async (room) => {
        const fileCount = await File.countDocuments({ roomId: room._id });
        const userUploadCount = await UserUpload.countDocuments({ roomId: room._id });
        return {
          ...room.toObject(),
          fileCount: fileCount + userUploadCount,
        };
      })
    );

    return NextResponse.json(enrichedRooms);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch rooms', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, description, author } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Room name is required' }, { status: 400 });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || '',
      author: author?.trim() || '',
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create room', error: error.message }, { status: 500 });
  }
}
