import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';
import UserUpload from '@/models/UserUpload';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const search = req.nextUrl.searchParams.get('search') || '';
    const department = req.nextUrl.searchParams.get('department') || '';
    const semester = req.nextUrl.searchParams.get('semester') || '';
    const subject = req.nextUrl.searchParams.get('subject') || '';

    const filter: any = {};
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

    // Fetch files from 'files' collection (which are admin files, default approved: true)
    const adminFiles = await File.find(filter).sort({ createdAt: -1 });

    // Fetch approved user uploads
    const userUploadsFilter = { ...filter, approved: true };
    const userFiles = await UserUpload.find(userUploadsFilter).sort({ createdAt: -1 });

    // Merge and sort by createdAt descending
    const allFiles = [...adminFiles, ...userFiles].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ files: allFiles });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching files', error: error.message }, { status: 500 });
  }
}
