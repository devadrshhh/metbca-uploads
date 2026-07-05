import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import File from '@/models/File';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const search = req.nextUrl.searchParams.get('search') || '';
    const department = req.nextUrl.searchParams.get('department') || '';
    const semester = req.nextUrl.searchParams.get('semester') || '';
    const subject = req.nextUrl.searchParams.get('subject') || '';

    // Exclude room-specific files from general files list
    const filter: any = {
      $and: [
        { $or: [{ roomId: null }, { roomId: { $exists: false } }] }
      ]
    };

    if (department) filter.$and.push({ department });
    if (semester) filter.$and.push({ semester });
    if (subject) filter.$and.push({ subject });

    if (search) {
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      });
    }

    // Fetch files from 'files' collection (which are admin files, default approved: true)
    const adminFiles = await File.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ files: adminFiles });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching files', error: error.message }, { status: 500 });
  }
}
