import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserUpload from '@/models/UserUpload';
import { uploadFileStream } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const search = req.nextUrl.searchParams.get('search') || '';
    const department = req.nextUrl.searchParams.get('department') || '';
    const semester = req.nextUrl.searchParams.get('semester') || '';
    const subject = req.nextUrl.searchParams.get('subject') || '';

    const filter: any = { approved: true };
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const uploads = await UserUpload.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ uploads });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching user uploads', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    const cloudinaryResult = await uploadFileStream(buffer, file.name, 'user_uploads');

    // Create database document in user_uploads collection
    const newUserUpload = await UserUpload.create({
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
      approved: false, // Requires admin approval
      uploadedBy: 'user',
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully and is pending admin approval.',
        file: newUserUpload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Error uploading file', error: error.message }, { status: 500 });
  }
}
