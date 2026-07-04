import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserUpload from '@/models/UserUpload';
import { getAdminSession } from '@/lib/auth';

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

    const updatedUpload = await UserUpload.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!updatedUpload) {
      return NextResponse.json({ message: 'User upload not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Upload approved successfully', file: updatedUpload });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error approving upload', error: error.message }, { status: 500 });
  }
}
