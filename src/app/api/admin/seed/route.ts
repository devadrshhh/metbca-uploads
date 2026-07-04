import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const reset = req.nextUrl.searchParams.get('reset') === 'true';
    const adminExists = await Admin.findOne();
    
    if (adminExists && !reset) {
      return NextResponse.json({ message: 'Admin already initialized. Pass ?reset=true to override/reset password.' }, { status: 400 });
    }

    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || 'devadarshb01';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // Delete any existing admins if reset is requested
    if (reset) {
      await Admin.deleteMany({});
    }

    const newAdmin = await Admin.create({
      username: 'admin',
      passwordHash,
    });

    return NextResponse.json({
      message: reset ? 'Admin password successfully reset' : 'Admin successfully initialized',
      username: 'admin',
      id: newAdmin._id,
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error initializing admin', error: error.message }, { status: 500 });
  }
}
