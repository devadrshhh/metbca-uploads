import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';
import { uploadFileStream, deleteFile } from '@/lib/cloudinary';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = (await params).id;
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const subject = formData.get('subject') as string;
    const newFile = formData.get('file') as any;

    if (!title || !department || !semester || !subject) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find the file in either collection
    let fileDoc = await File.findById(id);
    let isUserUpload = false;

    if (!fileDoc) {
      fileDoc = await UserUpload.findById(id);
      isUserUpload = true;
    }

    if (!fileDoc) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    let fileUrl = fileDoc.fileUrl;
    let publicId = fileDoc.publicId;
    let fileType = fileDoc.fileType;
    let fileSize = fileDoc.fileSize;

    // If there is a new file to replace
    if (newFile && typeof newFile !== 'string') {
      // 1. Delete old file from Cloudinary
      try {
        await deleteFile(fileDoc.publicId, fileDoc.fileType);
      } catch (err) {
        console.error('Failed to delete old file from Cloudinary', err);
      }

      // 2. Upload new file
      const bytes = await newFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cloudinaryResult = await uploadFileStream(
        buffer,
        newFile.name,
        isUserUpload ? 'user_uploads' : 'admin_uploads'
      );

      fileUrl = cloudinaryResult.url;
      publicId = cloudinaryResult.publicId;
      fileType = cloudinaryResult.fileType;
      fileSize = cloudinaryResult.fileSize;
    }

    // Update document
    const updateData = {
      title,
      description,
      department,
      semester,
      subject,
      fileUrl,
      publicId,
      fileType,
      fileSize,
    };

    let updatedDoc;
    if (isUserUpload) {
      updatedDoc = await UserUpload.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      updatedDoc = await File.findByIdAndUpdate(id, updateData, { new: true });
    }

    return NextResponse.json({ message: 'File updated successfully', file: updatedDoc });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating file', error: error.message }, { status: 500 });
  }
}

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

    // Find the file in either collection
    let fileDoc = await File.findById(id);
    let isUserUpload = false;

    if (!fileDoc) {
      fileDoc = await UserUpload.findById(id);
      isUserUpload = true;
    }

    if (!fileDoc) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await deleteFile(fileDoc.publicId, fileDoc.fileType);
    } catch (err) {
      console.error('Failed to delete file from Cloudinary', err);
    }

    // Delete from MongoDB
    if (isUserUpload) {
      await UserUpload.findByIdAndDelete(id);
    } else {
      await File.findByIdAndDelete(id);
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting file', error: error.message }, { status: 500 });
  }
}
