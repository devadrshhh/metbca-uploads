import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const adminFilesCount = await File.countDocuments();
    const approvedUserUploadsCount = await UserUpload.countDocuments({ approved: true });
    const pendingUserUploadsCount = await UserUpload.countDocuments({ approved: false });

    const fileDownloads = await File.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]);
    const userDownloads = await UserUpload.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]);
    const totalDownloads = (fileDownloads[0]?.total || 0) + (userDownloads[0]?.total || 0);

    const fileStorage = await File.aggregate([{ $group: { _id: null, total: { $sum: '$fileSize' } } }]);
    const userStorage = await UserUpload.aggregate([{ $group: { _id: null, total: { $sum: '$fileSize' } } }]);
    const totalStorageBytes = (fileStorage[0]?.total || 0) + (userStorage[0]?.total || 0);

    return NextResponse.json({
      adminFilesCount,
      approvedUserUploadsCount,
      pendingUserUploadsCount,
      totalDownloads,
      storageBytes: totalStorageBytes,
      storageFormatted: formatBytes(totalStorageBytes),
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching stats', error: error.message }, { status: 500 });
  }
}
