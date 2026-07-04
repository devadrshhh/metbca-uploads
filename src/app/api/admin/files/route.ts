import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';
import { uploadFileStream } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const search = req.nextUrl.searchParams.get('search') || '';
    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const adminFiles = await File.find(filter).sort({ createdAt: -1 });
    const userUploads = await UserUpload.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ adminFiles, userUploads });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching files', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const subject = formData.get('subject') as string;
    const file = formData.get('file') as any;

    if (!title || !department || !semester || !subject || !file) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadFileStream(buffer, file.name, 'admin_uploads');

    // Create database document in files collection
    const newFile = await File.create({
      title,
      description,
      department,
      semester,
      subject,
      fileUrl: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      fileType: cloudinaryResult.fileType,
      fileSize: cloudinaryResult.fileSize,
      downloads: 0,
      approved: true,
      uploadedBy: 'admin',
    });

    return NextResponse.json({ message: 'File uploaded successfully', file: newFile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error uploading file', error: error.message }, { status: 500 });
  }
}
