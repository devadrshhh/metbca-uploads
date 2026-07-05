import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    await dbConnect();

    let fileDoc = null;
    if (collection === 'files') {
      fileDoc = await File.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
    } else if (collection === 'user_uploads') {
      fileDoc = await UserUpload.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
    }

    if (!fileDoc) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    // Redirect the user directly to the public Cloudinary asset URL
    return NextResponse.redirect(fileDoc.fileUrl);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error processing download', error: error.message }, { status: 500 });
  }
}
