import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';
import { deleteFile } from '@/lib/cloudinary';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = (await params).id;
    await dbConnect();

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // Fetch all files associated with this room from both collections
    const adminFiles = await File.find({ roomId: id });
    const userFiles = await UserUpload.find({ roomId: id });

    // Cascade delete files from Cloudinary and MongoDB
    for (const file of adminFiles) {
      try {
        await deleteFile(file.publicId, file.fileType);
      } catch (err) {
        console.error(`Failed to delete file ${file.publicId} from Cloudinary`, err);
      }
      await File.findByIdAndDelete(file._id);
    }

    for (const file of userFiles) {
      try {
        await deleteFile(file.publicId, file.fileType);
      } catch (err) {
        console.error(`Failed to delete file ${file.publicId} from Cloudinary`, err);
      }
      await UserUpload.findByIdAndDelete(file._id);
    }

    // Delete the room document
    await Room.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Room and all associated files deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting room', error: error.message }, { status: 500 });
  }
}
