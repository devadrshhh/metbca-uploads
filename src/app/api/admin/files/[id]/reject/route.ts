import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';
import { deleteFile } from '@/lib/cloudinary';

export async function POST(
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

    const fileDoc = await UserUpload.findById(id);
    if (!fileDoc) {
      return NextResponse.json({ message: 'User upload not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await deleteFile(fileDoc.publicId, fileDoc.fileType);
    } catch (err) {
      console.error('Failed to delete file from Cloudinary', err);
    }

    // Delete from MongoDB
    await UserUpload.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Upload rejected and deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error rejecting upload', error: error.message }, { status: 500 });
  }
}
