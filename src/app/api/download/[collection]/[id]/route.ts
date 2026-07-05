import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'zip': 'application/zip',
    'rar': 'application/vnd.rar',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

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

    // Fetch the file from Cloudinary on the server side
    const fileResponse = await fetch(fileDoc.fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from Cloudinary: ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Reconstruct the original filename using clean name and extension
    const baseName = fileDoc.publicId.split('/').pop() || 'file';
    const extension = fileDoc.fileType.toLowerCase();
    const filename = `${baseName}.${extension}`;

    // Get the corresponding content-type
    const contentType = getMimeType(extension);

    // Stream file data back to the user
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error processing download', error: error.message }, { status: 500 });
  }
}
